import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from "react-native";
import { updateProfil } from "../services/membre.service";
import Toast from "../components/Toast";

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
        <Text style={styles.headerTitre}>Modifier mon profil</Text>
      </View>
      <View style={styles.contenu}>
        <Text style={styles.label}>Prénom</Text>
        <TextInput style={styles.input} value={prenom} onChangeText={setPrenom} placeholderTextColor="#aaa399" />

        <Text style={styles.label}>Nom</Text>
        <TextInput style={styles.input} value={nom} onChangeText={setNom} placeholderTextColor="#aaa399" />

        <Text style={styles.label}>Téléphone</Text>
        <TextInput style={styles.input} value={telephone} onChangeText={setTelephone} placeholder="06..." placeholderTextColor="#aaa399" keyboardType="phone-pad" />

        <TouchableOpacity style={styles.bouton} onPress={enregistrer} disabled={envoi}>
          {envoi ? <ActivityIndicator color="#15326B" /> : <Text style={styles.boutonTexte}>Enregistrer</Text>}
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
  page: { flex: 1, backgroundColor: "#FBF8F2" },
  header: { backgroundColor: "#15326B", paddingTop: 60, paddingHorizontal: 20, paddingBottom: 18 },
  headerTitre: { color: "#FBF8F2", fontSize: 18, fontWeight: "500" },
  contenu: { padding: 20 },
  label: { color: "#15326B", fontSize: 13, fontWeight: "500", marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: "#fff", borderWidth: 0.5, borderColor: "#d8d2c4", borderRadius: 11, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: "#2a2a28" },
  bouton: { backgroundColor: "#E8A33D", borderRadius: 12, paddingVertical: 15, alignItems: "center", marginTop: 28 },
  boutonTexte: { color: "#15326B", fontWeight: "500", fontSize: 16 },
  annuler: { marginTop: 14, alignItems: "center", paddingVertical: 10 },
  annulerTexte: { color: "#8a857c", fontSize: 14 },
});