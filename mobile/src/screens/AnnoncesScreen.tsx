import { useState, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getAnnonces, getNotifications } from "../services/communication.service";

// Choisit l'icône et la couleur selon le type d'élément
function styleElement(type: string) {
  switch (type) {
    case "paiement_valide": return { symbole: "✓", couleur: "#0F6E56" };
    case "paiement_rejete": return { symbole: "✕", couleur: "#A32D2D" };
    case "relance": return { symbole: "!", couleur: "#BA7517" };
    case "annonce": return { symbole: "▸", couleur: "#E8A33D" };
    default: return { symbole: "•", couleur: "#15326B" };
  }
}

// Affiche "il y a X jours" à partir d'une date
function tempsEcoule(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const jours = Math.floor(diff / 86400000);
  if (jours === 0) return "Aujourd'hui";
  if (jours === 1) return "Hier";
  if (jours < 7) return `Il y a ${jours} jours`;
  const semaines = Math.floor(jours / 7);
  return semaines === 1 ? "Il y a 1 semaine" : `Il y a ${semaines} semaines`;
}

export default function AnnoncesScreen() {
  const [elements, setElements] = useState<any[]>([]);
  const [chargement, setChargement] = useState(true);
  const [refresh, setRefresh] = useState(false);

  const charger = useCallback(async () => {
    try {
      const [annonces, notifications] = await Promise.all([
        getAnnonces(),
        getNotifications(),
      ]);

      // On fusionne annonces et notifications dans une liste unifiée
      const annoncesFormatees = annonces.map((a: any) => ({
        id: "a" + a._id,
        type: "annonce",
        titre: a.titre,
        contenu: a.contenu,
        date: a.datePublication,
      }));
      const notifsFormatees = notifications.map((n: any) => ({
        id: "n" + n._id,
        type: n.type,
        titre: titreNotif(n.type),
        contenu: n.contenu,
        date: n.dateCreation,
      }));

      // Tri par date décroissante
      const tout = [...annoncesFormatees, ...notifsFormatees].sort(
        (x, y) => new Date(y.date).getTime() - new Date(x.date).getTime()
      );
      setElements(tout);
    } catch (error) {
      console.log("Erreur annonces", error);
    } finally {
      setChargement(false);
      setRefresh(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { charger(); }, [charger]));

  if (chargement) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#15326B" />
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.headerTitre}>Annonces</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.contenu}
        refreshControl={<RefreshControl refreshing={refresh} onRefresh={() => { setRefresh(true); charger(); }} />}
      >
        {elements.length === 0 ? (
          <Text style={styles.vide}>Aucune annonce pour le moment.</Text>
        ) : (
          elements.map((e) => {
            const s = styleElement(e.type);
            return (
              <View key={e.id} style={styles.carte}>
                <View style={styles.carteHead}>
                  <Text style={[styles.symbole, { color: s.couleur }]}>{s.symbole}</Text>
                  <Text style={styles.carteTitre}>{e.titre}</Text>
                </View>
                <Text style={styles.carteContenu}>{e.contenu}</Text>
                <Text style={styles.carteDate}>{tempsEcoule(e.date)}</Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

function titreNotif(type: string) {
  switch (type) {
    case "paiement_valide": return "Paiement validé";
    case "paiement_rejete": return "Paiement rejeté";
    case "relance": return "Rappel cotisation";
    default: return "Notification";
  }
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#FBF8F2" },
  loader: { flex: 1, backgroundColor: "#FBF8F2", alignItems: "center", justifyContent: "center" },
  header: { backgroundColor: "#15326B", paddingTop: 60, paddingHorizontal: 20, paddingBottom: 18 },
  headerTitre: { color: "#FBF8F2", fontSize: 18, fontWeight: "500" },
  contenu: { padding: 18 },
  vide: { color: "#8a857c", textAlign: "center", marginTop: 40, fontSize: 14 },
  carte: { backgroundColor: "#fff", borderWidth: 0.5, borderColor: "#ece6d8", borderRadius: 13, padding: 14, marginBottom: 11 },
  carteHead: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  symbole: { fontSize: 16, fontWeight: "500", marginRight: 8, width: 18 },
  carteTitre: { fontSize: 14, fontWeight: "500", color: "#15326B" },
  carteContenu: { fontSize: 12.5, color: "#6b6760", lineHeight: 19 },
  carteDate: { fontSize: 11, color: "#aaa399", marginTop: 8 },
});