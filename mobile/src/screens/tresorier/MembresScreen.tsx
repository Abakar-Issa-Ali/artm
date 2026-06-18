import { useState, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getMembres } from "../../services/tresorier.service";

export default function MembresScreen() {
  const [membres, setMembres] = useState<any[]>([]);
  const [chargement, setChargement] = useState(true);
  const [refresh, setRefresh] = useState(false);

  const charger = useCallback(async () => {
    try {
      const data = await getMembres();
      setMembres(data);
    } catch (error) {
      console.log("Erreur membres", error);
    } finally {
      setChargement(false);
      setRefresh(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { charger(); }, [charger]));

  if (chargement) {
    return <View style={styles.loader}><ActivityIndicator size="large" color="#15326B" /></View>;
  }

  const aJour = membres.filter((m) => m.aJour).length;

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.headerTitre}>Membres</Text>
        <Text style={styles.headerSous}>{membres.length} membres · {aJour} à jour</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.contenu}
        refreshControl={<RefreshControl refreshing={refresh} onRefresh={() => { setRefresh(true); charger(); }} />}
      >
        {membres.map((m) => {
          const initiales = `${m.prenom?.[0] || ""}${m.nom?.[0] || ""}`.toUpperCase();
          return (
            <View key={m.id} style={styles.ligne}>
              <View style={styles.avatar}><Text style={styles.avatarTexte}>{initiales}</Text></View>
              <View style={styles.infos}>
                <Text style={styles.nom}>{m.prenom} {m.nom}</Text>
                <Text style={styles.role}>{m.role}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: m.aJour ? "#E1F5EE" : "#FCEBEB" }]}>
                <Text style={[styles.badgeTexte, { color: m.aJour ? "#0F6E56" : "#A32D2D" }]}>
                  {m.aJour ? "À jour" : `${m.nombreEnRetard} retard${m.nombreEnRetard > 1 ? "s" : ""}`}
                </Text>
              </View>
            </View>
          );
        })}
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
  ligne: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderWidth: 0.5, borderColor: "#ece6d8", borderRadius: 12, padding: 12, marginBottom: 8 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#15326B", alignItems: "center", justifyContent: "center", marginRight: 12 },
  avatarTexte: { color: "#E8A33D", fontWeight: "500", fontSize: 14 },
  infos: { flex: 1 },
  nom: { fontSize: 14, fontWeight: "500", color: "#2a2a28" },
  role: { fontSize: 12, color: "#8a857c", marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 7 },
  badgeTexte: { fontSize: 11.5, fontWeight: "500" },
});