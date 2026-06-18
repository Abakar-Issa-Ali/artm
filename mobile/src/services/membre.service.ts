import api from "../config/api";

// Met à jour le profil du membre connecté
export async function updateProfil(data: { nom: string; prenom: string; telephone: string }) {
  const reponse = await api.patch("/auth/me", data);
  return reponse.data;
}