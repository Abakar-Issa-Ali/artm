import { Router } from "express";
import { lireCoordonnees, majCoordonnees } from "../controllers/coordonnees.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * /api/coordonnees:
 *   get:
 *     summary: Récupère les coordonnées de paiement de l'association
 *     tags: [Coordonnées de paiement]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Coordonnées de paiement (IBAN, référence, Wero, etc.)
 */
router.get("/", authenticate, lireCoordonnees);

/**
 * @swagger
 * /api/coordonnees:
 *   put:
 *     summary: Met à jour les coordonnées de paiement (trésorier uniquement)
 *     tags: [Coordonnées de paiement]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               iban: { type: string, example: FR76 1234 5678 9012 }
 *               titulaire: { type: string, example: Association ARTM }
 *               reference: { type: string, example: "ARTM-{annee}-{mois}" }
 *               numeroWero: { type: string, example: "0612345678" }
 *               noteCarte: { type: string, example: "Paiement par carte à venir" }
 *     responses:
 *       200:
 *         description: Coordonnées mises à jour
 *       403:
 *         description: Réservé au trésorier
 */
router.put("/", authenticate, authorize("tresorier"), majCoordonnees);

export default router;