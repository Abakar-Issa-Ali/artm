-- CreateTable
CREATE TABLE "coordonnees_paiement" (
    "id" SERIAL NOT NULL,
    "iban" VARCHAR(34),
    "titulaire" VARCHAR(150),
    "reference" VARCHAR(100),
    "numero_wero" VARCHAR(30),
    "note_carte" VARCHAR(255),
    "mise_a_jour" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coordonnees_paiement_pkey" PRIMARY KEY ("id")
);
