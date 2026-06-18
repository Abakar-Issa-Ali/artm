import api from "../config/api";

// Récupère les paiements en attente de validation
export async function getPaiementsEnAttente() {
  const reponse = await api.get("/paiements/en-attente");
  return reponse.data;
}

// Valide un paiement
export async function validerPaiement(paiementId: number) {
  const reponse = await api.patch(`/paiements/${paiementId}/valider`);
  return reponse.data;
}

// Rejette un paiement
export async function rejeterPaiement(paiementId: number) {
  const reponse = await api.patch(`/paiements/${paiementId}/rejeter`);
  return reponse.data;
}

// Publie une annonce
export async function publierAnnonce(titre: string, contenu: string) {
  const reponse = await api.post("/annonces", { titre, contenu });
  return reponse.data;
}
// Récupère la liste de tous les membres avec leur statut
export async function getMembres() {
  const reponse = await api.get("/membres");
  return reponse.data;
}