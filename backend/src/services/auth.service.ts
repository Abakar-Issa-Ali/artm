import prisma from "../config/prisma.js";
import { hashPassword, verifyPassword, generateToken } from "../utils/auth.js";
import { envoyerCodeReinitialisation } from "./email.service";

interface RegisterInput {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  motDePasse: string;
}

interface LoginInput {
  email: string;
  motDePasse: string;
}

// Inscription d'un nouveau membre (rôle "membre" par défaut)
export async function register(input: RegisterInput) {
  // Vérifie que l'email n'est pas déjà utilisé
  const existant = await prisma.membre.findUnique({
    where: { email: input.email },
  });
  if (existant) {
    throw new Error("Un compte existe déjà avec cet email");
  }

  // Récupère le rôle "membre" par défaut
  const roleMembre = await prisma.role.findUnique({
    where: { libelle: "membre" },
  });
  if (!roleMembre) {
    throw new Error("Le rôle par défaut est introuvable");
  }

  // Hache le mot de passe et crée le membre
  const motDePasseHache = await hashPassword(input.motDePasse);
  const membre = await prisma.membre.create({
    data: {
      nom: input.nom,
      prenom: input.prenom,
      email: input.email,
      telephone: input.telephone,
      motDePasse: motDePasseHache,
      roleId: roleMembre.id,
    },
  });

  // Génère le token, sans renvoyer le mot de passe
  const token = generateToken({ id: membre.id, role: roleMembre.libelle });
  return {
    token,
    membre: {
      id: membre.id,
      nom: membre.nom,
      prenom: membre.prenom,
      email: membre.email,
      role: roleMembre.libelle,
    },
  };
}

// Connexion d'un membre existant
export async function login(input: LoginInput) {
  const membre = await prisma.membre.findUnique({
    where: { email: input.email },
    include: { role: true },
  });
  // Message volontairement générique (sécurité : ne pas révéler si l'email existe)
  if (!membre) {
    throw new Error("Email ou mot de passe incorrect");
  }

  

  const motDePasseValide = await verifyPassword(
    input.motDePasse,
    membre.motDePasse
  );
  if (!motDePasseValide) {
    throw new Error("Email ou mot de passe incorrect");
  }

  const token = generateToken({ id: membre.id, role: membre.role.libelle });
  return {
    token,
    membre: {
      id: membre.id,
      nom: membre.nom,
      prenom: membre.prenom,
      email: membre.email,
      role: membre.role.libelle,
    },
  };
}
// Récupère le profil d'un membre par son id
export async function getProfile(membreId: number) {
  const membre = await prisma.membre.findUnique({
    where: { id: membreId },
    include: { role: true },
  });
  if (!membre) {
    throw new Error("Membre introuvable");
  }
  return {
    id: membre.id,
    nom: membre.nom,
    prenom: membre.prenom,
    email: membre.email,
    telephone: membre.telephone,
    role: membre.role.libelle,
    montantCotisation: membre.role.montantCotisation,
    dateAdhesion: membre.dateAdhesion,
  };
}
// Met à jour le profil d'un membre
export async function updateProfile(
  membreId: number,
  data: { nom?: string; prenom?: string; telephone?: string }
) {
  const membre = await prisma.membre.update({
    where: { id: membreId },
    data: {
      nom: data.nom,
      prenom: data.prenom,
      telephone: data.telephone,
    },
    include: { role: true },
  });
  return {
    id: membre.id,
    nom: membre.nom,
    prenom: membre.prenom,
    email: membre.email,
    telephone: membre.telephone,
    role: membre.role.libelle,
    montantCotisation: membre.role.montantCotisation,
    dateAdhesion: membre.dateAdhesion,
  };
}
// Demande de réinitialisation : génère un code et l'envoie par email
export async function demanderReset(email: string) {
  const membre = await prisma.membre.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  // Sécurité : on renvoie toujours un succès, même si l'email n'existe pas
  // (pour ne pas révéler quels emails sont enregistrés)
  if (!membre) return;

  // Génère un code à 6 chiffres
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expire = new Date(Date.now() + 15 * 60 * 1000); // +15 minutes

  await prisma.membre.update({
    where: { id: membre.id },
    data: { codeReset: code, codeResetExpire: expire },
  });

  await envoyerCodeReinitialisation(membre.email, code);
}

// Vérifie le code et change le mot de passe
export async function reinitialiserMotDePasse(email: string, code: string, nouveauMotDePasse: string) {
  const membre = await prisma.membre.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  if (!membre || !membre.codeReset || !membre.codeResetExpire) {
    throw new Error("Demande invalide ou expirée.");
  }

  // Vérifie le code
  if (membre.codeReset !== code.trim()) {
    throw new Error("Code incorrect.");
  }

  // Vérifie l'expiration
  if (membre.codeResetExpire < new Date()) {
    throw new Error("Le code a expiré. Merci de refaire une demande.");
  }

  if (nouveauMotDePasse.length < 6) {
    throw new Error("Le mot de passe doit faire au moins 6 caractères.");
  }

  // Hache le nouveau mot de passe et efface le code
  const hash = await hashPassword(nouveauMotDePasse);
  await prisma.membre.update({
    where: { id: membre.id },
    data: { motDePasse: hash, codeReset: null, codeResetExpire: null },
  });
}