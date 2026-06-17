import { Router } from "express";
import * as cotisationController from "../controllers/cotisation.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

// Toutes les routes nécessitent d'être connecté
router.post("/generer", authenticate, cotisationController.generer);
router.get("/me", authenticate, cotisationController.mesCotisations);

export default router;