import prisma from "../config/prisma.js";
import { hashPassword, verifyPassword, generateToken } from "../utils/auth.js";

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