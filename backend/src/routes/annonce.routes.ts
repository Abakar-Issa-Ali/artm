import { Router } from "express";
import * as annonceController from "../controllers/annonce.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Annonces
 *   description: Annonces publiées par le bureau
 */

/**
 * @swagger
 * /api/annonces:
 *   get:
 *     summary: Liste toutes les annonces
 *     tags: [Annonces]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Liste des annonces }
 *   post:
 *     summary: Publie une annonce (bureau ou trésorier)
 *     tags: [Annonces]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [titre, contenu]
 *             properties:
 *               titre: { type: string, example: Assemblée générale }
 *               contenu: { type: string, example: L'AG se tiendra le 12 juillet à 15h. }
 *     responses:
 *       201: { description: Annonce publiée }
 *       403: { description: Accès refusé }
 */
// Tous les membres connectés peuvent lire les annonces
router.get("/", authenticate, annonceController.lister);

// Seul le bureau ou le trésorier peut publier
router.post(
  "/",
  authenticate,
  authorize("bureau", "tresorier"),
  annonceController.publier
);
/**
 * @swagger
 * /api/annonces/{id}:
 *   patch:
 *     summary: Modifie une annonce (trésorier)
 *     tags: [Annonces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [titre, contenu]
 *             properties:
 *               titre: { type: string }
 *               contenu: { type: string }
 *     responses:
 *       200: { description: Annonce modifiée }
 *       403: { description: Accès refusé }
 *   delete:
 *     summary: Supprime une annonce (trésorier)
 *     tags: [Annonces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Annonce supprimée }
 *       403: { description: Accès refusé }
 */
router.patch("/:id", authenticate, authorize("tresorier"), annonceController.modifier);
router.delete("/:id", authenticate, authorize("tresorier"), annonceController.supprimer);

export default router;