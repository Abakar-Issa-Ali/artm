import { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, RefreshControl } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getPaiementsEnAttente, validerPaiement, rejeterPaiement } from "../../services/tresorier.service";

const MOIS = ["", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

export default function ValidationScreen() {
  const [paiements, setPaiements] = useState<any[]>([]);
  const [chargement, setChargement] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [traitement, setTraitement] = useState<number | null>(null);

  const charger = useCallback(async () => {
    try {
      const data = await getPaiementsEnAttente();
      setPaiements(data);
    } catch (error) {
      console.log("Erreur validation", error);
    } finally {
      setChargement(false);
      setRefresh(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { charger(); }, [charger]));

  async function traiter(id: number, action: "valider" | "rejeter") {
    setTraitement(id);
    try {
      if (action === "valider") {
        await validerPaiement(id);
      } else {
        await rejeterPaiement(id);
      }
      await charger();
    } catch (error: any) {
      Alert.alert("Erreur", error.response?.data?.error || "Action impossible");
    } finally {
      setTraitement(null);
    }
  }

  function confirmer(id: number, action: "valider" | "rejeter", nom: string) {
    const verbe = action === "valider" ? "Valider" : "Rejeter";
    Alert.alert(`${verbe} le paiement`, `${verbe} le paiement de ${nom} ?`, [
      { text: "Annuler", style: "cancel" },
      { text: verbe, onPress: () => traiter(id, action), style: action === "rejeter" ? "destructive" : "default" },
    ]);
  }

  if (chargement) {
    return <View style={styles.loader}><ActivityIndicator size="large" color="#15326B" /></View>;
  }

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.headerTitre}>Paiements à valider</Text>
        <Text style={styles.headerSous}>{paiements.length} en attente</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.contenu}
        refreshControl={<RefreshControl refreshing={refresh} onRefresh={() => { setRefresh(true); charger(); }} />}
      >
        {paiements.length === 0 ? (
          <Text style={styles.vide}>Aucun paiement en attente 🎉</Text>
        ) : (
          paiements.map((p) => {
            const nom = `${p.membre.prenom} ${p.membre.nom}`;
            const enCours = traitement === p.id;
            return (
              <View key={p.id} style={styles.carte}>
                <View style={styles.carteHead}>
                  <View>
                    <Text style={styles.nom}>{nom}</Text>
                    <Text style={styles.detail}>
                      {MOIS[p.cotisation.mois]} {p.cotisation.annee} · {Number(p.montant).toFixed(2)} € · {p.mode}
                    </Text>
                  </View>
                </View>
                {enCours ? (
                  <ActivityIndicator color="#15326B" style={{ marginTop: 12 }} />
                ) : (
                  <View style={styles.actions}>
                    <TouchableOpacity style={[styles.btn, styles.btnRejeter]} onPress={() => confirmer(p.id, "rejeter", nom)}>
                      <Text style={styles.btnRejeterTexte}>Rejeter</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btn, styles.btnValider]} onPress={() => confirmer(p.id, "valider", nom)}>
                      <Text style={styles.btnValiderTexte}>Valider</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#FBF8F2" },
  loader: { flex: 1, backgroundColor: "#FBF8F2", alignItems: "center", justifyContent: "center" },
  header: { backgroundColor: "#15326B", paddingTop: 60, paddingHorizontal: 20, paddingBottom: 18 },
  headerTitre: { color: "#FBF8F2", fontSize: 18, fontWeight: "500" },
  headerSous: { color: "#FBF8F2", opacity: 0.7, fontSize: 13, marginTop: 3 },
  contenu: { padding: 18 },
  vide: { color: "#0F6E56", textAlign: "center", marginTop: 40, fontSize: 15, fontWeight: "500" },
  carte: { backgroundColor: "#fff", borderWidth: 0.5, borderColor: "#ece6d8", borderRadius: 13, padding: 15, marginBottom: 11 },
  carteHead: { marginBottom: 12 },
  nom: { fontSize: 15, fontWeight: "500", color: "#15326B" },
  detail: { fontSize: 12.5, color: "#8a857c", marginTop: 3 },
  actions: { flexDirection: "row", gap: 10 },
  btn: { flex: 1, paddingVertical: 11, borderRadius: 10, alignItems: "center" },
  btnValider: { backgroundColor: "#E8A33D" },
  btnValiderTexte: { color: "#15326B", fontWeight: "500", fontSize: 14 },
  btnRejeter: { backgroundColor: "#fff", borderWidth: 0.5, borderColor: "#d8c4c4" },
  btnRejeterTexte: { color: "#A32D2D", fontWeight: "500", fontSize: 14 },
});