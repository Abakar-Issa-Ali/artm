import { Response } from "express";
import * as notificationRepo from "../repositories/notification.repository.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";

// Récupère les notifications du membre connecté
export async function mesNotifications(req: AuthRequest, res: Response) {
  try {
    const notifications = await notificationRepo.findByMembre(req.membre!.id);
    return res.status(200).json(notifications);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur lors de la récupération";
    return res.status(400).json({ error: message });
  }
}

// Marque une notification comme lue
export async function marquerLue(req: AuthRequest, res: Response) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const notification = await notificationRepo.marquerLue(id);
    return res.status(200).json(notification);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur lors de la mise à jour";
    return res.status(400).json({ error: message });
  }
}