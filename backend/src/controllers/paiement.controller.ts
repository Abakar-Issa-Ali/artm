import { Response } from "express";
import * as paiementService from "../services/paiement.service.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";

// Le membre déclare un paiement
export async function declarer(req: AuthRequest, res: Response) {
  try {
    const { cotisationId, mode } = req.body;
    const paiement = await paiementService.declarerPaiement(
      req.membre!.id,
      cotisationId,
      mode
    );
    return res.status(201).json({
      message: "Paiement déclaré, en attente de validation",
      paiement,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur lors de la déclaration";
    return res.status(400).json({ error: message });
  }
}

// Le trésorier valide un paiement
export async function valider(req: AuthRequest, res: Response) {
  try {
    const paiementId = Number(req.params.id);
    const result = await paiementService.validerPaiement(paiementId);
    return res.status(200).json({
      message: "Paiement validé, reçu généré",
      ...result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur lors de la validation";
    return res.status(400).json({ error: message });
  }
}

// Le trésorier rejette un paiement
export async function rejeter(req: AuthRequest, res: Response) {
  try {
    const paiementId = Number(req.params.id);
    const result = await paiementService.rejeterPaiement(paiementId);
    return res.status(200).json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur lors du rejet";
    return res.status(400).json({ error: message });
  }
}

// Le trésorier liste les paiements en attente
export async function enAttente(_req: AuthRequest, res: Response) {
  try {
    const paiements = await paiementService.getPaiementsEnAttente();
    return res.status(200).json(paiements);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur lors de la récupération";
    return res.status(400).json({ error: message });
  }
}