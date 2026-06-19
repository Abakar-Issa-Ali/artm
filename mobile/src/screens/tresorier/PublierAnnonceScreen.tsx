import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { publierAnnonce } from "../../services/tresorier.service";

export default function PublierAnnonceScreen() {
  const [titre, setTitre] = useState("");
  const [contenu, setContenu] = useState("");
  const [envoi, setEnvoi] = useState(false);

  async function publier() {
    if (!titre.trim() || !contenu.trim()) {
      Alert.alert("Champs requis", "Merci de remplir le titre et le contenu.");
      return;
    }
    setEnvoi(true);
    try {
      await publierAnnonce(titre.trim(), contenu.trim());
      Alert.alert("Publié", "Votre annonce a été publiée.", [
        { text: "OK", onPress: () => { setTitre(""); setContenu(""); } },
      ]);
    } catch (error: any) {
      Alert.alert("Erreur", error.response?.data?.error || "Publication impossible");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.header}>
        <Text style={styles.headerTitre}>Publier une annonce</Text>
      </View>
      <View style={styles.contenu}>
        <Text style={styles.label}>Titre</Text>
        <TextInput style={styles.input} placeholder="Ex: Assemblée générale" placeholderTextColor="#aaa399" value={titre} onChangeText={setTitre} />

        <Text style={styles.label}>Contenu</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Détails de l'annonce..."
          placeholderTextColor="#aaa399"
          value={contenu}
          onChangeText={setContenu}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />

        <TouchableOpacity style={styles.bouton} onPress={publier} disabled={envoi}>
          {envoi ? <ActivityIndicator color="#15326B" /> : <Text style={styles.boutonTexte}>Publier</Text>}
        </TouchableOpacity>
      </View>
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
  textarea: { height: 120 },
  bouton: { backgroundColor: "#E8A33D", borderRadius: 12, paddingVertical: 15, alignItems: "center", marginTop: 28 },
  boutonTexte: { color: "#15326B", fontWeight: "500", fontSize: 16 },
});