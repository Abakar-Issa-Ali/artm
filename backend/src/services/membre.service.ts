import prisma from "../config/prisma.js";
import * as notificationRepo from "../repositories/notification.repository.js";
import { envoyerConfirmationCompte } from "./email.service.js";

// Récupère tous les membres actifs avec un résumé de leur statut de cotisation
export async function getTousMembres() {
  const membres = await prisma.membre.findMany({
    where: { valide: true },
    include: {
      role: true,
      cotisations: true,
    },
    orderBy: { nom: "asc" },
  });

  // Pour chaque membre, on calcule combien de cotisations sont en retard
  return membres.map((m) => {
    const enRetard = m.cotisations.filter((c) => c.statut === "en_retard").length;
    return {
      id: m.id,
      nom: m.nom,
      prenom: m.prenom,
      email: m.email,
      role: m.role.libelle,
       actif: m.actif,
      aJour: enRetard === 0,
      nombreEnRetard: enRetard,
    };
  });
}
// Change le rôle d'un membre
export async function changerRole(membreId: number, libelleRole: string) {
  const role = await prisma.role.findUnique({ where: { libelle: libelleRole } });
  if (!role) {
    throw new Error("Rôle introuvable");
  }
  const membre = await prisma.membre.update({
    where: { id: membreId },
    data: { roleId: role.id },
    include: { role: true },
  });
  return {
    id: membre.id,
    nom: membre.nom,
    prenom: membre.prenom,
    role: membre.role.libelle,
  };
}

// Désactive un membre (soft delete : ses données restent)
export async function desactiverMembre(membreId: number) {
  await prisma.membre.update({
    where: { id: membreId },
    data: { actif: false },
  });
  return { message: "Membre désactivé" };
}

// Réactive un membre
export async function reactiverMembre(membreId: number) {
  await prisma.membre.update({
    where: { id: membreId },
    data: { actif: true },
  });
  return { message: "Membre réactivé" };
}

// Supprime définitivement un membre et toutes ses données liées
export async function supprimerMembre(membreId: number) {
  // Transaction : on supprime dans l'ordre pour respecter les clés étrangères
  await prisma.$transaction(async (tx) => {
    //  Les reçus liés aux paiements du membre
    const paiements = await tx.paiement.findMany({ where: { membreId } });
    const paiementIds = paiements.map((p) => p.id);
    if (paiementIds.length > 0) {
      await tx.recu.deleteMany({ where: { paiementId: { in: paiementIds } } });
    }
    //  Les paiements
    await tx.paiement.deleteMany({ where: { membreId } });
    //  Les cotisations
    await tx.cotisation.deleteMany({ where: { membreId } });
    //  Le membre lui-même
    await tx.membre.delete({ where: { id: membreId } });
  });
  return { message: "Membre supprimé définitivement" };
}
// Suppression de son propre compte par le membre (droit à l'effacement RGPD)
export async function supprimerSonCompte(membreId: number) {
  // On récupère le membre avant suppression (pour le nom dans la notification)
  const membre = await prisma.membre.findUnique({ where: { id: membreId } });
  if (!membre) {
    throw new Error("Membre introuvable");
  }

  // On prévient les trésoriers qu'un membre a quitté l'association
  const tresoriers = await prisma.membre.findMany({
    where: { role: { libelle: "tresorier" }, actif: true },
  });
  for (const tresorier of tresoriers) {
    // On ne se notifie pas soi-même si le trésorier supprime son propre compte
    if (tresorier.id === membreId) continue;
    await notificationRepo.create({
      membreId: tresorier.id,
      type: "depart_membre",
      contenu: `${membre.prenom} ${membre.nom} a supprimé son compte.`,
    });
  }

  // On réutilise la suppression complète existante
  return supprimerMembre(membreId);
}
// Liste les comptes en attente de validation (valide = false)
export async function getComptesEnAttente() {
  const membres = await prisma.membre.findMany({
    where: { valide: false },
    include: { role: true },
    orderBy: { dateAdhesion: "asc" },
  });

  return membres.map((m) => ({
    id: m.id,
    nom: m.nom,
    prenom: m.prenom,
    email: m.email,
    telephone: m.telephone,
    role: m.role.libelle,
    dateAdhesion: m.dateAdhesion,
  }));
}

// Valide le compte d'un membre (le trésorier approuve l'inscription) + email de confirmation
export async function validerCompte(membreId: number) {
  const membre = await prisma.membre.findUnique({ where: { id: membreId } });
  if (!membre) {
    throw new Error("Membre introuvable");
  }
  if (membre.valide) {
    throw new Error("Ce compte est déjà validé");
  }

  // On passe le compte à validé
  await prisma.membre.update({
    where: { id: membreId },
    data: { valide: true },
  });

  // On informe le membre par email qu'il peut se connecter
  try {
    await envoyerConfirmationCompte(membre.email, membre.prenom);
  } catch (error) {
    // L'email ne doit pas bloquer la validation : on log et on continue
    console.error("Erreur envoi email de confirmation", error);
  }

  return { message: "Compte validé" };
}

// Calcule un résumé global pour le tableau de bord trésorier
export async function getResume() {
const membresActifs = await prisma.membre.count({ where: { actif: true, valide: true } });

  // Cotisations du mois courant
  const maintenant = new Date();
  const mois = maintenant.getMonth() + 1;
  const annee = maintenant.getFullYear();

  const cotisationsDuMois = await prisma.cotisation.findMany({
    where: { mois, annee },
  });
  const payees = cotisationsDuMois.filter((c) => c.statut === "payee");
  const totalEncaisse = payees.reduce((s, c) => s + Number(c.montant), 0);
  const tauxPaiement = cotisationsDuMois.length > 0
    ? Math.round((payees.length / cotisationsDuMois.length) * 100)
    : 0;

  return {
    membresActifs,
    totalEncaisse,
    nombrePayees: payees.length,
    nombreTotal: cotisationsDuMois.length,
    tauxPaiement,
  };
}

// Envoie une relance (notification) à un membre en retard
export async function relancerMembre(membreId: number) {
  const membre = await prisma.membre.findUnique({ where: { id: membreId } });
  if (!membre) {
    throw new Error("Membre introuvable");
  }
  await notificationRepo.create({
    membreId,
    type: "relance",
    contenu: "Rappel : vous avez des cotisations en attente de règlement. Merci de régulariser votre situation.",
  });
  return { message: "Relance envoyée" };
}