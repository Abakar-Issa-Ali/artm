import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { motDePasseOublie, reinitialiser } from "../controllers/auth.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Authentification
 *   description: Inscription, connexion et profil
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Inscription d'un nouveau membre
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nom, prenom, email, motDePasse]
 *             properties:
 *               nom: { type: string, example: Ali }
 *               prenom: { type: string, example: Abakar }
 *               email: { type: string, example: ali@artm.fr }
 *               telephone: { type: string, example: "0600000000" }
 *               motDePasse: { type: string, example: MonMotDePasse123 }
 *     responses:
 *       201: { description: Membre créé avec token JWT }
 *       400: { description: Email déjà utilisé ou données invalides }
 */
router.post("/register", authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connexion d'un membre
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, motDePasse]
 *             properties:
 *               email: { type: string, example: ali@artm.fr }
 *               motDePasse: { type: string, example: MonMotDePasse123 }
 *     responses:
 *       200: { description: Connexion réussie avec token JWT }
 *       401: { description: Email ou mot de passe incorrect }
 */
router.post("/login", authController.login);
/**
 * @swagger
 * /api/auth/mot-de-passe-oublie:
 *   post:
 *     summary: Demande de réinitialisation du mot de passe
 *     description: Génère un code à 6 chiffres et l'envoie par email. Pour des raisons de sécurité, la réponse est identique que l'email existe ou non.
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: membre@artm.fr
 *     responses:
 *       200:
 *         description: Si un compte existe, un code a été envoyé par email.
 *       400:
 *         description: Email manquant.
 *       500:
 *         description: Erreur lors de l'envoi du code.
 */
router.post("/mot-de-passe-oublie", motDePasseOublie);

/**
 * @swagger
 * /api/auth/reinitialiser:
 *   post:
 *     summary: Réinitialisation du mot de passe avec le code reçu
 *     description: Vérifie le code à 6 chiffres reçu par email et définit un nouveau mot de passe. Le code expire après 15 minutes.
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *               - nouveauMotDePasse
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: membre@artm.fr
 *               code:
 *                 type: string
 *                 example: "123456"
 *               nouveauMotDePasse:
 *                 type: string
 *                 format: password
 *                 example: MonNouveauMotDePasse123
 *     responses:
 *       200:
 *         description: Mot de passe réinitialisé avec succès.
 *       400:
 *         description: Code incorrect, expiré, ou champs manquants.
 */
router.post("/reinitialiser", reinitialiser);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Récupère le profil du membre connecté
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Profil du membre }
 *       401: { description: Token manquant ou invalide }
 *   patch:
 *     summary: Met à jour le profil du membre connecté
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom: { type: string }
 *               prenom: { type: string }
 *               telephone: { type: string }
 *     responses:
 *       200: { description: Profil mis à jour }
 */
router.get("/me", authenticate, authController.me);
router.patch("/me", authenticate, authController.updateMe);

export default router;