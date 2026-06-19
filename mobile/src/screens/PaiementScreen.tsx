import { useState, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getMesCotisations } from "../services/cotisation.service";
import { declarerPaiement } from "../services/paiement.service";
import Toast from "../components/Toast";

const MOIS = ["", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const MODES = [
  { cle: "virement", label: "Virement bancaire" },
  { cle: "wero", label: "Wero" },
  { cle: "stripe", label: "Carte (en ligne)" },
];

export default function PaiementScreen() {
  const [aRegler, setARegler] = useState<any[]>([]);
  const [chargement, setChargement] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [selection, setSelection] = useState<any>(null);
  const [mode, setMode] = useState("virement");
  const [envoi, setEnvoi] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "succes" | "erreur" } | null>(null);

  const charger = useCallback(async () => {
    try {
      const result = await getMesCotisations();
      // On ne garde que les échéances réglables (ni payées, ni déjà en attente)
      const reglables = (result.cotisations || []).filter(
        (c: any) => c.statut === "due" || c.statut === "en_retard"
      );
      setARegler(reglables);
    } catch (error) {
      console.log("Erreur paiement", error);
    } finally {
      setChargement(false);
      setRefresh(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { charger(); }, [charger]));

  async function declarer() {
    if (!selection) return;
    setEnvoi(true);
    try {
      await declarerPaiement(selection.id, mode);
      setToast({ message: "Paiement déclaré, en attente de validation.", type: "succes" });
      setSelection(null);
      charger();
    } catch (error: any) {
      const message = error.response?.data?.error || "Erreur lors de la déclaration";
      setToast({ message, type: "erreur" });
    } finally {
      setEnvoi(false);
    }
  }

  if (chargement) {
    return <View style={styles.loader}><ActivityIndicator size="large" color="#15326B" /></View>;
  }

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.headerTitre}>Payer ma cotisation</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.contenu}
        refreshControl={<RefreshControl refreshing={refresh} onRefresh={() => { setRefresh(true); charger(); }} />}
      >
        {aRegler.length === 0 ? (
          <Text style={styles.vide}>Vous êtes à jour, rien à régler !</Text>
        ) : (
          <>
            <Text style={styles.section}>Échéances à régler</Text>
            {aRegler.map((c) => {
              const active = selection?.id === c.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.echeance, active && styles.echeanceActive]}
                  onPress={() => setSelection(c)}
                >
                  <View>
                    <Text style={styles.echeanceMois}>{MOIS[c.mois]} {c.annee}</Text>
                    <Text style={styles.echeanceMontant}>{Number(c.montant).toFixed(2)} €</Text>
                  </View>
                  {active && <Text style={styles.check}>✓</Text>}
                </TouchableOpacity>
              );
            })}

            {selection && (
              <View style={styles.panneau}>
                <Text style={styles.section}>Mode de paiement</Text>
                {MODES.map((m) => {
                  const actif = mode === m.cle;
                  return (
                    <TouchableOpacity
                      key={m.cle}
                      style={[styles.mode, actif && styles.modeActif]}
                      onPress={() => setMode(m.cle)}
                    >
                      <Text style={styles.modeLabel}>{m.label}</Text>
                      {actif && <Text style={styles.check}>✓</Text>}
                    </TouchableOpacity>
                  );
                })}

                {mode === "virement" && (
                  <View style={styles.coordonnees}>
                    <Text style={styles.coordTexte}>
                      IBAN : FR76 0000 0000 0000{"\n"}Référence : ARTM-{selection.annee}-{String(selection.mois).padStart(2, "0")}
                    </Text>
                  </View>
                )}

                <TouchableOpacity style={styles.bouton} onPress={declarer} disabled={envoi}>
                  {envoi ? <ActivityIndicator color="#15326B" /> : <Text style={styles.boutonTexte}>Déclarer le paiement</Text>}
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>
      <Toast
        message={toast?.message || null}
        type={toast?.type}
        onHide={() => setToast(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#FBF8F2" },
  loader: { flex: 1, backgroundColor: "#FBF8F2", alignItems: "center", justifyContent: "center" },
  header: { backgroundColor: "#15326B", paddingTop: 60, paddingHorizontal: 20, paddingBottom: 18 },
  headerTitre: { color: "#FBF8F2", fontSize: 18, fontWeight: "500" },
  contenu: { padding: 18 },
  vide: { color: "#0F6E56", textAlign: "center", marginTop: 40, fontSize: 15, fontWeight: "500" },
  section: { color: "#6b6760", fontSize: 13, fontWeight: "500", marginBottom: 10, marginTop: 6 },
  echeance: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#fff", borderWidth: 0.5, borderColor: "#ece6d8", borderRadius: 12, padding: 14, marginBottom: 8,
  },
  echeanceActive: { borderWidth: 1.5, borderColor: "#E8A33D" },
  echeanceMois: { fontSize: 14, color: "#2a2a28" },
  echeanceMontant: { fontSize: 12, color: "#8a857c", marginTop: 2 },
  check: { color: "#E8A33D", fontSize: 18, fontWeight: "500" },
  panneau: { marginTop: 18 },
  mode: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#fff", borderWidth: 0.5, borderColor: "#ece6d8", borderRadius: 12, padding: 14, marginBottom: 8,
  },
  modeActif: { borderWidth: 1.5, borderColor: "#E8A33D" },
  modeLabel: { fontSize: 14, color: "#2a2a28" },
  coordonnees: { backgroundColor: "#FAEEDA", borderRadius: 11, padding: 13, marginTop: 4, marginBottom: 4 },
  coordTexte: { fontSize: 12, color: "#854F0B", lineHeight: 20 },
  bouton: { backgroundColor: "#E8A33D", borderRadius: 12, paddingVertical: 15, alignItems: "center", marginTop: 16 },
  boutonTexte: { color: "#15326B", fontWeight: "500", fontSize: 16 },
});