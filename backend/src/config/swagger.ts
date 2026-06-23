import swaggerJSDoc from "swagger-jsdoc";
import path from "path";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API ARTM",
      version: "1.0.0",
      description:
        "API de gestion des adhésions, cotisations et communication de l'Association des Ressortissants Tchadiens à Marseille (ARTM).",
    },
    servers: [
      { url: "http://localhost:4000", description: "Serveur de développement" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  // Fichiers où Swagger ira chercher les commentaires de documentation
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJSDoc(options);