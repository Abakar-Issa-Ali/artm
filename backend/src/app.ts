import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares de sécurité
app.use(helmet());              // durcit les en-têtes HTTP
app.use(cors());                // gère les requêtes cross-origin
app.use(express.json());        // parse le corps JSON des requêtes

// Route de santé (health check)
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "ARTM API",
    timestamp: new Date().toISOString(),
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur ARTM démarré sur le port ${PORT}`);
});

export default app;