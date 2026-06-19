import { Router } from "express";
import * as paiementController from "../controllers/paiement.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Paiements
 *   description: Déclaration et validation des paiements
 */

/**
 * @swagger
 * /api/paiements/declarer:
 *   post:
 *     summary: Le membre déclare un paiement sur une échéance
 *     tags: [Paiements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cotisationId, mode]
 *             properties:
 *               cotisationId: { type: integer, example: 1 }
 *               mode: { type: string, example: virement }
 *     responses:
 *       201: { description: Paiement déclaré, en attente de validation }
 */
// Le membre connecté déclare un paiement
router.post("/declarer", authenticate, paiementController.declarer);

/**
 * @swagger
 * /api/paiements/en-attente:
 *   get:
 *     summary: Liste les paiements en attente (trésorier)
 *     tags: [Paiements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Liste des paiements déclarés }
 *       403: { description: Accès refusé (rôle trésorier requis) }
 */
// Routes réservées au trésorier
router.get(
  "/en-attente",
  authenticate,
  authorize("tresorier"),
  paiementController.enAttente
);

/**
 * @swagger
 * /api/paiements/{id}/valider:
 *   patch:
 *     summary: Le trésorier valide un paiement
 *     tags: [Paiements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Paiement validé, reçu généré }
 */

router.patch(
  "/:id/valider",
  authenticate,
  authorize("tresorier"),
  paiementController.valider
);

/**
 * @swagger
 * /api/paiements/{id}/rejeter:
 *   patch:
 *     summary: Le trésorier rejette un paiement
 *     tags: [Paiements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Paiement rejeté }
 */

router.patch(
  "/:id/rejeter",
  authenticate,
  authorize("tresorier"),
  paiementController.rejeter
);

export default router;