import { Response } from "express";
import * as membreService from "../services/membre.service.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";

export async function liste(_req: AuthRequest, res: Response) {
  try {
    const membres = await membreService.getTousMembres();
    return res.status(200).json(membres);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur";
    return res.status(400).json({ error: message });
  }
}
// Change le rôle d'un membre
export async function changerRole(req: AuthRequest, res: Response) {
  try {
    const membreId = Number(req.params.id);
    const { role } = req.body;
    const result = await membreService.changerRole(membreId, role);
    return res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur";
    return res.status(400).json({ error: message });
  }
}

// Désactive un membre
export async function desactiver(req: AuthRequest, res: Response) {
  try {
    const result = await membreService.desactiverMembre(Number(req.params.id));
    return res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur";
    return res.status(400).json({ error: message });
  }
}

// Réactive un membre
export async function reactiver(req: AuthRequest, res: Response) {
  try {
    const result = await membreService.reactiverMembre(Number(req.params.id));
    return res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur";
    return res.status(400).json({ error: message });
  }
}

// Supprime définitivement un membre
export async function supprimer(req: AuthRequest, res: Response) {
  try {
    const result = await membreService.supprimerMembre(Number(req.params.id));
    return res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur";
    return res.status(400).json({ error: message });
  }
}
export async function resume(_req: AuthRequest, res: Response) {
  try {
    const data = await membreService.getResume();
    return res.status(200).json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur";
    return res.status(400).json({ error: message });
  }
}

export async function relancer(req: AuthRequest, res: Response) {
  try {
    const result = await membreService.relancerMembre(Number(req.params.id));
    return res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur";
    return res.status(400).json({ error: message });
  }
}
// Le membre connecté supprime son propre compte (droit à l'effacement RGPD)
export async function supprimerMonCompte(req: AuthRequest, res: Response) {
  try {
    const membreId = req.membre?.id;
    if (!membreId) {
      return res.status(401).json({ error: "Non authentifié" });
    }
    const resultat = await membreService.supprimerSonCompte(membreId);
    return res.status(200).json(resultat);
  } catch (error: any) {
    console.error("Erreur supprimerMonCompte", error);
    return res.status(400).json({ error: error.message || "Suppression impossible" });
  }
}