import { Router } from "express";
import * as paiementController from "../controllers/paiement.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = Router();

// Le membre connecté déclare un paiement
router.post("/declarer", authenticate, paiementController.declarer);

// Routes réservées au trésorier
router.get(
  "/en-attente",
  authenticate,
  authorize("tresorier"),
  paiementController.enAttente
);
router.patch(
  "/:id/valider",
  authenticate,
  authorize("tresorier"),
  paiementController.valider
);
router.patch(
  "/:id/rejeter",
  authenticate,
  authorize("tresorier"),
  paiementController.rejeter
);

export default router;