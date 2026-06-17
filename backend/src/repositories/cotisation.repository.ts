import prisma from "../config/prisma.js";

// Récupère toutes les cotisations d'un membre, triées par date
export async function findByMembre(membreId: number) {
  return prisma.cotisation.findMany({
    where: { membreId },
    orderBy: [{ annee: "desc" }, { mois: "desc" }],
    include: { paiement: true },
  });
}

// Vérifie si une échéance existe déjà pour un membre sur un mois/année
export async function findPeriode(membreId: number, mois: number, annee: number) {
  return prisma.cotisation.findUnique({
    where: {
      uq_cotisation_periode: { membreId, mois, annee },
    },
  });
}

// Crée une échéance de cotisation
export async function create(data: {
  membreId: number;
  mois: number;
  annee: number;
  montant: number;
  dateEcheance: Date;
  statut: string;
}) {
  return prisma.cotisation.create({ data });
}

// Met à jour le statut d'une cotisation
export async function updateStatut(id: number, statut: string) {
  return prisma.cotisation.update({
    where: { id },
    data: { statut },
  });
}