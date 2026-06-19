import * as annonceRepo from "../repositories/annonce.repository.js";

export async function modifierAnnonce(id: string, titre: string, contenu: string) {
  if (!titre?.trim() || !contenu?.trim()) {
    throw new Error("Titre et contenu requis");
  }
  const annonce = await annonceRepo.update(id, { titre, contenu });
  if (!annonce) {
    throw new Error("Annonce introuvable");
  }
  return annonce;
}

export async function supprimerAnnonce(id: string) {
  const annonce = await annonceRepo.remove(id);
  if (!annonce) {
    throw new Error("Annonce introuvable");
  }
  return { message: "Annonce supprimée" };
}