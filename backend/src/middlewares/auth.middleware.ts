import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/auth.js";

// Étend le type Request pour y attacher le membre authentifié
export interface AuthRequest extends Request {
  membre?: { id: number; role: string };
}

// Vérifie que la requête contient un token JWT valide
export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token manquant ou invalide" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyToken(token);
    req.membre = payload; // on attache le membre à la requête
    next(); // on laisse passer vers la suite
  } catch {
    return res.status(401).json({ error: "Token invalide ou expiré" });
  }
}

// Vérifie que le membre connecté a le rôle requis (ex: trésorier/bureau)
export function authorize(...rolesAutorises: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.membre || !rolesAutorises.includes(req.membre.role)) {
      return res.status(403).json({ error: "Accès refusé" });
    }
    next();
  };
}