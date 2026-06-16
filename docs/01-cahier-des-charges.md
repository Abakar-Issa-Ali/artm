# Cahier des charges — Application ARTM

**Projet :** Application de gestion des adhésions, cotisations et communication
**Commanditaire :** Association des Ressortissants Tchadiens à Marseille (ARTM)
**Compétence CDA visée :** C5 — Analyser les besoins et maquetter une application
**Version :** 1.0
**Date :** _à compléter_
**Auteur :** Abakar Issa Ali

---

## 1. Contexte

L'Association des Ressortissants Tchadiens à Marseille (ARTM) est une association
loi 1901 qui regroupe aujourd'hui plus de **200 membres**, avec un objectif de
croissance dépassant **500 adhérents**. Elle a pour vocation l'entraide, la
solidarité et le maintien du lien communautaire entre ses membres.

Le financement de l'association repose principalement sur des **cotisations
mensuelles** versées par les adhérents. Actuellement, ces cotisations sont
collectées de deux manières :

- par **virement bancaire** sur le compte de l'association ;
- en **espèces, de la main à la main**, remises au trésorier.

Cette gestion manuelle atteint ses limites à mesure que le nombre d'adhérents
augmente. Le suivi des paiements repose sur des tableurs et la mémoire du
trésorier, ce qui génère des erreurs, un manque de visibilité pour les membres et
une charge de travail croissante pour le bureau.

## 2. Problématique

Comment permettre à l'ARTM de **gérer efficacement les adhésions, le suivi des
cotisations et la communication avec ses membres**, tout en garantissant la
transparence financière et en supportant une croissance vers 500 membres et plus ?

## 3. Objectifs du projet

### Objectif principal

Développer une **application mobile** accompagnée d'une **API backend
sécurisée** permettant une gestion centralisée, fiable et transparente des
adhésions, des paiements et de la communication interne de l'association.

### Objectifs détaillés (priorités exprimées par le commanditaire)

1. **Suivi des paiements et des retards** — visualiser en temps réel qui est à
   jour, qui est en retard, et automatiser les relances.
2. **Communication et annonces aux membres** — diffuser des informations
   officielles (assemblées, événements, rappels) directement dans l'application.
3. **Gestion des profils membres** — centraliser les informations d'adhésion et
   permettre à chaque membre de consulter et mettre à jour ses données.
4. **Reçus et transparence financière** — générer des justificatifs de paiement
   et donner à chaque membre une vision claire de sa situation.

## 4. Périmètre du projet

### Dans le périmètre (MVP)

- Authentification et gestion des rôles (membre, trésorier/administrateur).
- Gestion des profils membres (création, consultation, mise à jour).
- Gestion des cotisations mensuelles et calcul automatique du statut
  (à jour / en retard).
- Enregistrement et suivi des paiements (virement, espèces) avec génération
  de reçus.
- Tableau de bord administrateur pour le suivi global et la relance.
- Système de notifications et d'annonces aux membres.

### Hors périmètre (V1)

- Comptabilité complète de l'association (bilans, exercices comptables).
- Intégration d'un terminal de paiement physique.
- Application web destinée au grand public (le besoin est interne).
- Gestion des événements avec billetterie.

> Le paiement en ligne (type Stripe) est considéré comme une **évolution
> souhaitable** : il pourra être intégré en mode test pour illustrer la
> compétence, mais n'est pas indispensable au fonctionnement de l'association
> qui conserve virement et espèces.

## 5. Acteurs et rôles

| Acteur | Description | Droits principaux |
|---|---|---|
| **Membre** | Adhérent de l'association | Consulter son profil, voir ses cotisations et reçus, recevoir les annonces |
| **Trésorier / Administrateur** | Membre du bureau gérant les finances | Gérer les membres, enregistrer les paiements, suivre les retards, envoyer des annonces |
| **Bureau** | Instances dirigeantes | Vue d'ensemble, transparence financière |

## 6. Besoins fonctionnels

| Réf. | Besoin | Priorité |
|---|---|---|
| BF1 | S'inscrire et se connecter de façon sécurisée | Must |
| BF2 | Gérer son profil membre | Must |
| BF3 | Consulter l'état de ses cotisations (à jour / en retard) | Must |
| BF4 | Consulter l'historique de ses paiements et ses reçus | Must |
| BF5 | Pour le trésorier : enregistrer un paiement (virement/espèces) | Must |
| BF6 | Pour le trésorier : visualiser tous les membres et leur statut | Must |
| BF7 | Générer un reçu / justificatif de paiement | Must |
| BF8 | Recevoir des annonces et notifications de l'association | Must |
| BF9 | Pour le trésorier : envoyer des annonces et relances | Should |
| BF10 | Relance automatique des membres en retard | Should |
| BF11 | Paiement en ligne (Stripe en mode test) | Could |

_Priorisation MoSCoW : Must (indispensable), Should (important), Could (souhaitable)._

## 7. Besoins non fonctionnels

| Réf. | Besoin | Description |
|---|---|---|
| BNF1 | **Sécurité** | Authentification JWT, mots de passe hachés, recommandations ANSSI/OWASP |
| BNF2 | **Confidentialité (RGPD)** | Données personnelles protégées, consentement, droit à l'effacement |
| BNF3 | **Accessibilité** | Respect des principes RGAA dans les interfaces |
| BNF4 | **Performance** | Supporter 500+ membres sans dégradation |
| BNF5 | **Disponibilité** | Application accessible sur mobile (iOS et Android) |
| BNF6 | **Maintenabilité** | Architecture en couches, code documenté, tests automatisés |
| BNF7 | **Portabilité** | Déploiement conteneurisé (Docker) |

## 8. Contraintes

- **Techniques :** application mobile multiplateforme + API REST ; deux bases de
  données (relationnelle pour les données métier, NoSQL pour les
  notifications/logs).
- **Légales :** conformité RGPD obligatoire (données nominatives des membres).
- **Organisationnelles :** projet mené dans le cadre du Titre Professionnel
  Concepteur Développeur d'Applications (RNCP 37873).
- **Budgétaires :** solution s'appuyant autant que possible sur des outils open
  source et des hébergements gratuits ou peu coûteux.

## 9. Livrables attendus

- Application mobile (React Native).
- API backend sécurisée et documentée (Swagger).
- Bases de données PostgreSQL et MongoDB.
- Documentation technique et de déploiement.
- Jeu de tests automatisés et cahiers de recette.

## 10. Critères de réussite

- Un membre peut consulter sa situation de cotisation en moins de 3 clics.
- Le trésorier dispose d'une vue consolidée des retards.
- 100 % des paiements enregistrés génèrent un reçu.
- L'application couvre les 11 compétences du référentiel CDA.