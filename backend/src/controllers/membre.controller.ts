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