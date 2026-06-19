import { useState, useCallback } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Alert, RefreshControl, KeyboardAvoidingView, Platform,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Confirm from "../../components/Confirm";
import Toast from "../../components/Toast";
import { getAnnonces } from "../../services/communication.service";
import { publierAnnonce, modifierAnnonce, supprimerAnnonce } from "../../services/tresorier.service";

export default function GestionAnnoncesScreen() {
  const [annonces, setAnnonces] = useState<any[]>([]);
  const [chargement, setChargement] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "succes" | "erreur" } | null>(null);
  const [aSupprimer, setASupprimer] = useState<any>(null);

  // Formulaire : si editId est défini, on est en mode édition
  const [editId, setEditId] = useState<string | null>(null);
  const [titre, setTitre] = useState("");
  const [contenu, setContenu] = useState("");
  const [envoi, setEnvoi] = useState(false);

  const charger = useCallback(async () => {
    try {
      const data = await getAnnonces();
      setAnnonces(data);
    } catch (error) {
      console.log("Erreur gestion annonces", error);
    } finally {
      setChargement(false);
      setRefresh(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { charger(); }, [charger]));

  function reinitialiser() {
    setEditId(null);
    setTitre("");
    setContenu("");
  }

  function editer(annonce: any) {
    setEditId(annonce._id);
    setTitre(annonce.titre);
    setContenu(annonce.contenu);
  }

  async function enregistrer() {
    if (!titre.trim() || !contenu.trim()) {
      setToast({ message: "Merci de remplir le titre et le contenu.", type: "erreur" });
      return;
    }
    setEnvoi(true);
    try {
      if (editId) {
        await modifierAnnonce(editId, titre.trim(), contenu.trim());
      } else {
        await publierAnnonce(titre.trim(), contenu.trim());
      }
      reinitialiser();
      await charger();
    } catch (error: any) {
      setToast({ message: error.response?.data?.error || "Action impossible", type: "erreur" });
    } finally {
      setEnvoi(false);
    }
  }

  function confirmerSuppression(annonce: any) {
      setASupprimer(annonce);
    }

    async function executerSuppression() {
      const annonce = aSupprimer;
      setASupprimer(null);
      if (!annonce) return;
      try {
        await supprimerAnnonce(annonce._id);
        if (editId === annonce._id) reinitialiser();
        await charger();
        setToast({ message: "Annonce supprimée", type: "succes" });
      } catch (error: any) {
        setToast({ message: error.response?.data?.error || "Suppression impossible", type: "erreur" });
      }
    }

  if (chargement) {
    return <View style={styles.loader}><ActivityIndicator size="large" color="#15326B" /></View>;
  }

  return (
    <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.header}>
        <Text style={styles.headerTitre}>Gérer les annonces</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.contenu}
        refreshControl={<RefreshControl refreshing={refresh} onRefresh={() => { setRefresh(true); charger(); }} />}
      >
        {/* Formulaire publier / modifier */}
        <View style={styles.form}>
          <Text style={styles.formTitre}>{editId ? "Modifier l'annonce" : "Nouvelle annonce"}</Text>
          <TextInput style={styles.input} placeholder="Titre" placeholderTextColor="#aaa399" value={titre} onChangeText={setTitre} />
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Contenu..."
            placeholderTextColor="#aaa399"
            value={contenu}
            onChangeText={setContenu}
            multiline
            textAlignVertical="top"
          />
          <View style={styles.formActions}>
            {editId && (
              <TouchableOpacity style={styles.btnAnnuler} onPress={reinitialiser}>
                <Text style={styles.btnAnnulerTexte}>Annuler</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.btnPublier} onPress={enregistrer} disabled={envoi}>
              {envoi ? <ActivityIndicator color="#15326B" /> : <Text style={styles.btnPublierTexte}>{editId ? "Enregistrer" : "Publier"}</Text>}
            </TouchableOpacity>
          </View>
        </View>

        {/* Liste des annonces existantes */}
        <Text style={styles.section}>Annonces publiées</Text>
        {annonces.length === 0 ? (
          <Text style={styles.vide}>Aucune annonce.</Text>
        ) : (
          annonces.map((a) => (
            <View key={a._id} style={styles.carte}>
              <Text style={styles.carteTitre}>{a.titre}</Text>
              <Text style={styles.carteContenu}>{a.contenu}</Text>
              <View style={styles.carteActions}>
                <TouchableOpacity onPress={() => editer(a)}>
                  <Text style={styles.lienModifier}>Modifier</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => confirmerSuppression(a)}>
                  <Text style={styles.lienSupprimer}>Supprimer</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
        <Confirm
        visible={!!aSupprimer}
        titre="Supprimer l'annonce"
        message={aSupprimer ? `Supprimer « ${aSupprimer.titre} » ?` : ""}
        texteConfirmer="Supprimer"
        destructif
        onConfirmer={executerSuppression}
        onAnnuler={() => setASupprimer(null)}
      />

      <Toast
        message={toast?.message || null}
        type={toast?.type}
        onHide={() => setToast(null)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#FBF8F2" },
  loader: { flex: 1, backgroundColor: "#FBF8F2", alignItems: "center", justifyContent: "center" },
  header: { backgroundColor: "#15326B", paddingTop: 60, paddingHorizontal: 20, paddingBottom: 18 },
  headerTitre: { color: "#FBF8F2", fontSize: 18, fontWeight: "500" },
  contenu: { padding: 18 },
  form: { backgroundColor: "#fff", borderWidth: 0.5, borderColor: "#ece6d8", borderRadius: 13, padding: 15, marginBottom: 22 },
  formTitre: { fontSize: 14, fontWeight: "500", color: "#15326B", marginBottom: 12 },
  input: { backgroundColor: "#FBF8F2", borderWidth: 0.5, borderColor: "#d8d2c4", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: "#2a2a28", marginBottom: 10 },
  textarea: { height: 90 },
  formActions: { flexDirection: "row", gap: 10, justifyContent: "flex-end" },
  btnPublier: { backgroundColor: "#E8A33D", borderRadius: 10, paddingVertical: 11, paddingHorizontal: 20, alignItems: "center" },
  btnPublierTexte: { color: "#15326B", fontWeight: "500", fontSize: 14 },
  btnAnnuler: { borderWidth: 0.5, borderColor: "#d8d2c4", borderRadius: 10, paddingVertical: 11, paddingHorizontal: 18, alignItems: "center" },
  btnAnnulerTexte: { color: "#8a857c", fontSize: 14 },
  section: { color: "#6b6760", fontSize: 13, fontWeight: "500", marginBottom: 10 },
  vide: { color: "#8a857c", textAlign: "center", marginTop: 20 },
  carte: { backgroundColor: "#fff", borderWidth: 0.5, borderColor: "#ece6d8", borderRadius: 12, padding: 14, marginBottom: 10 },
  carteTitre: { fontSize: 14, fontWeight: "500", color: "#15326B" },
  carteContenu: { fontSize: 12.5, color: "#6b6760", lineHeight: 18, marginTop: 4 },
  carteActions: { flexDirection: "row", gap: 18, marginTop: 10 },
  lienModifier: { color: "#15326B", fontSize: 13, fontWeight: "500" },
  lienSupprimer: { color: "#A32D2D", fontSize: 13, fontWeight: "500" },
});