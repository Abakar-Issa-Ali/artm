import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import cotisationRoutes from "./routes/cotisation.routes.js";

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

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur ARTM démarré sur le port ${PORT}`);
});

export default app;