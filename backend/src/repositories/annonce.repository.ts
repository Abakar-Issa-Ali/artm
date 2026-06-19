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
// Met à jour une annonce
export async function update(id: string, data: { titre: string; contenu: string }) {
  return Annonce.findByIdAndUpdate(id, data, { new: true });
}

// Supprime une annonce
export async function remove(id: string) {
  return Annonce.findByIdAndDelete(id);
}