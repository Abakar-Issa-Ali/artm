## Modélisation de la base de données — Application ARTM

**Compétences CDA visées :** C7 (concevoir et mettre en place une base de données
relationnelle) et C8 (développer des composants d'accès aux données SQL et NoSQL)
**Tickets :** #7 et #8
**Version :** 1.0

---

## 1. Introduction et choix d'architecture des données

L'application ARTM utilise **deux bases de données complémentaires**, ce qui
répond à l'exigence du référentiel CDA (accès aux données SQL **et** NoSQL) :

- **PostgreSQL (relationnelle)** pour les données structurées et fortement liées :
  rôles, membres, cotisations, paiements, reçus. Ces données nécessitent
  l'intégrité référentielle, des transactions et des contraintes strictes.
- **MongoDB (NoSQL orientée document)** pour les données moins structurées,
  volumineuses et à forte fréquence d'écriture : notifications et annonces.
  Le choix du NoSQL se justifie par la souplesse du schéma, l'historique
  potentiellement volumineux et l'absence de besoin de jointures complexes.

---

## 2. Modèle Conceptuel de Données (MCD)

Le MCD décrit les entités du domaine et leurs associations, indépendamment de
toute technologie.

### Entités (PostgreSQL)

- **ROLE** : type de membre et montant de cotisation associé.
- **MEMBRE** : adhérent de l'association.
- **COTISATION** : échéance mensuelle due par un membre.
- **PAIEMENT** : règlement d'une cotisation par un membre.
- **RECU** : justificatif émis pour un paiement validé.

### Entités (MongoDB)

- **NOTIFICATION** : message reçu par un membre.
- **ANNONCE** : communication publiée par un administrateur.

### Associations et cardinalités

| Association | Cardinalité | Règle de gestion |
|---|---|---|
| ROLE **définit** MEMBRE | (1,1) — (0,n) | Un membre a un seul rôle ; un rôle concerne plusieurs membres (RG1) |
| MEMBRE **doit** COTISATION | (1,1) — (0,n) | Une cotisation appartient à un membre ; un membre a plusieurs cotisations (RG2) |
| COTISATION **est réglée par** PAIEMENT | (0,1) — (1,1) | Une cotisation a au plus un paiement ; un paiement règle une cotisation |
| MEMBRE **effectue** PAIEMENT | (1,1) — (0,n) | Un paiement est fait par un membre |
| PAIEMENT **génère** RECU | (0,1) — (1,1) | Un paiement validé génère un reçu unique (RG6) |
| MEMBRE **reçoit** NOTIFICATION | (1,1) — (0,n) | Une notification est destinée à un membre |
| MEMBRE **publie** ANNONCE | (1,1) — (0,n) | Une annonce est publiée par un administrateur (membre) |

---

## 3. Modèle Logique de Données (MLD)

Le MLD traduit le MCD en tables relationnelles. Les clés primaires sont
soulignées (PK), les clés étrangères suffixées par `#` (FK).

```
ROLE (id_role PK, libelle, montant_cotisation)

MEMBRE (id_membre PK, id_role#, nom, prenom, email, telephone,
        mot_de_passe, actif, date_adhesion)

COTISATION (id_cotisation PK, id_membre#, mois, annee, montant,
            statut, date_echeance)

PAIEMENT (id_paiement PK, id_membre#, id_cotisation#, montant, mode,
          statut, date_declaration, date_validation)

RECU (id_recu PK, id_paiement#, numero, date_emission)
```

Collections MongoDB (schéma documentaire) :

```
notifications {
  _id, membre_id, type, contenu, lu (booléen), date_creation
}

annonces {
  _id, auteur_id, titre, contenu, date_publication
}
```

### Règles de passage appliquées

- Chaque entité devient une table.
- Chaque association de type (1,n) génère une clé étrangère côté « plusieurs ».
- Le `montant` est dupliqué dans COTISATION (et non simplement lu depuis ROLE)
  afin de **conserver l'historique** : si le montant d'un rôle change, les
  cotisations passées gardent le montant appliqué à l'époque.

---

## 4. Modèle Physique de Données (MPD) — PostgreSQL

Le MPD précise les types, clés, contraintes et index pour PostgreSQL.

```sql
CREATE TABLE role (
    id_role            SERIAL PRIMARY KEY,
    libelle            VARCHAR(50)  NOT NULL UNIQUE,
    montant_cotisation NUMERIC(6,2) NOT NULL CHECK (montant_cotisation >= 0)
);

CREATE TABLE membre (
    id_membre     SERIAL PRIMARY KEY,
    id_role       INTEGER NOT NULL REFERENCES role(id_role),
    nom           VARCHAR(100) NOT NULL,
    prenom        VARCHAR(100) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    telephone     VARCHAR(20),
    mot_de_passe  VARCHAR(255) NOT NULL,
    actif         BOOLEAN NOT NULL DEFAULT TRUE,
    date_adhesion DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE cotisation (
    id_cotisation SERIAL PRIMARY KEY,
    id_membre     INTEGER NOT NULL REFERENCES membre(id_membre),
    mois          SMALLINT NOT NULL CHECK (mois BETWEEN 1 AND 12),
    annee         SMALLINT NOT NULL,
    montant       NUMERIC(6,2) NOT NULL CHECK (montant >= 0),
    statut        VARCHAR(30) NOT NULL DEFAULT 'due',
    date_echeance DATE NOT NULL,
    CONSTRAINT uq_cotisation_periode UNIQUE (id_membre, mois, annee)
);

CREATE TABLE paiement (
    id_paiement      SERIAL PRIMARY KEY,
    id_membre        INTEGER NOT NULL REFERENCES membre(id_membre),
    id_cotisation    INTEGER NOT NULL UNIQUE REFERENCES cotisation(id_cotisation),
    montant          NUMERIC(6,2) NOT NULL CHECK (montant >= 0),
    mode             VARCHAR(20) NOT NULL,
    statut           VARCHAR(30) NOT NULL DEFAULT 'declare',
    date_declaration TIMESTAMP NOT NULL DEFAULT NOW(),
    date_validation  TIMESTAMP
);

CREATE TABLE recu (
    id_recu      SERIAL PRIMARY KEY,
    id_paiement  INTEGER NOT NULL UNIQUE REFERENCES paiement(id_paiement),
    numero       VARCHAR(50) NOT NULL UNIQUE,
    date_emission TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index pour accélérer les requêtes fréquentes
CREATE INDEX idx_cotisation_membre ON cotisation(id_membre);
CREATE INDEX idx_cotisation_statut ON cotisation(statut);
CREATE INDEX idx_paiement_statut   ON paiement(statut);
```

### Contraintes et choix justifiés (à valoriser devant le jury)

- **`uq_cotisation_periode`** : empêche de créer deux cotisations pour le même
  membre sur le même mois/année (intégrité métier, RG2).
- **`id_cotisation UNIQUE`** dans `paiement` : garantit qu'une cotisation n'a
  qu'un seul paiement (RG3).
- **`CHECK` sur les montants et le mois** : sécurité des données au niveau base.
- **Index** sur `statut` et `id_membre` : performance du tableau de bord
  trésorier (filtrage des retards), nécessaire pour supporter 500+ membres (BNF4).
- **Mots de passe** : stockés hachés (jamais en clair) — le champ contient le
  hash bcrypt/argon2, d'où la longueur 255.

---

## 5. Dictionnaire de données (extrait)

| Table | Champ | Type | Description |
|---|---|---|---|
| membre | email | VARCHAR(255) | Identifiant de connexion, unique |
| membre | mot_de_passe | VARCHAR(255) | Hash du mot de passe |
| cotisation | statut | VARCHAR(30) | due / en_attente / payee / en_retard / rejetee |
| paiement | mode | VARCHAR(20) | virement / wero / stripe |
| paiement | statut | VARCHAR(30) | declare / valide / rejete |
| recu | numero | VARCHAR(50) | Référence unique du reçu |

---

## 6. Lien avec les compétences CDA

- **C7** : conception complète MCD → MLD → MPD, contraintes d'intégrité, index,
  normalisation.
- **C8** : accès aux données sur deux paradigmes — requêtes SQL sur PostgreSQL et
  opérations documentaires sur MongoDB — avec justification du choix de chaque
  base.