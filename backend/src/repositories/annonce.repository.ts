import { Annonce } from "../models/annonce.model.js";

// Crée une annonce
export async function create(data: {
  auteurId: number;
  titre: string;
  contenu: string;
}) {
  return Annonce.create(data);
}

// Récupère toutes les annonces (les plus récentes d'abord)
export async function findAll() {
  return Annonce.find().sort({ datePublication: -1 });
}