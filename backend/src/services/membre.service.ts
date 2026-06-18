import prisma from "../config/prisma.js";
import * as notificationRepo from "../repositories/notification.repository.js";

// Récupère tous les membres actifs avec un résumé de leur statut de cotisation
export async function getTousMembres() {
  const membres = await prisma.membre.findMany({

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
    // 1. Les reçus liés aux paiements du membre
    const paiements = await tx.paiement.findMany({ where: { membreId } });
    const paiementIds = paiements.map((p) => p.id);
    if (paiementIds.length > 0) {
      await tx.recu.deleteMany({ where: { paiementId: { in: paiementIds } } });
    }
    // 2. Les paiements
    await tx.paiement.deleteMany({ where: { membreId } });
    // 3. Les cotisations
    await tx.cotisation.deleteMany({ where: { membreId } });
    // 4. Le membre lui-même
    await tx.membre.delete({ where: { id: membreId } });
  });
  return { message: "Membre supprimé définitivement" };
}
// Calcule un résumé global pour le tableau de bord trésorier
export async function getResume() {
  const membresActifs = await prisma.membre.count({ where: { actif: true } });

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