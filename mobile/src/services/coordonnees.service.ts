import api from "../config/api";

// Récupère les coordonnées de paiement de l'association
export async function getCoordonnees() {
  const { data } = await api.get("/coordonnees");
  return data;
}

// Met à jour les coordonnées (trésorier uniquement)
export async function updateCoordonnees(data: {
  iban?: string;
  titulaire?: string;
  reference?: string;
  numeroWero?: string;
  noteCarte?: string;
}) {
  const reponse = await api.put("/coordonnees", data);
  return reponse.data;
}