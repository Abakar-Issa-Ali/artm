import { Request, Response } from "express";
import { getCoordonnees, updateCoordonnees } from "../services/coordonnees.service.js";

// Lecture des coordonnées (accessible à tout membre connecté)
export async function lireCoordonnees(req: Request, res: Response) {
  try {
    const coordonnees = await getCoordonnees();
    return res.status(200).json(coordonnees);
  } catch (error) {
    console.error("Erreur lireCoordonnees", error);
    return res.status(500).json({ error: "Erreur lors de la récupération des coordonnées." });
  }
}

// Mise à jour des coordonnées (réservé au trésorier)
export async function majCoordonnees(req: Request, res: Response) {
  try {
    const { iban, titulaire, reference, numeroWero, noteCarte } = req.body;
    const coordonnees = await updateCoordonnees({ iban, titulaire, reference, numeroWero, noteCarte });
    return res.status(200).json(coordonnees);
  } catch (error) {
    console.error("Erreur majCoordonnees", error);
    return res.status(400).json({ error: "Mise à jour impossible." });
  }
}