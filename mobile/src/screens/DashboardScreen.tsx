import { useState, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { getMesCotisations, genererEcheances } from "../services/cotisation.service";

// Traduit un statut technique en libellé + couleurs
function styleStatut(statut: string) {
  switch (statut) {
    case "payee": return { texte: "Payée", couleur: "#0F6E56", fond: "#E1F5EE" };
    case "en_retard": return { texte: "En retard", couleur: "#A32D2D", fond: "#FCEBEB" };
    case "en_attente": return { texte: "En attente", couleur: "#854F0B", fond: "#FAEEDA" };
    default: return { texte: "À payer", couleur: "#854F0B", fond: "#FAEEDA" };
  }
}

const MOIS = ["", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

export default function DashboardScreen() {
  const { membre } = useAuth();
  const [data, setData] = useState<any>(null);
  const [chargement, setChargement] = useState(true);
  const [refresh, setRefresh] = useState(false);

  const charger = useCallback(async () => {
    try {
      // On génère les échéances manquantes, puis on récupère tout
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

  // Recharge à chaque fois que l'écran devient actif
  useFocusEffect(useCallback(() => { charger(); }, [charger]));

  if (chargement) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#15326B" />
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
      refreshControl={<RefreshControl refreshing={refresh} onRefresh={() => { setRefresh(true); charger(); }} />}
    >
      <View style={styles.header}>
        <Text style={styles.bonjour}>Bonjour,</Text>
        <Text style={styles.nom}>{membre?.prenom} {membre?.nom}</Text>

        <View style={styles.carteStatut}>
          <Text style={styles.statutLabel}>Statut de cotisation</Text>
          <Text style={[styles.statutValeur, { color: aJour ? "#5DCAA5" : "#F0B860" }]}>
            {aJour ? "À jour" : `${enRetard} mois en retard`}
          </Text>
          <Text style={styles.totalDu}>Total dû : {totalDu.toFixed(2)} €</Text>
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
  page: { flex: 1, backgroundColor: "#FBF8F2" },
  loader: { flex: 1, backgroundColor: "#FBF8F2", alignItems: "center", justifyContent: "center" },
  header: { backgroundColor: "#15326B", paddingTop: 60, paddingHorizontal: 20, paddingBottom: 24 },
  bonjour: { color: "#FBF8F2", opacity: 0.75, fontSize: 13 },
  nom: { color: "#FBF8F2", fontSize: 22, fontWeight: "500", marginTop: 2 },
  carteStatut: { backgroundColor: "#1C3E80", borderRadius: 16, padding: 16, marginTop: 20 },
  statutLabel: { color: "#FBF8F2", opacity: 0.7, fontSize: 12 },
  statutValeur: { fontSize: 18, fontWeight: "500", marginTop: 6 },
  totalDu: { color: "#FBF8F2", opacity: 0.7, fontSize: 12, marginTop: 8 },
  contenu: { padding: 20 },
  sectionTitre: { color: "#6b6760", fontSize: 13, fontWeight: "500", marginBottom: 12 },
  ligne: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#fff", borderWidth: 0.5, borderColor: "#ece6d8",
    borderRadius: 12, padding: 14, marginBottom: 8,
  },
  ligneMois: { fontSize: 14, color: "#2a2a28" },
  ligneMontant: { fontSize: 12, color: "#8a857c", marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 7 },
  badgeTexte: { fontSize: 11.5, fontWeight: "500" },
});