import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret_par_defaut";
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "1d") as jwt.SignOptions["expiresIn"];

// Hache un mot de passe en clair
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Vérifie un mot de passe contre son hash
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Génère un token JWT pour un membre
export function generateToken(payload: { id: number; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Vérifie et décode un token JWT
export function verifyToken(token: string): { id: number; role: string } {
  return jwt.verify(token, JWT_SECRET) as { id: number; role: string };
}