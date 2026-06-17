import { Notification } from "../models/notification.model.js";

// Crée une notification
export async function create(data: {
  membreId: number;
  type: string;
  contenu: string;
}) {
  return Notification.create(data);
}

// Récupère les notifications d'un membre (les plus récentes d'abord)
export async function findByMembre(membreId: number) {
  return Notification.find({ membreId }).sort({ dateCreation: -1 });
}

// Marque une notification comme lue
export async function marquerLue(id: string) {
  return Notification.findByIdAndUpdate(id, { lu: true }, { new: true });
}