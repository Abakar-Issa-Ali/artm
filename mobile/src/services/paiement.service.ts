import api from "../config/api";

// Déclare un paiement sur une échéance
export async function declarerPaiement(cotisationId: number, mode: string) {
  const reponse = await api.post("/paiements/declarer", { cotisationId, mode });
  return reponse.data;
}