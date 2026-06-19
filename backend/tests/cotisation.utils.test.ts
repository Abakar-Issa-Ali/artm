import {
  estMoisPasse,
  calculerStatutInitial,
  genererNumeroRecu,
  calculerTotalDu,
} from "../src/utils/cotisation.utils.js";

describe("Logique métier des cotisations", () => {
  // Date de référence fixe pour des tests reproductibles : juin 2026
  const reference = new Date(2026, 5, 15); // mois 5 = juin (0-indexé)

  describe("estMoisPasse", () => {
    it("considère un mois antérieur comme passé", () => {
      expect(estMoisPasse(3, 2026, reference)).toBe(true); // mars 2026
    });

    it("considère une année antérieure comme passée", () => {
      expect(estMoisPasse(12, 2025, reference)).toBe(true);
    });

    it("ne considère pas le mois courant comme passé", () => {
      expect(estMoisPasse(6, 2026, reference)).toBe(false); // juin 2026
    });

    it("ne considère pas un mois futur comme passé", () => {
      expect(estMoisPasse(8, 2026, reference)).toBe(false);
    });
  });

  describe("calculerStatutInitial", () => {
    it("retourne 'en_retard' pour un mois passé", () => {
      expect(calculerStatutInitial(4, 2026, reference)).toBe("en_retard");
    });

    it("retourne 'due' pour le mois courant", () => {
      expect(calculerStatutInitial(6, 2026, reference)).toBe("due");
    });
  });

  describe("genererNumeroRecu", () => {
    it("génère un numéro au bon format", () => {
      expect(genererNumeroRecu(2026, 3, 1)).toBe("ARTM-2026-03-1");
    });

    it("complète le mois avec un zéro", () => {
      expect(genererNumeroRecu(2026, 9, 42)).toBe("ARTM-2026-09-42");
    });
  });

  describe("calculerTotalDu", () => {
    it("additionne les cotisations non payées", () => {
      const cotisations = [
        { montant: 5, statut: "due" },
        { montant: 5, statut: "en_retard" },
        { montant: 5, statut: "payee" },
      ];
      expect(calculerTotalDu(cotisations)).toBe(10); // 5 + 5, la payée exclue
    });

    it("retourne 0 si tout est payé", () => {
      const cotisations = [
        { montant: 5, statut: "payee" },
        { montant: 10, statut: "payee" },
      ];
      expect(calculerTotalDu(cotisations)).toBe(0);
    });
  });
});