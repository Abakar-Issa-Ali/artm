import { Request, Response } from "express";
import * as authService from "../services/auth.service.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";

export async function register(req: Request, res: Response) {
  try {
    const result = await authService.register(req.body);
    return res.status(201).json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur lors de l'inscription";
    return res.status(400).json({ error: message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const result = await authService.login(req.body);
    return res.status(200).json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur lors de la connexion";
    return res.status(401).json({ error: message });
  }
}
export async function me(req: AuthRequest, res: Response) {
  try {
    const profile = await authService.getProfile(req.membre!.id);
    return res.status(200).json(profile);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur lors de la récupération";
    return res.status(404).json({ error: message });
  }
}
export async function updateMe(req: AuthRequest, res: Response) {
  try {
    const { nom, prenom, telephone } = req.body;
    const profile = await authService.updateProfile(req.membre!.id, { nom, prenom, telephone });
    return res.status(200).json(profile);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur lors de la mise à jour";
    return res.status(400).json({ error: message });
  }
}