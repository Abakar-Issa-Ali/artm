import { useState, useCallback } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, RefreshControl, KeyboardAvoidingView, Platform,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Confirm from "../../components/Confirm";
import Toast from "../../components/Toast";
import { getAnnonces } from "../../services/communication.service";
import { publierAnnonce, modifierAnnonce, supprimerAnnonce } from "../../services/tresorier.service";
import { colors, radius, shadow, fonts } from "../../theme/theme";

export default function GestionAnnoncesScreen() {
  const [annonces, setAnnonces] = useState<any[]>([]);
  const [chargement, setChargement] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "succes" | "erreur" } | null>(null);
  const [aSupprimer, setASupprimer] = useState<any>(null);

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
    return <View style={styles.loader}><ActivityIndicator size="large" color={colors.bleu} /></View>;
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
          <TextInput style={styles.input} placeholder="Titre" placeholderTextColor={colors.grisClair} value={titre} onChangeText={setTitre} />
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Contenu..."
            placeholderTextColor={colors.grisClair}
            value={contenu}
            onChangeText={setContenu}
            multiline
            textAlignVertical="top"
          />
          <View style={styles.formActions}>
            {editId && (
              <TouchableOpacity style={styles.btnAnnuler} onPress={reinitialiser} activeOpacity={0.85}>
                <Text style={styles.btnAnnulerTexte}>Annuler</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.btnPublier} onPress={enregistrer} disabled={envoi} activeOpacity={0.85}>
              {envoi ? <ActivityIndicator color={colors.blanc} /> : <Text style={styles.btnPublierTexte}>{editId ? "Enregistrer" : "Publier"}</Text>}
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
                <TouchableOpacity style={styles.actionBtn} onPress={() => editer(a)}>
                  <Ionicons name="create-outline" size={16} color={colors.bleu} style={{ marginRight: 5 }} />
                  <Text style={styles.lienModifier}>Modifier</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => confirmerSuppression(a)}>
                  <Ionicons name="trash-outline" size={16} color={colors.rouge} style={{ marginRight: 5 }} />
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

      <Toast message={toast?.message || null} type={toast?.type} onHide={() => setToast(null)} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.fond },
  loader: { flex: 1, backgroundColor: colors.fond, alignItems: "center", justifyContent: "center" },
  header: { backgroundColor: colors.bleu, paddingTop: 60, paddingHorizontal: 20, paddingBottom: 22, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerTitre: { color: colors.blanc, fontSize: 19, fontFamily: fonts.semibold },
  contenu: { padding: 20 },
  form: { backgroundColor: colors.blanc, borderRadius: radius.lg, padding: 18, marginBottom: 24, ...shadow.carte },
  formTitre: { fontSize: 15, fontFamily: fonts.bold, color: colors.texte, marginBottom: 14 },
  input: { backgroundColor: colors.fond, borderWidth: 1, borderColor: colors.bordure, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: colors.texte, marginBottom: 12, fontFamily: fonts.regular },
  textarea: { height: 110 },
  formActions: { flexDirection: "row", gap: 10, justifyContent: "flex-end" },
  btnPublier: { backgroundColor: colors.or, borderRadius: radius.md, paddingVertical: 12, paddingHorizontal: 24, alignItems: "center" },
  btnPublierTexte: { color: colors.blanc, fontFamily: fonts.semibold, fontSize: 14 },
  btnAnnuler: { borderWidth: 1.5, borderColor: colors.bordure, borderRadius: radius.md, paddingVertical: 12, paddingHorizontal: 20, alignItems: "center" },
  btnAnnulerTexte: { color: colors.gris, fontSize: 14, fontFamily: fonts.medium },
  section: { color: colors.gris, fontSize: 14, fontFamily: fonts.semibold, marginBottom: 12 },
  vide: { color: colors.gris, textAlign: "center", marginTop: 20, fontFamily: fonts.regular },
  carte: { backgroundColor: colors.blanc, borderRadius: radius.md, padding: 16, marginBottom: 10, ...shadow.carte },
  carteTitre: { fontSize: 15, fontFamily: fonts.semibold, color: colors.texte },
  carteContenu: { fontSize: 13.5, color: colors.gris, lineHeight: 20, marginTop: 4, fontFamily: fonts.regular },
  carteActions: { flexDirection: "row", gap: 20, marginTop: 12 },
  actionBtn: { flexDirection: "row", alignItems: "center" },
  lienModifier: { color: colors.bleu, fontSize: 13.5, fontFamily: fonts.semibold },
  lienSupprimer: { color: colors.rouge, fontSize: 13.5, fontFamily: fonts.semibold },
});