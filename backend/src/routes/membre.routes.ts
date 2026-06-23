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

/**
 * @swagger
 * /api/membres/resume:
 *   get:
 *     summary: Résumé global pour le tableau de bord trésorier
 *     tags: [Membres]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Résumé (membres actifs, encaissement, taux) }
 */
router.get("/resume", authenticate, authorize("tresorier"), membreController.resume);

/**
 * @swagger
 * /api/membres/moi:
 *   delete:
 *     summary: Le membre connecté supprime définitivement son propre compte (RGPD)
 *     tags: [Membres]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Compte supprimé }
 *       401: { description: Non authentifié }
 */
router.delete("/moi", authenticate, membreController.supprimerMonCompte);

/**
 * @swagger
 * /api/membres/{id}/relancer:
 *   post:
 *     summary: Envoie une relance à un membre (trésorier)
 *     tags: [Membres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Relance envoyée }
 */
router.post("/:id/relancer", authenticate, authorize("tresorier"), membreController.relancer);
/**
 * @swagger
 * /api/membres/{id}/role:
 *   patch:
 *     summary: Change le rôle d'un membre (trésorier)
 *     tags: [Membres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role: { type: string, example: bureau }
 *     responses:
 *       200: { description: Rôle modifié }
 */
router.patch("/:id/role", authenticate, authorize("tresorier"), membreController.changerRole);

/**
 * @swagger
 * /api/membres/{id}/desactiver:
 *   patch:
 *     summary: Désactive un membre (trésorier)
 *     tags: [Membres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Membre désactivé }
 */
router.patch("/:id/desactiver", authenticate, authorize("tresorier"), membreController.desactiver);

/**
 * @swagger
 * /api/membres/{id}/reactiver:
 *   patch:
 *     summary: Réactive un membre (trésorier)
 *     tags: [Membres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Membre réactivé }
 */
router.patch("/:id/reactiver", authenticate, authorize("tresorier"), membreController.reactiver);

/**
 * @swagger
 * /api/membres/{id}:
 *   delete:
 *     summary: Supprime définitivement un membre (trésorier)
 *     tags: [Membres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Membre supprimé }
 */
router.delete("/:id", authenticate, authorize("tresorier"), membreController.supprimer);

export default router;