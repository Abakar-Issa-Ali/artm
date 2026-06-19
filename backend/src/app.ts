import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import cotisationRoutes from "./routes/cotisation.routes.js";
import paiementRoutes from "./routes/paiement.routes.js";
import { connectMongo } from "./config/mongo.js";
import notificationRoutes from "./routes/notification.routes.js";
import annonceRoutes from "./routes/annonce.routes.js";
import membreRoutes from "./routes/membre.routes.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares de sécurité
app.use(helmet());
app.use(cors());
app.use(express.json());

// Route de santé
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "ARTM API",
    timestamp: new Date().toISOString(),
  });
});

// Routes d'authentification
app.use("/api/auth", authRoutes);
app.use("/api/cotisations", cotisationRoutes);
app.use("/api/paiements", paiementRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/annonces", annonceRoutes);
app.use("/api/membres", membreRoutes);
// Documentation Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Démarrage du serveur
if (process.env.NODE_ENV !== "test") {
  connectMongo().then(() => {
    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`Serveur ARTM démarré sur le port ${PORT}`);
    });
  });
}

export default app;