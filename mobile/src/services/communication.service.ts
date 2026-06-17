import api from "../config/api";

// Récupère les annonces du bureau
export async function getAnnonces() {
  const reponse = await api.get("/annonces");
  return reponse.data;
}

// Récupère les notifications personnelles du membre
export async function getNotifications() {
  const reponse = await api.get("/notifications/me");
  return reponse.data;
}