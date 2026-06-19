import api from "../config/api";

// Génère les échéances manquantes du membre connecté
export async function genererEcheances() {
  const reponse = await api.post("/cotisations/generer");
  return reponse.data;
}

// Récupère les cotisations du membre connecté avec le résumé
export async function getMesCotisations() {
  const reponse = await api.get("/cotisations/me");
  return reponse.data;
}