// Détermine si un mois/année donné est passé par rapport à une date de référence
export function estMoisPasse(
  mois: number,
  annee: number,
  reference: Date = new Date()
): boolean {
  const anneeRef = reference.getFullYear();
  const moisRef = reference.getMonth() + 1;
  return annee < anneeRef || (annee === anneeRef && mois < moisRef);
}

// Calcule le statut initial d'une échéance selon qu'elle est passée ou non
export function calculerStatutInitial(
  mois: number,
  annee: number,
  reference: Date = new Date()
): string {
  return estMoisPasse(mois, annee, reference) ? "en_retard" : "due";
}

// Génère le numéro de reçu unique à partir d'un paiement
export function genererNumeroRecu(
  annee: number,
  mois: number,
  paiementId: number
): string {
  return `ARTM-${annee}-${String(mois).padStart(2, "0")}-${paiementId}`;
}

// Calcule le montant total dû à partir d'une liste de cotisations
export function calculerTotalDu(
  cotisations: { montant: number; statut: string }[]
): number {
  return cotisations
    .filter((c) => c.statut !== "payee")
    .reduce((total, c) => total + Number(c.montant), 0);
}