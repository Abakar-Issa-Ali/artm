import { Request, Response } from "express";
import * as authService from "../services/auth.service.js";

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