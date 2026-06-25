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
// Modifie une annonce
export async function modifierAnnonce(id: string, titre: string, contenu: string) {
  const reponse = await api.patch(`/annonces/${id}`, { titre, contenu });
  return reponse.data;
}

// Supprime une annonce
export async function supprimerAnnonce(id: string) {
  const reponse = await api.delete(`/annonces/${id}`);
  return reponse.data;
}
export async function changerRole(membreId: number, role: string) {
  const reponse = await api.patch(`/membres/${membreId}/role`, { role });
  return reponse.data;
}

export async function desactiverMembre(membreId: number) {
  const reponse = await api.patch(`/membres/${membreId}/desactiver`);
  return reponse.data;
}

export async function reactiverMembre(membreId: number) {
  const reponse = await api.patch(`/membres/${membreId}/reactiver`);
  return reponse.data;
}

export async function supprimerMembre(membreId: number) {
  const reponse = await api.delete(`/membres/${membreId}`);
  return reponse.data;
}
// Récupère le résumé du tableau de bord
export async function getResume() {
  const reponse = await api.get("/membres/resume");
  return reponse.data;
}

// Envoie une relance à un membre
export async function relancerMembre(membreId: number) {
  const reponse = await api.post(`/membres/${membreId}/relancer`);
  return reponse.data;
}
// Liste les comptes en attente de validation
export async function getComptesEnAttente() {
  const { data } = await api.get("/membres/en-attente");
  return data;
}

// Valide le compte d'un membre en attente
export async function validerCompte(membreId: number) {
  const { data } = await api.patch(`/membres/${membreId}/valider`);
  return data;
}