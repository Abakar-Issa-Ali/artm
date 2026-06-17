#!/usr/bin/env bash
###############################################################################
# setup-github.sh
# Initialise le projet GitHub pour l'application ARTM (Titre CDA - RNCP 37873)
#
# Crée : labels, milestones (sprints), et ~45 issues tracées par compétence CDA.
#
# PRÉREQUIS :
#   1. GitHub CLI installé        -> https://cli.github.com/
#   2. Authentifié                -> gh auth login
#   3. Lancé À LA RACINE de ton repo cloné (le repo "artm")
#
# USAGE :
#   chmod +x setup-github.sh
#   ./setup-github.sh
###############################################################################

set -euo pipefail

# ----------------------------------------------------------------------------
# 0. Vérifications préalables
# ----------------------------------------------------------------------------
echo "==> Vérification de l'environnement..."

if ! command -v gh >/dev/null 2>&1; then
  echo "ERREUR : GitHub CLI (gh) n'est pas installé."
  echo "  macOS    : brew install gh"
  echo "  Windows  : winget install --id GitHub.cli"
  echo "  Linux    : voir https://github.com/cli/cli/blob/trunk/docs/install_linux.md"
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "ERREUR : tu n'es pas authentifié. Lance d'abord : gh auth login"
  exit 1
fi

# Récupère owner/repo depuis le remote git du dossier courant
if ! REPO="$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null)"; then
  echo "ERREUR : ce dossier n'est pas relié à un repo GitHub."
  echo "  Place-toi dans ton repo 'artm' cloné, puis relance."
  exit 1
fi

echo "==> Repo détecté : $REPO"
read -r -p "Continuer et créer labels + milestones + issues sur ce repo ? [o/N] " ok
[[ "${ok,,}" == "o" || "${ok,,}" == "oui" || "${ok,,}" == "y" ]] || { echo "Annulé."; exit 0; }

# ----------------------------------------------------------------------------
# 1. Labels
# ----------------------------------------------------------------------------
echo "==> Création des labels..."

create_label () {
  # $1 = nom, $2 = couleur hex, $3 = description
  gh label create "$1" --color "$2" --description "$3" --force >/dev/null 2>&1 \
    && echo "    label: $1" || echo "    (label déjà présent: $1)"
}

# Labels par bloc / activité-type CDA
create_label "bloc-1-dev-securise"      "1D76DB" "AT1 : Développer une application sécurisée"
create_label "bloc-2-conception"        "0E8A16" "AT2 : Concevoir/développer une appli en couches"
create_label "bloc-3-deploiement"       "5319E7" "AT3 : Préparer le déploiement"

# Labels par type de tâche
create_label "type:conception"          "FBCA04" "Analyse, maquettage, modélisation"
create_label "type:backend"             "B60205" "API, métier, accès données"
create_label "type:frontend"            "C2E0C6" "Interfaces utilisateur mobile"
create_label "type:bdd"                 "006B75" "Base de données SQL / NoSQL"
create_label "type:tests"               "D93F0B" "Tests unitaires, intégration, recette"
create_label "type:devops"              "0052CC" "Docker, CI/CD, déploiement"
create_label "type:gestion-projet"      "BFD4F2" "Pilotage, planning, doc"
create_label "type:securite"            "E99695" "Sécurité (ANSSI, OWASP, RGPD)"
create_label "type:doc"                 "FEF2C0" "Documentation / dossier"

# Labels compétences (C1..C11 du référentiel)
create_label "C1-environnement"   "EDEDED" "Installer/configurer son environnement"
create_label "C2-interfaces"      "EDEDED" "Développer des interfaces utilisateur"
create_label "C3-composants-metier" "EDEDED" "Développer des composants métier"
create_label "C4-gestion-projet"  "EDEDED" "Contribuer à la gestion d'un projet"
create_label "C5-besoins-maquette" "EDEDED" "Analyser les besoins et maquetter"
create_label "C6-architecture"    "EDEDED" "Définir l'architecture logicielle"
create_label "C7-bdd-relationnelle" "EDEDED" "Concevoir/mettre en place une BDD relationnelle"
create_label "C8-acces-donnees"   "EDEDED" "Développer composants d'accès SQL et NoSQL"
create_label "C9-tests"           "EDEDED" "Préparer et exécuter les plans de tests"
create_label "C10-deploiement"    "EDEDED" "Préparer et documenter le déploiement"
create_label "C11-devops"         "EDEDED" "Contribuer à la mise en production DevOps"

# ----------------------------------------------------------------------------
# 2. Milestones (sprints)
# ----------------------------------------------------------------------------
echo "==> Création des milestones (sprints)..."

create_milestone () {
  # $1 = titre, $2 = description
  gh api "repos/$REPO/milestones" -f title="$1" -f description="$2" -f state="open" \
    >/dev/null 2>&1 && echo "    milestone: $1" || echo "    (milestone déjà présent: $1)"
}

create_milestone "Sprint 0 - Cadrage & Conception" "Besoins, maquettes, architecture, modélisation BDD"
create_milestone "Sprint 1 - Fondations & Setup"    "Environnement, repo, Docker, archi en couches"
create_milestone "Sprint 2 - Backend & Données"     "API REST, métier, PostgreSQL, MongoDB, sécurité"
create_milestone "Sprint 3 - Frontend Mobile"       "Écrans React Native, intégration API, accessibilité"
create_milestone "Sprint 4 - Tests & Qualité"       "Tests unitaires/intégration, cahiers de recette"
create_milestone "Sprint 5 - DevOps & Déploiement"  "CI/CD, conteneurisation, mise en production, veille"
create_milestone "Sprint 6 - Dossiers & Soutenance" "Dossier projet, dossier pro, préparation orale"

# Helper : récupère le numéro d'un milestone par son titre
milestone_number () {
  gh api "repos/$REPO/milestones?state=all&per_page=100" \
    -q ".[] | select(.title==\"$1\") | .number"
}

# ----------------------------------------------------------------------------
# 3. Issues
# ----------------------------------------------------------------------------
echo "==> Création des issues..."

# create_issue "titre" "milestone" "labels(csv)" "corps"
create_issue () {
  local title="$1"; local ms="$2"; local labels="$3"; local body="$4"
  local mnum; mnum="$(milestone_number "$ms")"
  if gh issue create \
        --title "$title" \
        --body "$body" \
        --label "$labels" \
        --milestone "$ms" >/dev/null 2>&1; then
    echo "    issue: $title"
  else
    # fallback sans milestone si l'API milestone échoue
    gh issue create --title "$title" --body "$body" --label "$labels" >/dev/null 2>&1 \
      && echo "    issue (sans milestone): $title" \
      || echo "    ERREUR création: $title"
  fi
}

DOD="### Definition of Done\n- [ ] Code revu et mergé\n- [ ] Documenté\n- [ ] Compétence CDA illustrée pour le dossier"

# ---------- SPRINT 0 : CADRAGE & CONCEPTION ----------
create_issue "Rédiger l'expression des besoins / cahier des charges ARTM" \
  "Sprint 0 - Cadrage & Conception" "type:conception,C5-besoins-maquette,bloc-2-conception,type:doc" \
  "Décrire le contexte (Association des Ressortissants Tchadiens à Marseille), les objectifs (gestion adhésions, cotisations mensuelles, communication membres), le périmètre et les limites du projet.\n\n- [ ] Contexte et problématique\n- [ ] Objectifs SMART\n- [ ] Périmètre / hors-périmètre\n- [ ] Contraintes (techniques, légales RGPD)\n\n$DOD"

create_issue "Définir les personas et les cas d'usage" \
  "Sprint 0 - Cadrage & Conception" "type:conception,C5-besoins-maquette,bloc-2-conception" \
  "- [ ] Persona Membre\n- [ ] Persona Trésorier/Admin\n- [ ] Persona Bureau de l'association\n- [ ] Liste des cas d'usage principaux\n\n$DOD"

create_issue "Rédiger les spécifications fonctionnelles" \
  "Sprint 0 - Cadrage & Conception" "type:conception,C5-besoins-maquette,bloc-2-conception,type:doc" \
  "User stories + règles de gestion (cotisation mensuelle, montant, échéances, statut à jour/en retard, relances).\n\n- [ ] User stories priorisées (MoSCoW)\n- [ ] Règles de gestion des cotisations\n- [ ] Diagramme de cas d'utilisation\n\n$DOD"

create_issue "Construire le userflow et l'arborescence de l'application" \
  "Sprint 0 - Cadrage & Conception" "type:conception,C5-besoins-maquette,type:frontend" \
  "- [ ] Parcours membre (inscription -> paiement -> suivi)\n- [ ] Parcours admin (gestion membres, suivi paiements)\n- [ ] Arborescence des écrans\n\n$DOD"

create_issue "Réaliser le moodboard et le design system (Figma)" \
  "Sprint 0 - Cadrage & Conception" "type:conception,C5-besoins-maquette,type:frontend" \
  "- [ ] Moodboard d'inspiration\n- [ ] Palette, typographie, composants UI\n- [ ] Respect des principes d'accessibilité RGAA\n\n$DOD"

create_issue "Réaliser les maquettes et le prototype (Figma)" \
  "Sprint 0 - Cadrage & Conception" "type:conception,C5-besoins-maquette,type:frontend" \
  "Maquettes de tous les écrans clés + prototype cliquable.\n\n- [ ] Écrans authentification\n- [ ] Profil membre\n- [ ] Cotisations / paiement\n- [ ] Dashboard admin\n- [ ] Prise en compte RGAA\n\n$DOD"

create_issue "Concevoir le MCD (Modèle Conceptuel de Données)" \
  "Sprint 0 - Cadrage & Conception" "type:bdd,C7-bdd-relationnelle,bloc-2-conception" \
  "Entités : Membre, Cotisation, Paiement, Rôle, Notification...\n\n- [ ] Entités et associations\n- [ ] Cardinalités\n- [ ] Schéma exporté pour le dossier\n\n$DOD"

create_issue "Concevoir le MLD et le MPD" \
  "Sprint 0 - Cadrage & Conception" "type:bdd,C7-bdd-relationnelle,bloc-2-conception" \
  "- [ ] MLD (passage relationnel)\n- [ ] MPD (types, clés, index, contraintes)\n- [ ] Choix justifiés (normalisation)\n\n$DOD"

create_issue "Définir l'architecture logicielle (en couches)" \
  "Sprint 0 - Cadrage & Conception" "type:conception,C6-architecture,bloc-2-conception,type:doc" \
  "Architecture multicouche : présentation (RN) / API / services métier / accès données / BDD.\n\n- [ ] Schéma d'architecture\n- [ ] Choix techniques justifiés\n- [ ] Stratégie de sécurité (ANSSI/OWASP)\n\n$DOD"

# ---------- SPRINT 1 : FONDATIONS & SETUP ----------
create_issue "Installer et configurer l'environnement de développement" \
  "Sprint 1 - Fondations & Setup" "type:devops,C1-environnement,bloc-1-dev-securise" \
  "- [ ] Node.js, npm, versions LTS\n- [ ] PostgreSQL et MongoDB locaux (ou Docker)\n- [ ] Éditeur + extensions\n- [ ] Documenter la procédure d'install dans le README\n\n$DOD"

create_issue "Initialiser le monorepo (backend + mobile) et la structure" \
  "Sprint 1 - Fondations & Setup" "type:devops,C1-environnement,bloc-1-dev-securise" \
  "- [ ] Dossier /backend et /mobile\n- [ ] .gitignore, README, LICENSE\n- [ ] Convention de commits (Conventional Commits)\n- [ ] Stratégie de branches (Gitflow)\n\n$DOD"

create_issue "Configurer le linter, le formateur et TypeScript" \
  "Sprint 1 - Fondations & Setup" "type:devops,C1-environnement,bloc-1-dev-securise" \
  "- [ ] ESLint + Prettier (back et front)\n- [ ] tsconfig\n- [ ] Husky + lint-staged (hooks pre-commit)\n\n$DOD"

create_issue "Mettre en place docker-compose pour l'environnement local" \
  "Sprint 1 - Fondations & Setup" "type:devops,C1-environnement,C10-deploiement,bloc-3-deploiement" \
  "Services : api, postgres, mongo (+ adminer/mongo-express).\n\n- [ ] docker-compose.yml\n- [ ] Variables d'environnement (.env.example)\n- [ ] Volumes persistants\n\n$DOD"

create_issue "Mettre en place le squelette de l'API (architecture en couches)" \
  "Sprint 1 - Fondations & Setup" "type:backend,C6-architecture,bloc-2-conception" \
  "Structure : routes / controllers / services / repositories / models / middlewares.\n\n- [ ] Serveur Express + TypeScript\n- [ ] Découpage en couches conforme à l'archi\n- [ ] Endpoint /health\n\n$DOD"

# ---------- SPRINT 2 : BACKEND & DONNÉES ----------
create_issue "Implémenter le schéma PostgreSQL (migrations)" \
  "Sprint 2 - Backend & Données" "type:bdd,C7-bdd-relationnelle,C8-acces-donnees,bloc-2-conception" \
  "- [ ] Outil de migration (Prisma/Knex/TypeORM)\n- [ ] Tables conformes au MPD\n- [ ] Seed de données de test\n\n$DOD"

create_issue "Mettre en place MongoDB pour les notifications / logs" \
  "Sprint 2 - Backend & Données" "type:bdd,C8-acces-donnees,bloc-2-conception" \
  "Justifie l'usage NoSQL (données non relationnelles, volumétrie, historique).\n\n- [ ] Connexion Mongo\n- [ ] Schéma notifications\n- [ ] Accès données (CRUD)\n\n$DOD"

create_issue "Développer l'authentification sécurisée (JWT + rôles)" \
  "Sprint 2 - Backend & Données" "type:backend,type:securite,C3-composants-metier,bloc-1-dev-securise" \
  "- [ ] Inscription / connexion\n- [ ] Hash des mots de passe (bcrypt/argon2)\n- [ ] JWT + refresh token\n- [ ] Middleware d'autorisation par rôle (membre/admin)\n- [ ] Protection contre brute force\n\n$DOD"

create_issue "Développer le CRUD Membres (composant métier)" \
  "Sprint 2 - Backend & Données" "type:backend,C3-composants-metier,C8-acces-donnees,bloc-1-dev-securise" \
  "- [ ] Création / lecture / mise à jour / désactivation\n- [ ] Validation des entrées (style défensif)\n- [ ] Accès données via la couche repository\n\n$DOD"

create_issue "Développer la gestion des cotisations (logique métier)" \
  "Sprint 2 - Backend & Données" "type:backend,C3-composants-metier,bloc-1-dev-securise" \
  "Cœur métier ARTM : cotisation mensuelle, calcul du statut (à jour / en retard), historique.\n\n- [ ] Génération des échéances mensuelles\n- [ ] Calcul des retards\n- [ ] Historique des cotisations par membre\n\n$DOD"

create_issue "Développer la gestion des paiements" \
  "Sprint 2 - Backend & Données" "type:backend,C3-composants-metier,type:securite,bloc-1-dev-securise" \
  "- [ ] Enregistrement d'un paiement (espèces/virement/en ligne)\n- [ ] Lien paiement -> cotisation\n- [ ] Reçu / justificatif\n- [ ] (Optionnel) intégration Stripe en mode test\n\n$DOD"

create_issue "Développer le système de notifications / communication membres" \
  "Sprint 2 - Backend & Données" "type:backend,C3-composants-metier,C8-acces-donnees" \
  "Stockage Mongo. Relances de cotisation, annonces de l'association.\n\n- [ ] Modèle notification\n- [ ] Envoi (push/email) ou in-app\n- [ ] Relance automatique des retards\n\n$DOD"

create_issue "Appliquer les recommandations de sécurité (OWASP / ANSSI)" \
  "Sprint 2 - Backend & Données" "type:securite,C3-composants-metier,bloc-1-dev-securise" \
  "- [ ] Validation/sanitization des entrées\n- [ ] Helmet, CORS, rate limiting\n- [ ] Protection injection SQL / NoSQL\n- [ ] Gestion centralisée des erreurs (pas de fuite d'info)\n- [ ] Variables sensibles hors du code\n\n$DOD"

create_issue "Documenter l'API avec Swagger / OpenAPI" \
  "Sprint 2 - Backend & Données" "type:backend,type:doc,C6-architecture" \
  "- [ ] Spécification OpenAPI\n- [ ] UI Swagger accessible\n- [ ] Tous les endpoints documentés\n\n$DOD"

create_issue "Mettre en place la conformité RGPD" \
  "Sprint 2 - Backend & Données" "type:securite,type:doc,bloc-1-dev-securise" \
  "- [ ] Mentions légales\n- [ ] Consentement / droit à l'effacement\n- [ ] Minimisation des données\n\n$DOD"

# ---------- SPRINT 3 : FRONTEND MOBILE ----------
create_issue "Initialiser l'application React Native (Expo)" \
  "Sprint 3 - Frontend Mobile" "type:frontend,C2-interfaces,C1-environnement,bloc-1-dev-securise" \
  "- [ ] Projet Expo + TypeScript\n- [ ] Navigation (React Navigation)\n- [ ] Thème / design system implémenté\n\n$DOD"

create_issue "Développer les écrans d'authentification" \
  "Sprint 3 - Frontend Mobile" "type:frontend,C2-interfaces,type:securite,bloc-1-dev-securise" \
  "- [ ] Connexion / inscription\n- [ ] Stockage sécurisé du token (SecureStore)\n- [ ] Gestion des erreurs et validation des champs\n\n$DOD"

create_issue "Développer l'écran profil membre" \
  "Sprint 3 - Frontend Mobile" "type:frontend,C2-interfaces,bloc-1-dev-securise" \
  "- [ ] Affichage et édition des infos\n- [ ] Statut d'adhésion\n- [ ] Respect de l'accessibilité (RGAA)\n\n$DOD"

create_issue "Développer l'écran cotisations & historique" \
  "Sprint 3 - Frontend Mobile" "type:frontend,C2-interfaces,bloc-1-dev-securise" \
  "- [ ] Liste des cotisations (à jour / en retard)\n- [ ] Détail d'une échéance\n- [ ] Historique des paiements\n\n$DOD"

create_issue "Développer le parcours de paiement" \
  "Sprint 3 - Frontend Mobile" "type:frontend,C2-interfaces,type:securite,bloc-1-dev-securise" \
  "- [ ] Écran paiement\n- [ ] Confirmation / reçu\n- [ ] Gestion des erreurs\n\n$DOD"

create_issue "Développer le dashboard admin (trésorier)" \
  "Sprint 3 - Frontend Mobile" "type:frontend,C2-interfaces,C3-composants-metier,bloc-1-dev-securise" \
  "- [ ] Liste des membres + statut\n- [ ] Suivi des paiements\n- [ ] Envoi de relances / annonces\n\n$DOD"

create_issue "Intégrer l'API (Axios + intercepteurs + cache)" \
  "Sprint 3 - Frontend Mobile" "type:frontend,C2-interfaces,type:securite,bloc-1-dev-securise" \
  "- [ ] Client Axios + injection du JWT\n- [ ] Gestion centralisée des erreurs\n- [ ] (Optionnel) TanStack Query pour le cache\n\n$DOD"

create_issue "Implémenter l'écran notifications / communication" \
  "Sprint 3 - Frontend Mobile" "type:frontend,C2-interfaces" \
  "- [ ] Liste des notifications\n- [ ] Annonces de l'association\n\n$DOD"

# ---------- SPRINT 4 : TESTS & QUALITÉ ----------
create_issue "Rédiger le plan de tests" \
  "Sprint 4 - Tests & Qualité" "type:tests,C9-tests,bloc-3-deploiement,type:doc" \
  "- [ ] Stratégie (unitaires, intégration, recette)\n- [ ] Périmètre et critères d'acceptation\n\n$DOD"

create_issue "Écrire les tests unitaires backend (Jest)" \
  "Sprint 4 - Tests & Qualité" "type:tests,C9-tests,bloc-3-deploiement" \
  "Cibler la logique métier (cotisations, statut, paiements).\n\n- [ ] Services métier couverts\n- [ ] Cas limites\n\n$DOD"

create_issue "Écrire les tests d'intégration API (Supertest)" \
  "Sprint 4 - Tests & Qualité" "type:tests,C9-tests,bloc-3-deploiement" \
  "- [ ] Endpoints auth\n- [ ] Endpoints membres / cotisations / paiements\n- [ ] Cas d'erreur et sécurité\n\n$DOD"

create_issue "Rédiger les cahiers de recette" \
  "Sprint 4 - Tests & Qualité" "type:tests,C9-tests,bloc-3-deploiement,type:doc" \
  "Tests fonctionnels manuels avec scénarios et résultats attendus.\n\n- [ ] Scénarios par fonctionnalité\n- [ ] Résultats attendus / obtenus\n\n$DOD"

create_issue "Mettre en place la mesure de couverture de tests" \
  "Sprint 4 - Tests & Qualité" "type:tests,C9-tests,bloc-3-deploiement" \
  "- [ ] Coverage Jest\n- [ ] Objectif de couverture défini\n\n$DOD"

# ---------- SPRINT 5 : DEVOPS & DÉPLOIEMENT ----------
create_issue "Écrire les Dockerfiles (backend + build)" \
  "Sprint 5 - DevOps & Déploiement" "type:devops,C10-deploiement,bloc-3-deploiement" \
  "- [ ] Dockerfile backend (multi-stage)\n- [ ] Image optimisée\n- [ ] docker-compose de prod\n\n$DOD"

create_issue "Mettre en place la CI (GitHub Actions)" \
  "Sprint 5 - DevOps & Déploiement" "type:devops,C11-devops,bloc-3-deploiement" \
  "- [ ] Workflow lint + tests à chaque push/PR\n- [ ] Build des images\n- [ ] Badge de statut dans le README\n\n$DOD"

create_issue "Mettre en place la CD (déploiement automatisé)" \
  "Sprint 5 - DevOps & Déploiement" "type:devops,C11-devops,bloc-3-deploiement" \
  "- [ ] Déploiement sur un hébergeur (Railway/Render/VPS)\n- [ ] Variables d'environnement de prod\n- [ ] Stratégie de rollback\n\n$DOD"

create_issue "Rédiger la documentation de déploiement" \
  "Sprint 5 - DevOps & Déploiement" "type:devops,type:doc,C10-deploiement,bloc-3-deploiement" \
  "- [ ] Prérequis\n- [ ] Procédure pas à pas\n- [ ] Schéma d'infrastructure\n\n$DOD"

create_issue "Mettre en place le monitoring / les logs" \
  "Sprint 5 - DevOps & Déploiement" "type:devops,C11-devops,bloc-3-deploiement" \
  "- [ ] Logs structurés\n- [ ] Healthcheck en prod\n\n$DOD"

create_issue "Documenter une veille technologique et une résolution de problème" \
  "Sprint 5 - DevOps & Déploiement" "type:doc,C11-devops,bloc-3-deploiement" \
  "Exigé par le référentiel (veille + démarche structurée de résolution de problème).\n\n- [ ] Sujet de veille documenté\n- [ ] Un problème rencontré + démarche de résolution\n\n$DOD"

# ---------- SPRINT 6 : DOSSIERS & SOUTENANCE ----------
create_issue "Rédiger le dossier projet (40-60 pages)" \
  "Sprint 6 - Dossiers & Soutenance" "type:doc,C4-gestion-projet,bloc-1-dev-securise" \
  "Suivre le sommaire du référentiel : besoins, compétences, gestion de projet, specs fonctionnelles et techniques, réalisations + extraits de code, sécurité, tests, déploiement, veille.\n\n- [ ] Plan complet\n- [ ] Extraits de code significatifs commentés\n- [ ] Justification des choix (dont sécurité)\n\n$DOD"

create_issue "Rédiger le dossier professionnel (DP)" \
  "Sprint 6 - Dossiers & Soutenance" "type:doc,C4-gestion-projet" \
  "1 à 3 exemples de pratique pro par activité-type + déclaration sur l'honneur signée.\n\n- [ ] Exemples par AT1 / AT2 / AT3\n- [ ] Déclaration sur l'honneur\n\n$DOD"

create_issue "Préparer le support de présentation (soutenance)" \
  "Sprint 6 - Dossiers & Soutenance" "type:doc,C4-gestion-projet" \
  "Présentation de 40 min : projet réalisé en amont.\n\n- [ ] Slides\n- [ ] Démo de l'application\n- [ ] Fil narratif par compétence\n\n$DOD"

create_issue "Préparer l'entretien technique et l'anglais (B1/A2)" \
  "Sprint 6 - Dossiers & Soutenance" "type:doc,C4-gestion-projet" \
  "- [ ] Questions/réponses techniques anticipées\n- [ ] Lecture de doc technique en anglais\n- [ ] Vocabulaire technique EN\n\n$DOD"

create_issue "Vérifier la couverture des 11 compétences (checklist finale)" \
  "Sprint 6 - Dossiers & Soutenance" "type:gestion-projet,C4-gestion-projet" \
  "Relire chaque compétence du référentiel et vérifier qu'elle est illustrée dans le dossier + le code.\n\n- [ ] C1 à C11 cochées\n- [ ] Preuves identifiées pour le jury\n\n$DOD"

echo ""
echo "==> Terminé !"
echo "    Labels, milestones et issues créés sur : $REPO"
echo ""
echo "PROCHAINE ÉTAPE (board GitHub Projects) :"
echo "  1. Sur GitHub : onglet 'Projects' -> New project -> 'Board'"
echo "  2. Add items -> ajoute les issues du repo"
echo "  3. Colonnes suggérées : Backlog / To do / In progress / Review / Done"
echo "  4. Optionnel : groupe par 'Milestone' pour visualiser les sprints"