## Architecture logicielle — Application ARTM

**Compétence CDA visée :** C6 — Définir l'architecture logicielle d'une application
**Ticket :** #9
**Version :** 1.0

---

## 1. Vue d'ensemble

L'application ARTM repose sur une **architecture multicouche** (n-tiers)
séparant clairement les responsabilités. Elle se compose de :

- un **client mobile** (React Native / Expo) — couche présentation ;
- une **API REST** (Node.js / Express / TypeScript) organisée en couches ;
- deux **bases de données** : PostgreSQL (relationnelle) et MongoDB (NoSQL).

Cette séparation répond aux exigences du référentiel CDA : architecture en
couches, sécurité intégrée à chaque niveau, testabilité et maintenabilité.

---

## 2. Les couches et leurs responsabilités

### Couche présentation (mobile)

- Technologie : React Native avec Expo, en TypeScript.
- Rôle : afficher les écrans, gérer la navigation, recueillir les saisies,
  appeler l'API. Aucune logique métier sensible côté client.
- Sécurité : stockage du token JWT dans le stockage sécurisé du téléphone
  (SecureStore), appels en HTTPS uniquement.

### Couche API (routes + middlewares)

- Point d'entrée des requêtes HTTP.
- Responsabilités : routage, authentification (vérification du JWT),
  autorisation par rôle, validation des données entrantes, gestion centralisée
  des erreurs, application des en-têtes de sécurité (Helmet), limitation du
  débit (rate limiting), CORS.

### Couche contrôleurs

- Reçoit la requête validée, orchestre l'appel au service approprié, met en
  forme la réponse HTTP.
- Ne contient **aucune** règle métier : c'est un chef d'orchestre.

### Couche services (métier)

- Cœur de l'application : applique les règles de gestion (génération des
  échéances, calcul des statuts à jour/en retard, validation des paiements,
  génération des reçus, relances).
- Indépendante du framework web et de la base de données, donc facilement
  testable unitairement.

### Couche accès aux données (repositories)

- Traduit les besoins du métier en opérations concrètes sur les bases.
- Requêtes SQL pour PostgreSQL, opérations documentaires pour MongoDB.
- Isole le reste de l'application des détails de persistance.

### Couche données

- PostgreSQL : données relationnelles (membres, cotisations, paiements, reçus).
- MongoDB : données documentaires (notifications, annonces).

---

## 3. Arborescence du projet (backend)

```
backend/
├── src/
│   ├── config/          # configuration (env, connexions BDD)
│   ├── routes/          # définition des routes Express
│   ├── middlewares/     # auth JWT, validation, gestion erreurs, sécurité
│   ├── controllers/     # contrôleurs (orchestration)
│   ├── services/        # logique métier
│   ├── repositories/    # accès aux données (SQL et NoSQL)
│   ├── models/          # entités / schémas (Prisma, Mongoose)
│   ├── utils/           # fonctions utilitaires
│   └── app.ts           # point d'entrée Express
├── tests/               # tests unitaires et d'intégration
├── prisma/              # schéma et migrations PostgreSQL
├── Dockerfile
└── package.json
```

```
mobile/
├── src/
│   ├── screens/         # écrans de l'application
│   ├── components/      # composants réutilisables
│   ├── navigation/      # configuration de la navigation
│   ├── services/        # appels API (Axios)
│   ├── hooks/           # hooks personnalisés
│   ├── context/         # contexte d'authentification
│   └── theme/           # design system
└── App.tsx
```

---

## 4. Choix techniques justifiés

| Choix | Justification |
|---|---|
| **React Native (Expo)** | Une seule base de code pour iOS et Android, écosystème mature, rapidité de développement |
| **Node.js + Express + TypeScript** | JavaScript de bout en bout (cohérence front/back), typage statique pour la robustesse |
| **PostgreSQL** | Intégrité référentielle, transactions, adapté aux données financières |
| **MongoDB** | Souplesse documentaire pour les notifications/annonces, montée en charge |
| **JWT** | Authentification stateless adaptée à une API REST consommée par un mobile |
| **Architecture en couches** | Séparation des responsabilités, testabilité, maintenabilité |
| **Docker** | Environnements reproductibles, déploiement simplifié |

---

## 5. Stratégie de sécurité (transversale)

La sécurité est intégrée à **chaque couche**, conformément aux recommandations
ANSSI et au top 10 OWASP :

- **Authentification** : JWT signé, mots de passe hachés (bcrypt/argon2).
- **Autorisation** : contrôle des rôles (membre vs trésorier) sur chaque route
  sensible.
- **Validation** : toutes les entrées sont validées et assainies (style
  défensif) pour prévenir les injections (SQL et NoSQL).
- **Transport** : HTTPS obligatoire.
- **En-têtes** : Helmet pour durcir les en-têtes HTTP, CORS restrictif.
- **Anti-abus** : rate limiting pour limiter le brute force.
- **Gestion des erreurs** : messages génériques côté client, détails journalisés
  côté serveur (pas de fuite d'information).
- **Secrets** : variables d'environnement, jamais dans le code source.
- **RGPD** : minimisation des données, consentement, droit à l'effacement.

---

## 6. Flux type — déclaration d'un paiement

1. Le membre déclare un paiement depuis l'application mobile.
2. La requête HTTPS arrive à l'API avec le token JWT.
3. Les middlewares vérifient le token, le rôle et valident les données.
4. Le contrôleur appelle le service de paiement.
5. Le service applique les règles : vérifie la cotisation, crée le paiement au
   statut « déclaré », déclenche une notification au trésorier.
6. Le repository enregistre le paiement dans PostgreSQL ; le repository de
   notifications écrit dans MongoDB.
7. La réponse remonte les couches jusqu'à l'application mobile.

---

## 7. Lien avec les compétences CDA

- **C6** : définition d'une architecture multicouche claire, choix techniques
  argumentés, stratégie de sécurité transversale.
- Prépare **C2/C3** (développement par couche), **C8** (accès SQL et NoSQL) et
  **C9** (testabilité grâce à la séparation des responsabilités).