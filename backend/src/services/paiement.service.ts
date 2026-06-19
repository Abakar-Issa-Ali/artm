import prisma from "../config/prisma.js";
import * as paiementRepo from "../repositories/paiement.repository.js";
import * as recuRepo from "../repositories/recu.repository.js";
import * as notificationRepo from "../repositories/notification.repository.js";
import { genererNumeroRecu } from "../utils/cotisation.utils.js";

// Modes de paiement autorisés
const MODES_AUTORISES = ["virement", "wero", "stripe"];

// --- DÉCLARATION par le membre ---
export async function declarerPaiement(
  membreId: number,
  cotisationId: number,
  mode: string
) {
  // Vérifie le mode
  if (!MODES_AUTORISES.includes(mode)) {
    throw new Error("Mode de paiement invalide");
  }

  // Vérifie que la cotisation existe et appartient bien au membre
  const cotisation = await prisma.cotisation.findUnique({
    where: { id: cotisationId },
    include: { paiement: true },
  });
  if (!cotisation) {
    throw new Error("Cotisation introuvable");
  }
  if (cotisation.membreId !== membreId) {
    throw new Error("Cette cotisation ne vous appartient pas");
  }
  // Vérifie qu'il n'y a pas déjà un paiement (RG3)
  if (cotisation.paiement) {
    throw new Error("Un paiement existe déjà pour cette cotisation");
  }
  // On ne paie pas une cotisation déjà payée
  if (cotisation.statut === "payee") {
    throw new Error("Cette cotisation est déjà payée");
  }

  // Crée le paiement au statut "declare" et passe la cotisation "en_attente"
  const paiement = await paiementRepo.create({
    membreId,
    cotisationId,
    montant: Number(cotisation.montant),
    mode,
    statut: "declare",
  });

  await prisma.cotisation.update({
    where: { id: cotisationId },
    data: { statut: "en_attente" },
  });

  return paiement;
}

// --- VALIDATION par le trésorier ---
export async function validerPaiement(paiementId: number) {
  const paiement = await paiementRepo.findById(paiementId);
  if (!paiement) {
    throw new Error("Paiement introuvable");
  }
  if (paiement.statut !== "declare") {
    throw new Error("Ce paiement n'est pas en attente de validation");
  }

 // Passe le paiement à "valide" et récupère la version à jour
  const paiementValide = await paiementRepo.updateStatut(paiementId, "valide", new Date());
  // Passe la cotisation à "payee"
  await prisma.cotisation.update({
    where: { id: paiement.cotisationId },
    data: { statut: "payee" },
  });

  // Génère un reçu unique (RG6)
  const numero = genererNumeroRecu(
    paiement.cotisation.annee,
    paiement.cotisation.mois,
    paiementId
  );

  const recu = await recuRepo.create({ paiementId, numero });
  await notificationRepo.create({
    membreId: paiement.membreId,
    type: "paiement_valide",
    contenu: `Votre paiement de ${paiement.montant}€ pour ${String(
      paiement.cotisation.mois
    ).padStart(2, "0")}/${paiement.cotisation.annee} a été validé. Reçu : ${recu.numero}`,
  });

   return { paiement: paiementValide, recu };
}

// --- REJET par le trésorier ---
export async function rejeterPaiement(paiementId: number) {
  const paiement = await paiementRepo.findById(paiementId);
  if (!paiement) {
    throw new Error("Paiement introuvable");
  }
  if (paiement.statut !== "declare") {
    throw new Error("Ce paiement n'est pas en attente de validation");
  }

  await paiementRepo.updateStatut(paiementId, "rejete");

  // La cotisation redevient "due" (le membre devra re-déclarer)
  await prisma.cotisation.update({
    where: { id: paiement.cotisationId },
    data: { statut: "due" },
  });
   await notificationRepo.create({
    membreId: paiement.membreId,
    type: "paiement_rejete",
    contenu: `Votre paiement pour ${String(paiement.cotisation.mois).padStart(
      2,
      "0"
    )}/${paiement.cotisation.annee} a été rejeté. Merci de le redéclarer.`,
  });

  return { message: "Paiement rejeté" };
}

// --- LISTE des paiements en attente (trésorier) ---
export async function getPaiementsEnAttente() {
  return paiementRepo.findEnAttente();
}