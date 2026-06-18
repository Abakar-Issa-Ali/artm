import { useState, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity, Modal, Alert, Pressable } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getMembres, changerRole, desactiverMembre, reactiverMembre, supprimerMembre } from "../../services/tresorier.service";

export default function MembresScreen() {
  const [membres, setMembres] = useState<any[]>([]);
  const [chargement, setChargement] = useState(true);
  const [refresh, setRefresh] = useState(false);

  // Membre sélectionné pour le menu d'actions
  const [selection, setSelection] = useState<any>(null);
  // Sous-menu de choix du rôle
  const [menuRoleVisible, setMenuRoleVisible] = useState(false);

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

  function fermer() {
    setSelection(null);
    setMenuRoleVisible(false);
  }

  async function action(fn: () => Promise<any>) {
    try {
      await fn();
      fermer();
      await charger();
    } catch (error: any) {
      Alert.alert("Erreur", error.response?.data?.error || "Action impossible");
    }
  }

  function confirmerSuppression(m: any) {
    Alert.alert(
      "Suppression définitive",
      `Supprimer ${m.prenom} ${m.nom} et toutes ses données ? Cette action est irréversible.`,
      [
        { text: "Annuler", style: "cancel" },
        { text: "Supprimer", style: "destructive", onPress: () => action(() => supprimerMembre(m.id)) },
      ]
    );
  }

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
            <TouchableOpacity key={m.id} style={[styles.ligne, !m.actif && { opacity: 0.5 }]} onPress={() => setSelection(m)}>
              <View style={styles.avatar}><Text style={styles.avatarTexte}>{initiales}</Text></View>
              <View style={styles.infos}>
                <Text style={styles.nom}>{m.prenom} {m.nom}</Text>
                <Text style={styles.role}>{m.role}{!m.actif && " · désactivé"}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: m.aJour ? "#E1F5EE" : "#FCEBEB" }]}>
                <Text style={[styles.badgeTexte, { color: m.aJour ? "#0F6E56" : "#A32D2D" }]}>
                  {m.aJour ? "À jour" : `${m.nombreEnRetard} retard${m.nombreEnRetard > 1 ? "s" : ""}`}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Modal d'actions personnalisé */}
      <Modal visible={!!selection} transparent animationType="fade" onRequestClose={fermer}>
        <Pressable style={styles.overlay} onPress={fermer}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            {selection && (
              <>
                <Text style={styles.sheetTitre}>{selection.prenom} {selection.nom}</Text>
                <Text style={styles.sheetSous}>
                  Rôle : {selection.role}{!selection.actif && " · désactivé"}
                </Text>

                {!menuRoleVisible ? (
                  <>
                    <TouchableOpacity style={styles.optionBtn} onPress={() => setMenuRoleVisible(true)}>
                      <Text style={styles.optionTexte}>Changer le rôle</Text>
                    </TouchableOpacity>

                    {selection.actif ? (
                      <TouchableOpacity style={styles.optionBtn} onPress={() => action(() => desactiverMembre(selection.id))}>
                        <Text style={styles.optionTexte}>Désactiver</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity style={styles.optionBtn} onPress={() => action(() => reactiverMembre(selection.id))}>
                        <Text style={styles.optionTexte}>Réactiver</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity style={styles.optionBtn} onPress={() => confirmerSuppression(selection)}>
                      <Text style={[styles.optionTexte, { color: "#A32D2D" }]}>Supprimer définitivement</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text style={styles.sheetSection}>Nouveau rôle</Text>
                    <TouchableOpacity style={styles.optionBtn} onPress={() => action(() => changerRole(selection.id, "membre"))}>
                      <Text style={styles.optionTexte}>Membre (5€)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.optionBtn} onPress={() => action(() => changerRole(selection.id, "bureau"))}>
                      <Text style={styles.optionTexte}>Bureau (10€)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.optionBtn} onPress={() => action(() => changerRole(selection.id, "tresorier"))}>
                      <Text style={styles.optionTexte}>Trésorier</Text>
                    </TouchableOpacity>
                  </>
                )}

                <TouchableOpacity style={styles.annulerBtn} onPress={fermer}>
                  <Text style={styles.annulerTexte}>Annuler</Text>
                </TouchableOpacity>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
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
  // Modal
  overlay: { flex: 1, backgroundColor: "rgba(21,50,107,0.45)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#FBF8F2", borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 22, paddingBottom: 32 },
  sheetTitre: { fontSize: 18, fontWeight: "500", color: "#15326B", textAlign: "center" },
  sheetSous: { fontSize: 13, color: "#8a857c", textAlign: "center", marginTop: 4, marginBottom: 18 },
  sheetSection: { fontSize: 12, color: "#6b6760", fontWeight: "500", marginBottom: 8 },
  optionBtn: { backgroundColor: "#fff", borderWidth: 0.5, borderColor: "#ece6d8", borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16, marginBottom: 9 },
  optionTexte: { fontSize: 15, color: "#15326B", fontWeight: "500", textAlign: "center" },
  annulerBtn: { paddingVertical: 13, marginTop: 4 },
  annulerTexte: { fontSize: 14, color: "#8a857c", textAlign: "center" },
});