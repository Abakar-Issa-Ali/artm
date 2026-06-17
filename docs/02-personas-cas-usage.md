## Personas et cas d'usage — Application ARTM

**Compétence CDA visée :** C5 — Analyser les besoins et maquetter une application
**Version :** 1.0
**Ticket :** #2

---

## 1. Personas

Les personas représentent les utilisateurs types de l'application. Ils guident
les choix de conception et de priorisation.

### Persona 1 — Le membre simple : « Fatimé »

| | |
|---|---|
| **Rôle** | Membre adhérent de l'association |
| **Âge / profil** | 34 ans, vit à Marseille, peu à l'aise avec les démarches administratives |
| **Cotisation** | 5 €/mois |
| **Équipement** | Smartphone Android, utilise WhatsApp au quotidien |
| **Objectifs** | Payer sa cotisation simplement, savoir si elle est à jour, rester informée des activités de l'association |
| **Frustrations** | Ne sait jamais si son paiement a été pris en compte, rate les annonces importantes, doit appeler le trésorier pour vérifier |
| **Citation** | « Je veux juste payer ma cotisation tranquillement depuis mon téléphone et avoir une preuve. » |

### Persona 2 — Le membre du bureau exécutif : « Mahamat »

| | |
|---|---|
| **Rôle** | Membre du bureau exécutif |
| **Âge / profil** | 45 ans, impliqué dans la vie de l'association |
| **Cotisation** | 10 €/mois |
| **Équipement** | iPhone, à l'aise avec les applications |
| **Objectifs** | Comme un membre simple, mais avec un montant de cotisation différent ; veut donner l'exemple en étant toujours à jour |
| **Frustrations** | La gestion actuelle manque de sérieux et de transparence |
| **Citation** | « En tant que membre du bureau, je dois montrer l'exemple et l'association doit être bien gérée. » |

### Persona 3 — Le trésorier / administrateur : « Hawa »

| | |
|---|---|
| **Rôle** | Trésorière, gère les finances et les adhésions |
| **Âge / profil** | 40 ans, rigoureuse, déborde de travail |
| **Équipement** | Smartphone + ordinateur |
| **Objectifs** | Suivre tous les paiements, identifier les retards, valider les paiements déclarés, communiquer avec les membres, garantir la transparence |
| **Frustrations** | Passe des heures sur des tableurs, court après les retardataires, doit répondre individuellement aux membres qui demandent leur situation |
| **Citation** | « J'ai besoin d'une vue claire de qui a payé et qui est en retard, sans tout vérifier à la main. » |

---

## 2. Diagramme des cas d'usage (description textuelle)

> À transformer en diagramme UML (cas d'utilisation) dans Figma/draw.io pour le
> dossier. La structure ci-dessous sert de base.

### Acteurs

- **Membre** (inclut membre simple et membre du bureau)
- **Trésorier / Administrateur** (hérite des droits du membre + droits de gestion)

### Cas d'usage par acteur

**Membre :**
- S'inscrire / se connecter
- Consulter et modifier son profil
- Consulter l'état de ses cotisations
- Déclarer un paiement (virement / Wero)
- Payer en ligne (Stripe — démonstration technique)
- Consulter l'historique et télécharger ses reçus
- Consulter les annonces et notifications

**Trésorier / Administrateur** (en plus des cas du membre) :
- Gérer les membres (créer, consulter, modifier, désactiver)
- Définir le rôle et donc le montant de cotisation (5 € ou 10 €)
- Valider un paiement déclaré
- Consulter le tableau de bord global (à jour / en retard)
- Envoyer des annonces et des relances
- Générer / consulter les reçus de tous les membres

---

## 3. Cas d'usage détaillés (scénarios principaux)

### CU1 — Déclarer un paiement de cotisation

| | |
|---|---|
| **Acteur principal** | Membre |
| **Préconditions** | Le membre est connecté ; une échéance est due |
| **Déclencheur** | Le membre veut régler sa cotisation du mois |
| **Scénario nominal** | 1. Le membre ouvre l'écran « Mes cotisations »<br>2. Il sélectionne l'échéance à payer<br>3. Il choisit le mode (virement ou Wero)<br>4. L'app affiche les coordonnées + la référence unique<br>5. Le membre effectue le paiement depuis sa banque/Wero<br>6. Il revient dans l'app et déclare le paiement effectué<br>7. Le statut passe à « En attente de validation » |
| **Scénario alternatif** | 3a. Le membre choisit le paiement en ligne (Stripe) → paiement immédiat → statut « Payé » automatiquement |
| **Postconditions** | Le paiement est enregistré, le trésorier est notifié |

### CU2 — Valider un paiement

| | |
|---|---|
| **Acteur principal** | Trésorier |
| **Préconditions** | Un paiement est en attente de validation |
| **Scénario nominal** | 1. Le trésorier consulte la liste des paiements en attente<br>2. Il vérifie la réception sur le compte de l'association<br>3. Il valide le paiement<br>4. Le statut de l'échéance passe à « Payé »<br>5. Un reçu est généré et le membre est notifié |
| **Scénario alternatif** | 3a. Le trésorier rejette le paiement (non reçu) → le membre est notifié |
| **Postconditions** | La cotisation est à jour, le reçu est disponible |

### CU3 — Suivre les retards et relancer

| | |
|---|---|
| **Acteur principal** | Trésorier |
| **Préconditions** | Des membres ont des échéances impayées |
| **Scénario nominal** | 1. Le trésorier ouvre le tableau de bord<br>2. Il filtre les membres en retard<br>3. Il sélectionne un ou plusieurs membres<br>4. Il envoie une relance (notification)<br>5. Les membres concernés reçoivent la relance |
| **Scénario alternatif** | 4a. Une relance automatique est envoyée aux membres dépassant X jours de retard |
| **Postconditions** | Les membres en retard sont relancés, l'action est tracée |

### CU4 — Consulter sa situation

| | |
|---|---|
| **Acteur principal** | Membre |
| **Préconditions** | Le membre est connecté |
| **Scénario nominal** | 1. Le membre ouvre son tableau de bord<br>2. Il voit son statut global (à jour / en retard)<br>3. Il consulte l'historique de ses cotisations et paiements<br>4. Il télécharge un reçu |
| **Postconditions** | Le membre a une vision claire et autonome de sa situation |

---

## 4. Règles de gestion (à retenir pour la suite)

- **RG1** — Le montant de la cotisation dépend du rôle : membre simple = 5 €/mois,
  membre du bureau exécutif = 10 €/mois.
- **RG2** — Une échéance de cotisation est générée chaque mois pour chaque membre actif.
- **RG3** — Une échéance peut avoir les statuts : `due`, `en attente de validation`,
  `payée`, `en retard`, `rejetée`.
- **RG4** — Une échéance non payée après la fin du mois passe automatiquement « en retard ».
- **RG5** — Seul un trésorier peut valider ou rejeter un paiement déclaré.
- **RG6** — Tout paiement validé génère un reçu unique et horodaté.
- **RG7** — Un paiement en ligne (Stripe) confirmé par webhook passe directement « payée ».