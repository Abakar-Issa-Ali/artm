import prisma from "../config/prisma.js";

// Récupère tous les membres actifs avec un résumé de leur statut de cotisation
export async function getTousMembres() {
  const membres = await prisma.membre.findMany({
    where: { actif: true },
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
      aJour: enRetard === 0,
      nombreEnRetard: enRetard,
    };
  });
}