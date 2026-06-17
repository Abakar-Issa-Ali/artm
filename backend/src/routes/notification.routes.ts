import { Router } from "express";
import * as notificationController from "../controllers/notification.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/me", authenticate, notificationController.mesNotifications);
router.patch("/:id/lue", authenticate, notificationController.marquerLue);

export default router;