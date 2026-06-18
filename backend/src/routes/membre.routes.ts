import { Router } from "express";
import * as membreController from "../controllers/membre.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Membres
 *   description: Gestion des membres (trésorier)
 */

/**
 * @swagger
 * /api/membres:
 *   get:
 *     summary: Liste tous les membres avec leur statut (trésorier)
 *     tags: [Membres]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Liste des membres }
 *       403: { description: Accès refusé (rôle trésorier requis) }
 */
// Réservé au trésorier
router.get("/", authenticate, authorize("tresorier"), membreController.liste);

export default router;