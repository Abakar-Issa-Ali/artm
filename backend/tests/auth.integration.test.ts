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
    it("crée un nouveau compte en attente de validation", async () => {
      const reponse = await request(app)
        .post("/api/auth/register")
        .send({
          nom: "TestNom",
          prenom: "TestPrenom",
          email: emailTest,
          motDePasse,
        });

      // Le compte est créé mais en attente : pas de token, mais un indicateur d'attente
      expect(reponse.status).toBe(201);
      expect(reponse.body).toHaveProperty("enAttente", true);
      expect(reponse.body).toHaveProperty("message");
      // Le mot de passe ne doit JAMAIS être renvoyé
      expect(reponse.body).not.toHaveProperty("motDePasse");
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
    it("refuse la connexion d'un compte non encore validé", async () => {
      const reponse = await request(app)
        .post("/api/auth/login")
        .send({ email: emailTest, motDePasse });

      // Le compte existe mais n'est pas validé : connexion bloquée
      expect(reponse.status).toBe(401);
      expect(reponse.body).toHaveProperty("error");
    });

    it("connecte un membre validé avec les bons identifiants", async () => {
      // On valide le compte (comme le ferait le trésorier)
      await prisma.membre.update({
        where: { email: emailTest },
        data: { valide: true },
      });

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
      // Le compte a été validé dans le test de login précédent
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