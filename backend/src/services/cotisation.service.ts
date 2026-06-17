import * as cotisationRepo from "../repositories/cotisation.repository.js";
import prisma from "../config/prisma.js";

// Génère les échéances manquantes d'un membre, de son adhésion au mois courant
export async function genererEcheances(membreId: number) {
  const membre = await prisma.membre.findUnique({
    where: { id: membreId },
    include: { role: true },
  });
  if (!membre) {
    throw new Error("Membre introuvable");
  }

  const montant = Number(membre.role.montantCotisation);
  const debut = new Date(membre.dateAdhesion);
  const maintenant = new Date();

  const echeancesCreees = [];

  // Parcourt chaque mois entre l'adhésion et aujourd'hui
  let annee = debut.getFullYear();
  let mois = debut.getMonth() + 1; // getMonth() est 0-indexé

  while (
    annee < maintenant.getFullYear() ||
    (annee === maintenant.getFullYear() && mois <= maintenant.getMonth() + 1)
  ) {
    // Vérifie si l'échéance existe déjà (évite les doublons)
    const existante = await cotisationRepo.findPeriode(membreId, mois, annee);

    if (!existante) {
      // Date limite = dernier jour du mois
      const dateEcheance = new Date(annee, mois, 0); // jour 0 du mois suivant = dernier jour

      // Statut initial : "en_retard" si le mois est passé, sinon "due"
      const moisPasse =
        annee < maintenant.getFullYear() ||
        (annee === maintenant.getFullYear() && mois < maintenant.getMonth() + 1);
      const statut = moisPasse ? "en_retard" : "due";

      const echeance = await cotisationRepo.create({
        membreId,
        mois,
        annee,
        montant,
        dateEcheance,
        statut,
      });
      echeancesCreees.push(echeance);
    }

    // Mois suivant
    mois++;
    if (mois > 12) {
      mois = 1;
      annee++;
    }
  }

  return echeancesCreees;
}

// Récupère toutes les cotisations d'un membre avec un résumé de son statut
export async function getCotisationsMembre(membreId: number) {
  const cotisations = await cotisationRepo.findByMembre(membreId);

  const enRetard = cotisations.filter((c) => c.statut === "en_retard").length;
  const aJour = enRetard === 0;

  return {
    aJour,
    nombreEnRetard: enRetard,
    cotisations,
  };
}