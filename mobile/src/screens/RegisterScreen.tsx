import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import Toast from "../components/Toast";

export default function RegisterScreen({ onRetour }: { onRetour: () => void }) {
  const { inscription } = useAuth();
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [chargement, setChargement] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "succes" | "erreur" } | null>(null);

  async function gererInscription() {
    if (!nom || !prenom || !email || !motDePasse) {
      setToast({ message: "Merci de remplir nom, prénom, email et mot de passe.", type: "erreur" });
      return;
    }
    if (motDePasse.length < 6) {
      setToast({ message: "Le mot de passe doit faire au moins 6 caractères.", type: "erreur" });
      return;
    }
    setChargement(true);
    try {
      await inscription({
        nom: nom.trim(),
        prenom: prenom.trim(),
        email: email.trim().toLowerCase(),
        telephone: telephone.trim() || undefined,
        motDePasse,
      });
    } catch (error: any) {
      const message = error.response?.data?.error || "Inscription impossible";
      setToast({ message, type: "erreur" });
    } finally {
      setChargement(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.titre}>Créer un compte</Text>
        <Text style={styles.sousTitre}>Rejoignez l'ARTM</Text>

        <View style={styles.carte}>
          <Text style={styles.label}>Prénom</Text>
          <TextInput style={styles.input} value={prenom} onChangeText={setPrenom} placeholder="Votre prénom" placeholderTextColor="#aaa399" />

          <Text style={styles.label}>Nom</Text>
          <TextInput style={styles.input} value={nom} onChangeText={setNom} placeholder="Votre nom" placeholderTextColor="#aaa399" />

          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="votre@email.fr" placeholderTextColor="#aaa399" autoCapitalize="none" keyboardType="email-address" />

          <Text style={styles.label}>Téléphone (optionnel)</Text>
          <TextInput style={styles.input} value={telephone} onChangeText={setTelephone} placeholder="06..." placeholderTextColor="#aaa399" keyboardType="phone-pad" />

          <Text style={styles.label}>Mot de passe</Text>
          <TextInput style={styles.input} value={motDePasse} onChangeText={setMotDePasse} placeholder="••••••••" placeholderTextColor="#aaa399" secureTextEntry />

          <TouchableOpacity style={styles.bouton} onPress={gererInscription} disabled={chargement}>
            {chargement ? <ActivityIndicator color="#15326B" /> : <Text style={styles.boutonTexte}>Créer mon compte</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={onRetour} style={styles.lien}>
            <Text style={styles.lienTexte}>J'ai déjà un compte — Se connecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Toast message={toast?.message || null} type={toast?.type} onHide={() => setToast(null)} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#15326B" },
  scroll: { padding: 24, paddingTop: 70, paddingBottom: 40 },
  titre: { color: "#E8A33D", fontSize: 28, fontWeight: "500", textAlign: "center" },
  sousTitre: { color: "#FBF8F2", textAlign: "center", fontSize: 13, opacity: 0.8, marginTop: 6, marginBottom: 28 },
  carte: { backgroundColor: "#FBF8F2", borderRadius: 20, padding: 22 },
  label: { color: "#15326B", fontSize: 13, fontWeight: "500", marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: "#fff", borderWidth: 0.5, borderColor: "#d8d2c4", borderRadius: 11, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: "#2a2a28" },
  bouton: { backgroundColor: "#E8A33D", borderRadius: 12, paddingVertical: 15, alignItems: "center", marginTop: 24 },
  boutonTexte: { color: "#15326B", fontWeight: "500", fontSize: 16 },
  lien: { marginTop: 16, alignItems: "center" },
  lienTexte: { color: "#15326B", fontSize: 13.5 },
});