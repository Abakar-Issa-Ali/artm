import request from "supertest";
import app from "../src/app.js";
import prisma from "../src/config/prisma.js";

describe("API Authentification (intégration)", () => {
  // Email unique pour éviter les collisions entre exécutions
  const emailTest = `test-${Date.now()}@artm.fr`;
  const motDePasse = "MotDePasse123";

  // Nettoyage après tous les tests : on supprime le membre créé
  afterAll(async () => {
    await prisma.membre.deleteMany({ where: { email: emailTest } });
    await prisma.$disconnect();
  });

  describe("POST /api/auth/register", () => {
    it("crée un nouveau membre et renvoie un token", async () => {
      const reponse = await request(app)
        .post("/api/auth/register")
        .send({
          nom: "TestNom",
          prenom: "TestPrenom",
          email: emailTest,
          motDePasse,
        });

      expect(reponse.status).toBe(201);
      expect(reponse.body).toHaveProperty("token");
      expect(reponse.body.membre.email).toBe(emailTest);
      expect(reponse.body.membre.role).toBe("membre");
      // Le mot de passe ne doit JAMAIS être renvoyé
      expect(reponse.body.membre).not.toHaveProperty("motDePasse");
    });

    it("refuse une inscription avec un email déjà utilisé", async () => {
      const reponse = await request(app)
        .post("/api/auth/register")
        .send({
          nom: "TestNom",
          prenom: "TestPrenom",
          email: emailTest, // même email que le test précédent
          motDePasse,
        });

      expect(reponse.status).toBe(400);
      expect(reponse.body).toHaveProperty("error");
    });
  });

  describe("POST /api/auth/login", () => {
    it("connecte un membre avec les bons identifiants", async () => {
      const reponse = await request(app)
        .post("/api/auth/login")
        .send({ email: emailTest, motDePasse });

      expect(reponse.status).toBe(200);
      expect(reponse.body).toHaveProperty("token");
    });

    it("refuse la connexion avec un mauvais mot de passe", async () => {
      const reponse = await request(app)
        .post("/api/auth/login")
        .send({ email: emailTest, motDePasse: "mauvais" });

      expect(reponse.status).toBe(401);
      expect(reponse.body).toHaveProperty("error");
    });
  });

  describe("GET /api/auth/me (route protégée)", () => {
    it("refuse l'accès sans token", async () => {
      const reponse = await request(app).get("/api/auth/me");
      expect(reponse.status).toBe(401);
    });

    it("autorise l'accès avec un token valide", async () => {
      // On se connecte pour obtenir un token
      const login = await request(app)
        .post("/api/auth/login")
        .send({ email: emailTest, motDePasse });
      const token = login.body.token;

      const reponse = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(reponse.status).toBe(200);
      expect(reponse.body.email).toBe(emailTest);
    });
  });
});