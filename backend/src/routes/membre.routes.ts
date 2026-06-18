import { Router } from "express";
import * as membreController from "../controllers/membre.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = Router();

// Réservé au trésorier
router.get("/", authenticate, authorize("tresorier"), membreController.liste);

export default router;