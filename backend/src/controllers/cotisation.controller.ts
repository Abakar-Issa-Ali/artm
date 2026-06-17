import { Response } from "express";
import * as cotisationService from "../services/cotisation.service.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";

// Génère les échéances manquantes du membre connecté
export async function generer(req: AuthRequest, res: Response) {
  try {
    const echeances = await cotisationService.genererEcheances(req.membre!.id);
    return res.status(201).json({
      message: `${echeances.length} échéance(s) générée(s)`,
      echeances,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur lors de la génération";
    return res.status(400).json({ error: message });
  }
}

// Récupère les cotisations du membre connecté
export async function mesCotisations(req: AuthRequest, res: Response) {
  try {
    const result = await cotisationService.getCotisationsMembre(req.membre!.id);
    return res.status(200).json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur lors de la récupération";
    return res.status(400).json({ error: message });
  }
}