import { Router } from "express";
import * as annonceController from "../controllers/annonce.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = Router();

// Tous les membres connectés peuvent lire les annonces
router.get("/", authenticate, annonceController.lister);

// Seul le bureau ou le trésorier peut publier
router.post(
  "/",
  authenticate,
  authorize("bureau", "tresorier"),
  annonceController.publier
);

export default router;