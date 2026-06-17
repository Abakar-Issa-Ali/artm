import { Response } from "express";
import * as annonceRepo from "../repositories/annonce.repository.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";

// Publie une annonce (réservé au bureau/trésorier)
export async function publier(req: AuthRequest, res: Response) {
  try {
    const { titre, contenu } = req.body;
    if (!titre || !contenu) {
      return res.status(400).json({ error: "Titre et contenu requis" });
    }
    const annonce = await annonceRepo.create({
      auteurId: req.membre!.id,
      titre,
      contenu,
    });
    return res.status(201).json(annonce);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur lors de la publication";
    return res.status(400).json({ error: message });
  }
}

// Liste toutes les annonces (tous les membres connectés)
export async function lister(_req: AuthRequest, res: Response) {
  try {
    const annonces = await annonceRepo.findAll();
    return res.status(200).json(annonces);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur lors de la récupération";
    return res.status(400).json({ error: message });
  }
}