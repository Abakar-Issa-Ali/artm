import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from "react-native";
import { updateProfil } from "../services/membre.service";
import Toast from "../components/Toast";
import { colors, radius, shadow, fonts } from "../theme/theme";
import { Ionicons } from "@expo/vector-icons";

export default function ModifierProfilScreen({
  profil, onTermine, onAnnuler,
}: {
  profil: any;
  onTermine: () => void;
  onAnnuler: () => void;
}) {
  const [nom, setNom] = useState(profil?.nom || "");
  const [prenom, setPrenom] = useState(profil?.prenom || "");
  const [telephone, setTelephone] = useState(profil?.telephone || "");
  const [envoi, setEnvoi] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "succes" | "erreur" } | null>(null);

  async function enregistrer() {
    if (!nom.trim() || !prenom.trim()) {
      setToast({ message: "Le nom et le prénom sont obligatoires.", type: "erreur" });
      return;
    }
    setEnvoi(true);
    try {
      await updateProfil({ nom: nom.trim(), prenom: prenom.trim(), telephone: telephone.trim() });
      setToast({ message: "Profil mis à jour", type: "succes" });
      setTimeout(onTermine, 800);
    } catch (error: any) {
      setToast({ message: error.response?.data?.error || "Mise à jour impossible", type: "erreur" });
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onAnnuler} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={styles.retour}>
          <Ionicons name="arrow-back" size={22} color={colors.blanc} />
        </TouchableOpacity>
        <Text style={styles.headerTitre}>Modifier mon profil</Text>
      </View>

      <View style={styles.contenu}>
        <View style={styles.carte}>
          <Text style={styles.label}>Prénom</Text>
          <TextInput style={styles.input} value={prenom} onChangeText={setPrenom} placeholderTextColor={colors.grisClair} />

          <Text style={styles.label}>Nom</Text>
          <TextInput style={styles.input} value={nom} onChangeText={setNom} placeholderTextColor={colors.grisClair} />

          <Text style={styles.label}>Téléphone</Text>
          <TextInput style={styles.input} value={telephone} onChangeText={setTelephone} placeholder="06..." placeholderTextColor={colors.grisClair} keyboardType="phone-pad" />
        </View>

        <TouchableOpacity style={styles.bouton} onPress={enregistrer} disabled={envoi} activeOpacity={0.85}>
          {envoi ? <ActivityIndicator color={colors.blanc} /> : <Text style={styles.boutonTexte}>Enregistrer</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={onAnnuler} style={styles.annuler}>
          <Text style={styles.annulerTexte}>Annuler</Text>
        </TouchableOpacity>
      </View>
      <Toast message={toast?.message || null} type={toast?.type} onHide={() => setToast(null)} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.fond },
  header: { backgroundColor: colors.bleu, paddingTop: 60, paddingHorizontal: 20, paddingBottom: 22, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, flexDirection: "row", alignItems: "center" },
  retour: { marginRight: 14 },
  headerTitre: { color: colors.blanc, fontSize: 19, fontFamily: fonts.semibold },
  contenu: { padding: 20 },
  carte: { backgroundColor: colors.blanc, borderRadius: radius.lg, padding: 20, ...shadow.carte },
  label: { color: colors.texte, fontSize: 13, fontFamily: fonts.semibold, marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: colors.fond, borderWidth: 1, borderColor: colors.bordure,
    borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15,
    color: colors.texte, fontFamily: fonts.regular,
  },
  bouton: { backgroundColor: colors.or, borderRadius: radius.md, paddingVertical: 16, alignItems: "center", marginTop: 24 },
  boutonTexte: { color: colors.blanc, fontFamily: fonts.semibold, fontSize: 16 },
  annuler: { marginTop: 14, alignItems: "center", paddingVertical: 10 },
  annulerTexte: { color: colors.gris, fontSize: 14, fontFamily: fonts.medium },
});