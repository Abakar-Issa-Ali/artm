## Documentation de déploiement — Application ARTM

**Compétence CDA visée :** C10 — Préparer et documenter le déploiement
**Version :** 1.0

---

## 1. Présentation

L'application ARTM se compose de trois éléments :

- une **API backend** (Node.js / Express / TypeScript) ;
- une **base de données relationnelle** PostgreSQL ;
- une **base de données NoSQL** MongoDB ;
- une **application mobile** (React Native / Expo) qui consomme l'API.

Le backend et les deux bases de données sont **conteneurisés avec Docker** et
orchestrés via `docker-compose`, ce qui permet de lancer toute l'infrastructure
en une seule commande.

---

## 2. Prérequis

| Outil | Version recommandée | Usage |
|---|---|---|
| Docker Desktop | 24+ | Conteneurisation backend + bases |
| Node.js | 20 LTS | Développement et app mobile |
| npm | 10+ | Gestion des dépendances |
| Expo Go | dernière | Test de l'app mobile sur téléphone |
| Git | 2.40+ | Gestion de versions |

---

## 3. Récupération du projet

```bash
git clone https://github.com/Abakar-Issa-Ali/artm.git
cd artm
```

---

## 4. Configuration des variables d'environnement

Le backend utilise un fichier `.env`. Un modèle `.env.example` est fourni.

```bash
cd backend
cp .env.example .env
```

Variables à renseigner dans `backend/.env` :

```
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://artm_user:artm_password@localhost:5432/artm_db
MONGO_URL=mongodb://localhost:27017/artm
JWT_SECRET=une_cle_secrete_robuste
JWT_EXPIRES_IN=1d
```

> Le fichier `.env` n'est jamais versionné (présent dans `.gitignore`) afin de
> ne pas exposer les secrets.

---

## 5. Déploiement avec Docker (recommandé)

Depuis la racine du projet :

```bash
docker compose up -d --build
```

Cette commande lance trois conteneurs :

- `artm_backend` — l'API sur le port 4000 ;
- `artm_postgres` — PostgreSQL sur le port 5432 ;
- `artm_mongo` — MongoDB sur le port 27017.

### Appliquer les migrations et les données initiales

Au premier lancement, créer le schéma de la base et les rôles :

```bash
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx tsx prisma/seed.ts
```

### Vérifier le bon fonctionnement

Ouvrir dans un navigateur : `http://localhost:4000/health`
La réponse attendue est : `{"status":"ok","service":"ARTM API",...}`

Documentation interactive de l'API : `http://localhost:4000/api-docs`

### Arrêter l'application

```bash
docker compose down
```

---

## 6. Déploiement en développement (sans Docker pour le backend)

Pour développer le backend en local avec rechargement automatique :

```bash
# Lancer uniquement les bases de données via Docker
docker compose up -d postgres mongo

# Installer les dépendances et lancer le backend
cd backend
npm install
npx prisma migrate dev
npx tsx prisma/seed.ts
npm run dev
```

---

## 7. Lancement de l'application mobile

```bash
cd mobile
npm install
npx expo start
```

Scanner le QR code affiché avec l'application **Expo Go** sur un téléphone
connecté au **même réseau Wi-Fi** que l'ordinateur.

> Important : l'adresse de l'API dans `mobile/src/config/api.ts` doit pointer
> vers l'adresse IP locale de l'ordinateur (et non `localhost`), afin que le
> téléphone puisse joindre le backend.

---

## 8. Exécution des tests

```bash
cd backend
npm test              # lance tous les tests
npm run test:coverage # avec le rapport de couverture
```

---

## 9. Intégration continue (CI/CD)

À chaque `push` ou `pull request`, un pipeline **GitHub Actions** (défini dans
`.github/workflows/ci.yml`) exécute automatiquement :

1. l'installation des dépendances ;
2. la génération du client Prisma et l'application des migrations ;
3. le seed des données ;
4. l'exécution de la suite de tests ;
5. la vérification de la compilation du projet.

Le statut du pipeline est visible dans l'onglet **Actions** du dépôt GitHub.

---

## 10. Architecture de déploiement

```
┌─────────────────┐         ┌──────────────────────────────────┐
│  App mobile     │  HTTPS  │         Docker (docker-compose)   │
│  React Native   │ ──────► │                                   │
│  (Expo)         │         │  ┌────────────┐  ┌─────────────┐  │
└─────────────────┘         │  │  Backend   │─►│ PostgreSQL  │  │
                            │  │  Express   │  └─────────────┘  │
                            │  │  port 4000 │  ┌─────────────┐  │
                            │  │            │─►│  MongoDB    │  │
                            │  └────────────┘  └─────────────┘  │
                            └──────────────────────────────────┘
```

---

## 11. Dépannage courant

| Problème | Cause probable | Solution |
|---|---|---|
| `/health` inaccessible | Backend non démarré | Vérifier `docker compose ps` |
| Le téléphone ne joint pas l'API | Mauvaise IP dans `api.ts` | Mettre l'IP locale du PC |
| Erreur de connexion BDD | Bases non démarrées | `docker compose up -d` |
| Tests en échec sur la BDD | Migrations non appliquées | `npx prisma migrate deploy` |