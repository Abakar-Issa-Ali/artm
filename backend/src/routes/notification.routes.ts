import { Router } from "express";
import * as notificationController from "../controllers/notification.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notifications personnelles des membres
 */

/**
 * @swagger
 * /api/notifications/me:
 *   get:
 *     summary: Récupère les notifications du membre connecté
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Liste des notifications }
 */

router.get("/me", authenticate, notificationController.mesNotifications);

/**
 * @swagger
 * /api/notifications/{id}/lue:
 *   patch:
 *     summary: Marque une notification comme lue
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Notification marquée comme lue }
 */
router.patch("/:id/lue", authenticate, notificationController.marquerLue);

export default router;