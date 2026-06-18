import { Router } from "express";
import * as cotisationController from "../controllers/cotisation.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Cotisations
 *   description: Gestion des cotisations mensuelles
 */

/**
 * @swagger
 * /api/cotisations/generer:
 *   post:
 *     summary: Génère les échéances manquantes du membre connecté
 *     tags: [Cotisations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201: { description: Échéances générées }
 */
// Toutes les routes nécessitent d'être connecté
router.post("/generer", authenticate, cotisationController.generer);

/**
 * @swagger
 * /api/cotisations/me:
 *   get:
 *     summary: Récupère les cotisations du membre connecté
 *     tags: [Cotisations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Liste des cotisations avec résumé du statut }
 */
router.get("/me", authenticate, cotisationController.mesCotisations);

export default router;