import { useState, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getAnnonces, getNotifications } from "../services/communication.service";
import { Ionicons } from "@expo/vector-icons";

// Choisit l'icône et la couleur selon le type d'élément
function styleElement(type: string) {
  switch (type) {
    case "paiement_valide": return { icone: "checkmark-circle", couleur: "#0F6E56" };
    case "paiement_rejete": return { icone: "close-circle", couleur: "#A32D2D" };
    case "relance": return { icone: "alert-circle", couleur: "#BA7517" };
    case "annonce": return { icone: "megaphone", couleur: "#E8A33D" };
    default: return { icone: "notifications", couleur: "#15326B" };
  }
}

// Affiche de date 
function tempsEcoule(dateStr: string) {
  const date = new Date(dateStr);
  const maintenant = new Date();
  const diffMs = maintenant.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);

  // Moins d'une minute
  if (diffMin < 1) return "À l'instant";
  // Moins d'une heure : en minutes
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  // Moins de 24h : en heures
  if (diffH < 24) return `Il y a ${diffH} h`;

  // Heure formatée (ex: "14:30")
  const heure = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  // Comparaison par jours calendaires
  const jourDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const jourMaintenant = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate());
  const diffJours = Math.round((jourMaintenant.getTime() - jourDate.getTime()) / 86400000);

  // Hier
  if (diffJours === 1) return `Hier à ${heure}`;
  // Cette semaine : jour de la semaine (ex: "Mercredi à 14:30")
  if (diffJours < 7) {
    const jour = date.toLocaleDateString("fr-FR", { weekday: "long" });
    const jourCapital = jour.charAt(0).toUpperCase() + jour.slice(1);
    return `${jourCapital} à ${heure}`;
  }
  // Au-delà : date complète (ex: "12 juin 2026")
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
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
                  <Ionicons name={s.icone as any} size={17} color={s.couleur} style={{ marginRight: 8 }} />
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