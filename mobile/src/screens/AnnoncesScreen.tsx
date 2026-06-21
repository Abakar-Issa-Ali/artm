import { useState, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getAnnonces, getNotifications } from "../services/communication.service";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, shadow, fonts } from "../theme/theme";

function styleElement(type: string) {
  switch (type) {
    case "paiement_valide": return { icone: "checkmark-circle", couleur: colors.vert, fond: colors.badgeVertFond };
    case "paiement_rejete": return { icone: "close-circle", couleur: colors.rouge, fond: colors.badgeRougeFond };
    case "relance": return { icone: "alert-circle", couleur: colors.or, fond: "#FEF3C7" };
    case "annonce": return { icone: "information-circle", couleur: colors.bleu, fond: "#DBEAFE" };
    default: return { icone: "notifications", couleur: colors.bleu, fond: "#DBEAFE" };
  }
}

function tempsEcoule(dateStr: string) {
  const date = new Date(dateStr);
  const maintenant = new Date();
  const diffMs = maintenant.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);

  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  if (diffH < 24) return `Il y a ${diffH} h`;

  const heure = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const jourDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const jourMaintenant = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate());
  const diffJours = Math.round((jourMaintenant.getTime() - jourDate.getTime()) / 86400000);

  if (diffJours === 1) return `Hier à ${heure}`;
  if (diffJours < 7) {
    const jour = date.toLocaleDateString("fr-FR", { weekday: "long" });
    return `${jour.charAt(0).toUpperCase() + jour.slice(1)} à ${heure}`;
  }
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function titreNotif(type: string) {
  switch (type) {
    case "paiement_valide": return "Paiement validé";
    case "paiement_rejete": return "Paiement rejeté";
    case "relance": return "Rappel cotisation";
    default: return "Notification";
  }
}

// Les onglets de filtre et les types qu'ils affichent
const FILTRES = [
  { cle: "toutes", label: "Toutes" },
  { cle: "infos", label: "Infos" },
  { cle: "paiements", label: "Paiements" },
];

export default function AnnoncesScreen() {
  const [elements, setElements] = useState<any[]>([]);
  const [chargement, setChargement] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [filtre, setFiltre] = useState("toutes");

  const charger = useCallback(async () => {
    try {
      const [annonces, notifications] = await Promise.all([
        getAnnonces(),
        getNotifications(),
      ]);

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

  // Filtre les éléments selon l'onglet actif
  const elementsFiltres = elements.filter((e) => {
    if (filtre === "toutes") return true;
    if (filtre === "infos") return e.type === "annonce";
    if (filtre === "paiements") return e.type === "paiement_valide" || e.type === "paiement_rejete" || e.type === "relance";
    return true;
  });

  if (chargement) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.bleu} />
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.headerTitre}>Annonces</Text>
      </View>

      {/* Onglets de filtre */}
      <View style={styles.filtres}>
        {FILTRES.map((f) => {
          const actif = filtre === f.cle;
          return (
            <TouchableOpacity
              key={f.cle}
              style={[styles.filtreBtn, actif && styles.filtreBtnActif]}
              onPress={() => setFiltre(f.cle)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filtreTexte, actif && styles.filtreTexteActif]}>{f.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={styles.contenu}
        refreshControl={<RefreshControl refreshing={refresh} onRefresh={() => { setRefresh(true); charger(); }} />}
      >
        {elementsFiltres.length === 0 ? (
          <Text style={styles.vide}>Aucune annonce dans cette catégorie.</Text>
        ) : (
          elementsFiltres.map((e) => {
            const s = styleElement(e.type);
            return (
              <View key={e.id} style={styles.carte}>
                <View style={styles.carteHead}>
                  <View style={[styles.pastille, { backgroundColor: s.fond }]}>
                    <Ionicons name={s.icone as any} size={20} color={s.couleur} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.carteTitre}>{e.titre}</Text>
                    <Text style={styles.carteDate}>{tempsEcoule(e.date)}</Text>
                  </View>
                </View>
                <Text style={styles.carteContenu}>{e.contenu}</Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.fond },
  loader: { flex: 1, backgroundColor: colors.fond, alignItems: "center", justifyContent: "center" },
  header: { backgroundColor: colors.bleu, paddingTop: 60, paddingHorizontal: 20, paddingBottom: 22, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerTitre: { color: colors.blanc, fontSize: 22, fontFamily: fonts.bold },
filtres: { flexDirection: "row", justifyContent: "center", paddingHorizontal: 20, paddingTop: 16, gap: 8 },
  filtreBtn: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 20, backgroundColor: colors.blanc, borderWidth: 1, borderColor: colors.bordure },
  filtreBtnActif: { backgroundColor: colors.bleu, borderColor: colors.bleu },
  filtreTexte: { fontSize: 13.5, color: colors.gris, fontFamily: fonts.medium },
  filtreTexteActif: { color: colors.blanc, fontFamily: fonts.semibold },
  contenu: { padding: 20, paddingTop: 16 },
  vide: { color: colors.gris, textAlign: "center", marginTop: 40, fontSize: 14, fontFamily: fonts.regular },
  carte: { backgroundColor: colors.blanc, borderRadius: radius.lg, padding: 16, marginBottom: 12, ...shadow.carte },
  carteHead: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  pastille: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", marginRight: 12 },
  carteTitre: { fontSize: 15, fontFamily: fonts.semibold, color: colors.texte },
  carteDate: { fontSize: 12, color: colors.grisClair, marginTop: 2, fontFamily: fonts.regular },
  carteContenu: { fontSize: 13.5, color: colors.gris, lineHeight: 20, fontFamily: fonts.regular },
});