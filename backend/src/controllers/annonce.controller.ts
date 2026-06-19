import { Response } from "express";
import * as annonceRepo from "../repositories/annonce.repository.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import * as annonceService from "../services/annonce.service.js";

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
// Modifier une annonce
export async function modifier(req: AuthRequest, res: Response) {
  try {
    const { titre, contenu } = req.body;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const annonce = await annonceService.modifierAnnonce(id, titre, contenu);
    return res.status(200).json(annonce);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur lors de la modification";
    return res.status(400).json({ error: message });
  }
}

// Supprimer une annonce
export async function supprimer(req: AuthRequest, res: Response) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await annonceService.supprimerAnnonce(id);
    return res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur lors de la suppression";
    return res.status(400).json({ error: message });
  }
}