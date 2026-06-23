import { useState, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { getMesCotisations, genererEcheances } from "../services/cotisation.service";
import { colors, radius, shadow, fonts } from "../theme/theme";

// Traduit un statut technique en libellé + couleurs
function styleStatut(statut: string) {
  switch (statut) {
    case "payee": return { texte: "Payée", couleur: colors.badgeVertTexte, fond: colors.badgeVertFond };
    case "en_retard": return { texte: "En retard", couleur: colors.badgeRougeTexte, fond: colors.badgeRougeFond };
    case "en_attente": return { texte: "En attente", couleur: "#92610B", fond: "#FEF3C7" };
    default: return { texte: "À payer", couleur: "#92610B", fond: "#FEF3C7" };
  }
}

const MOIS = ["", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

export default function DashboardScreen() {
  const { membre, deconnexion } = useAuth();
  const [data, setData] = useState<any>(null);
  const [chargement, setChargement] = useState(true);
  const [refresh, setRefresh] = useState(false);

  const charger = useCallback(async () => {
    try {
      await genererEcheances();
      const result = await getMesCotisations();
      setData(result);
    } catch (error) {
      console.log("Erreur chargement cotisations", error);
    } finally {
      setChargement(false);
      setRefresh(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { charger(); }, [charger]));

  if (chargement) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.bleu} />
      </View>
    );
  }

  const enRetard = data?.nombreEnRetard || 0;
  const aJour = data?.aJour;
  const totalDu = (data?.cotisations || [])
    .filter((c: any) => c.statut !== "payee")
    .reduce((s: number, c: any) => s + Number(c.montant), 0);

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={{ paddingBottom: 30 }}
      refreshControl={<RefreshControl refreshing={refresh} onRefresh={() => { setRefresh(true); charger(); }} />}
    >
      <View style={styles.header}>
<       View style={styles.headerHaut}>
          <Text style={styles.bonjour}>Bonjour,</Text>
          <Text style={styles.nom} numberOfLines={1}>{membre?.prenom} {membre?.nom}</Text>
        </View>

        <View style={styles.carteStatut}>
          <View style={styles.statutHaut}>
            <View style={{ flex: 1 }}>
              <Text style={styles.statutLabel}>Statut de cotisation</Text>
              <View style={styles.statutLigne}>
                <View style={[styles.point, { backgroundColor: aJour ? colors.vert : colors.or }]} />
                <Text style={styles.statutValeur}>{aJour ? "À jour" : `${enRetard} mois en retard`}</Text>
              </View>
              <Text style={styles.totalDu}>Total dû : {totalDu.toFixed(2)} €</Text>
            </View>
            <View style={styles.iconeCalendrier}>
              <Ionicons name="calendar-outline" size={26} color={colors.blanc} />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.contenu}>
        <Text style={styles.sectionTitre}>Mes cotisations</Text>
        {(data?.cotisations || []).map((c: any) => {
          const s = styleStatut(c.statut);
          return (
            <View key={c.id} style={styles.ligne}>
              <View>
                <Text style={styles.ligneMois}>{MOIS[c.mois]} {c.annee}</Text>
                <Text style={styles.ligneMontant}>{Number(c.montant).toFixed(2)} €</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: s.fond }]}>
                <Text style={[styles.badgeTexte, { color: s.couleur }]}>{s.texte}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.fond },
  loader: { flex: 1, backgroundColor: colors.fond, alignItems: "center", justifyContent: "center" },
  header: { backgroundColor: colors.bleu, paddingTop: 60, paddingHorizontal: 20, paddingBottom: 26, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerHaut: { paddingRight: 120 },
  bonjour: { color: colors.blanc, opacity: 0.8, fontSize: 14, fontFamily: fonts.regular },
  nom: { color: colors.blanc, fontSize: 22, fontFamily: fonts.bold, marginTop: 2 },
  btnReglages: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.or, alignItems: "center", justifyContent: "center" },
  carteStatut: { backgroundColor: colors.bleuFonce, borderRadius: radius.lg, padding: 18, marginTop: 22 },
  statutHaut: { flexDirection: "row", alignItems: "center" },
  statutLabel: { color: colors.blanc, opacity: 0.75, fontSize: 13, fontFamily: fonts.regular },
  statutLigne: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  point: { width: 9, height: 9, borderRadius: 5, marginRight: 7 },
  statutValeur: { color: colors.blanc, fontSize: 20, fontFamily: fonts.semibold },
  totalDu: { color: colors.blanc, opacity: 0.8, fontSize: 13, marginTop: 8, fontFamily: fonts.regular },
  iconeCalendrier: { width: 48, height: 48, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  contenu: { padding: 20 },
  sectionTitre: { color: colors.gris, fontSize: 14, fontFamily: fonts.semibold, marginBottom: 12 },
  ligne: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: colors.blanc, borderRadius: radius.md, padding: 16, marginBottom: 10, ...shadow.carte,
  },
  ligneMois: { fontSize: 15, color: colors.texte, fontFamily: fonts.semibold },
  ligneMontant: { fontSize: 13, color: colors.gris, marginTop: 2, fontFamily: fonts.regular },
  badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  badgeTexte: { fontSize: 12, fontFamily: fonts.semibold },
});