import { useState, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getMesCotisations } from "../services/cotisation.service";
import { declarerPaiement } from "../services/paiement.service";
import { getCoordonnees } from "../services/coordonnees.service";
import Toast from "../components/Toast";
import { colors, radius, shadow, fonts } from "../theme/theme";

const MOIS = ["", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const MODES = [
  { cle: "virement", label: "Virement bancaire" },
  { cle: "wero", label: "Wero" },
  { cle: "stripe", label: "Carte (en ligne)" },
];

export default function PaiementScreen() {
  const [aRegler, setARegler] = useState<any[]>([]);
  const [coordonnees, setCoordonnees] = useState<any>(null);
  const [chargement, setChargement] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [selection, setSelection] = useState<any>(null);
  const [mode, setMode] = useState("virement");
  const [envoi, setEnvoi] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "succes" | "erreur" } | null>(null);

  const charger = useCallback(async () => {
    try {
      const [result, coords] = await Promise.all([getMesCotisations(), getCoordonnees()]);
      const reglables = (result.cotisations || []).filter(
        (c: any) => c.statut === "due" || c.statut === "en_retard"
      );
      setARegler(reglables);
      setCoordonnees(coords);
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
    return <View style={styles.loader}><ActivityIndicator size="large" color={colors.bleu} /></View>;
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
          <View style={styles.videBloc}>
            <View style={styles.videPastille}>
              <Ionicons name="checkmark-circle" size={64} color={colors.vert} />
            </View>
            <Text style={styles.videTitre}>Vous êtes à jour,</Text>
            <Text style={styles.videTitre}>rien à régler !</Text>
          </View>
        ) : (
          <>
            <Text style={styles.section}>Échéances à régler</Text>
            {aRegler.map((c) => {
              const active = selection?.id === c.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.echeance, active && styles.echeanceActive]}
                  onPress={() => setSelection(active ? null : c)}
                  activeOpacity={0.8}
                >
                  <View>
                    <Text style={styles.echeanceMois}>{MOIS[c.mois]} {c.annee}</Text>
                    <Text style={styles.echeanceMontant}>{Number(c.montant).toFixed(2)} €</Text>
                  </View>
                  {active
                    ? <Ionicons name="checkmark-circle" size={24} color={colors.or} />
                    : <Ionicons name="ellipse-outline" size={24} color={colors.bordure} />}
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
                      activeOpacity={0.8}
                    >
                      <Text style={styles.modeLabel}>{m.label}</Text>
                      {actif
                        ? <Ionicons name="checkmark-circle" size={22} color={colors.or} />
                        : <Ionicons name="ellipse-outline" size={22} color={colors.bordure} />}
                    </TouchableOpacity>
                  );
                })}

                {/* Coordonnées selon le mode choisi */}
                {mode === "virement" && (
                  <View style={styles.coordonnees}>
                    {coordonnees?.iban || coordonnees?.titulaire || coordonnees?.reference ? (
                      <Text style={styles.coordTexte}>
                        {coordonnees?.titulaire ? `Titulaire : ${coordonnees.titulaire}\n` : ""}
                        {coordonnees?.iban ? `IBAN : ${coordonnees.iban}\n` : ""}
                        {coordonnees?.reference ? `Référence : ${coordonnees.reference}` : `Référence : ARTM-${selection.annee}-${String(selection.mois).padStart(2, "0")}`}
                      </Text>
                    ) : (
                      <Text style={styles.coordTexte}>Coordonnées bancaires non renseignées. Contactez le trésorier.</Text>
                    )}
                  </View>
                )}

                {mode === "wero" && (
                  <View style={styles.coordonnees}>
                    <Text style={styles.coordTexte}>
                      {coordonnees?.numeroWero
                        ? `Numéro Wero : ${coordonnees.numeroWero}`
                        : "Numéro Wero non renseigné. Contactez le trésorier."}
                    </Text>
                  </View>
                )}

                {mode === "stripe" && (
                  <View style={styles.coordonnees}>
                    <Text style={styles.coordTexte}>
                      {coordonnees?.noteCarte || "Le paiement par carte n'est pas encore disponible."}
                    </Text>
                  </View>
                )}

                <TouchableOpacity style={styles.bouton} onPress={declarer} disabled={envoi} activeOpacity={0.85}>
                  {envoi ? <ActivityIndicator color={colors.blanc} /> : <Text style={styles.boutonTexte}>Déclarer le paiement</Text>}
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>
      <Toast message={toast?.message || null} type={toast?.type} onHide={() => setToast(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.fond },
  loader: { flex: 1, backgroundColor: colors.fond, alignItems: "center", justifyContent: "center" },
  header: { backgroundColor: colors.bleu, paddingTop: 60, paddingHorizontal: 20, paddingBottom: 22, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerTitre: { color: colors.blanc, fontSize: 19, fontFamily: fonts.semibold },
  contenu: { padding: 20 },
  videBloc: { alignItems: "center", marginTop: 60 },
  videPastille: { width: 110, height: 110, borderRadius: 55, backgroundColor: colors.badgeVertFond, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  videTitre: { color: colors.texte, fontSize: 22, fontFamily: fonts.bold, textAlign: "center", lineHeight: 30 },
  section: { color: colors.gris, fontSize: 14, fontFamily: fonts.semibold, marginBottom: 12, marginTop: 6 },
  echeance: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: colors.blanc, borderWidth: 1.5, borderColor: "transparent", borderRadius: radius.md, padding: 16, marginBottom: 10, ...shadow.carte,
  },
  echeanceActive: { borderColor: colors.or },
  echeanceMois: { fontSize: 15, color: colors.texte, fontFamily: fonts.semibold },
  echeanceMontant: { fontSize: 13, color: colors.gris, marginTop: 2, fontFamily: fonts.regular },
  panneau: { marginTop: 18 },
  mode: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: colors.blanc, borderWidth: 1.5, borderColor: "transparent", borderRadius: radius.md, padding: 16, marginBottom: 10, ...shadow.carte,
  },
  modeActif: { borderColor: colors.or },
  modeLabel: { fontSize: 15, color: colors.texte, fontFamily: fonts.medium },
  coordonnees: { backgroundColor: "#FEF3C7", borderRadius: radius.md, padding: 14, marginTop: 4, marginBottom: 4 },
  coordTexte: { fontSize: 13, color: "#92610B", lineHeight: 21, fontFamily: fonts.regular },
  bouton: { backgroundColor: colors.or, borderRadius: radius.md, paddingVertical: 16, alignItems: "center", marginTop: 16 },
  boutonTexte: { color: colors.blanc, fontFamily: fonts.semibold, fontSize: 16 },
});