import { Request, Response } from "express";
import * as authService from "../services/auth.service.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import { demanderReset, reinitialiserMotDePasse } from "../services/auth.service.js";

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
export async function motDePasseOublie(req: Request, res: Response) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "L'email est requis." });
    }
    await demanderReset(email);
    // On répond toujours pareil, que l'email existe ou non (sécurité)
    return res.status(200).json({ message: "Si un compte existe, un code a été envoyé par email." });
  } catch (error) {
    console.error("Erreur motDePasseOublie", error);
    return res.status(500).json({ error: "Erreur lors de l'envoi du code." });
  }
}

export async function reinitialiser(req: Request, res: Response) {
  try {
    const { email, code, nouveauMotDePasse } = req.body;
    if (!email || !code || !nouveauMotDePasse) {
      return res.status(400).json({ error: "Email, code et nouveau mot de passe sont requis." });
    }
    await reinitialiserMotDePasse(email, code, nouveauMotDePasse);
    return res.status(200).json({ message: "Mot de passe réinitialisé avec succès." });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || "Réinitialisation impossible." });
  }
}