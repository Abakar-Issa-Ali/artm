-- CreateTable
CREATE TABLE "role" (
    "id" SERIAL NOT NULL,
    "libelle" VARCHAR(50) NOT NULL,
    "montant_cotisation" DECIMAL(6,2) NOT NULL,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membre" (
    "id" SERIAL NOT NULL,
    "role_id" INTEGER NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "prenom" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "telephone" VARCHAR(20),
    "mot_de_passe" VARCHAR(255) NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "date_adhesion" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "membre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cotisation" (
    "id" SERIAL NOT NULL,
    "membre_id" INTEGER NOT NULL,
    "mois" SMALLINT NOT NULL,
    "annee" SMALLINT NOT NULL,
    "montant" DECIMAL(6,2) NOT NULL,
    "statut" VARCHAR(30) NOT NULL DEFAULT 'due',
    "date_echeance" DATE NOT NULL,

    CONSTRAINT "cotisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paiement" (
    "id" SERIAL NOT NULL,
    "membre_id" INTEGER NOT NULL,
    "cotisation_id" INTEGER NOT NULL,
    "montant" DECIMAL(6,2) NOT NULL,
    "mode" VARCHAR(20) NOT NULL,
    "statut" VARCHAR(30) NOT NULL DEFAULT 'declare',
    "date_declaration" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_validation" TIMESTAMP(3),

    CONSTRAINT "paiement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recu" (
    "id" SERIAL NOT NULL,
    "paiement_id" INTEGER NOT NULL,
    "numero" VARCHAR(50) NOT NULL,
    "date_emission" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recu_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "role_libelle_key" ON "role"("libelle");

-- CreateIndex
CREATE UNIQUE INDEX "membre_email_key" ON "membre"("email");

-- CreateIndex
CREATE INDEX "cotisation_membre_id_idx" ON "cotisation"("membre_id");

-- CreateIndex
CREATE INDEX "cotisation_statut_idx" ON "cotisation"("statut");

-- CreateIndex
CREATE UNIQUE INDEX "cotisation_membre_id_mois_annee_key" ON "cotisation"("membre_id", "mois", "annee");

-- CreateIndex
CREATE UNIQUE INDEX "paiement_cotisation_id_key" ON "paiement"("cotisation_id");

-- CreateIndex
CREATE INDEX "paiement_statut_idx" ON "paiement"("statut");

-- CreateIndex
CREATE UNIQUE INDEX "recu_paiement_id_key" ON "recu"("paiement_id");

-- CreateIndex
CREATE UNIQUE INDEX "recu_numero_key" ON "recu"("numero");

-- AddForeignKey
ALTER TABLE "membre" ADD CONSTRAINT "membre_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotisation" ADD CONSTRAINT "cotisation_membre_id_fkey" FOREIGN KEY ("membre_id") REFERENCES "membre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paiement" ADD CONSTRAINT "paiement_membre_id_fkey" FOREIGN KEY ("membre_id") REFERENCES "membre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paiement" ADD CONSTRAINT "paiement_cotisation_id_fkey" FOREIGN KEY ("cotisation_id") REFERENCES "cotisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recu" ADD CONSTRAINT "recu_paiement_id_fkey" FOREIGN KEY ("paiement_id") REFERENCES "paiement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
