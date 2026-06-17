import prisma from "../config/prisma.js";

// Crée un reçu pour un paiement
export async function create(data: { paiementId: number; numero: string }) {
  return prisma.recu.create({ data });
}

// Récupère le reçu d'un paiement
export async function findByPaiement(paiementId: number) {
  return prisma.recu.findUnique({
    where: { paiementId },
  });
}