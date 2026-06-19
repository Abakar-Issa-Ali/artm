import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import Toast from "../components/Toast";

export default function LoginScreen({ onInscription }: { onInscription: () => void }) {
  const { connexion } = useAuth();
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "succes" | "erreur" } | null>(null);
  const [chargement, setChargement] = useState(false);

  async function gererConnexion() {
    if (!email || !motDePasse) {
      setToast({ message: "Merci de renseigner votre email et mot de passe.", type: "erreur" });
      return;
    }
    setChargement(true);
    try {
      await connexion(email.trim().toLowerCase(), motDePasse);
    } catch (error: any) {
      const message = error.response?.data?.error || "Connexion impossible";
      setToast({ message, type: "erreur" });
    } finally {
      setChargement(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.logo}>
        <Text style={styles.logoTexte}>ARTM</Text>
      </View>
      <Text style={styles.sousTitre}>
        Association des Ressortissants{"\n"}Tchadiens à Marseille
      </Text>

      <View style={styles.carte}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="votre@email.fr"
          placeholderTextColor="#aaa399"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Mot de passe</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#aaa399"
          value={motDePasse}
          onChangeText={setMotDePasse}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.bouton}
          onPress={gererConnexion}
          disabled={chargement}
        >
          {chargement ? (
            <ActivityIndicator color="#15326B" />
          ) : (
            <Text style={styles.boutonTexte}>Se connecter</Text>
          )}
        </TouchableOpacity>
          <TouchableOpacity onPress={onInscription} style={styles.lien}>
          <Text style={styles.lienTexte}>Pas encore de compte ? Créer un compte</Text>
        </TouchableOpacity>
      </View>
      {/* <Toast message={toast?.message || null} type={toast?.type} onHide={() => setToast(null)} /> */}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  lien: { marginTop: 16, alignItems: "center" },
  lienTexte: { color: "#15326B", fontSize: 13.5 },
  container: { flex: 1, backgroundColor: "#15326B", justifyContent: "center", padding: 24 },
  logo: { alignItems: "center", marginBottom: 8 },
  logoTexte: { color: "#E8A33D", fontSize: 44, fontWeight: "500", letterSpacing: 2 },
  sousTitre: { color: "#FBF8F2", textAlign: "center", fontSize: 13, opacity: 0.8, marginBottom: 36, lineHeight: 19 },
  carte: { backgroundColor: "#FBF8F2", borderRadius: 20, padding: 22 },
  label: { color: "#15326B", fontSize: 13, fontWeight: "500", marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: "#fff", borderWidth: 0.5, borderColor: "#d8d2c4",
    borderRadius: 11, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: "#2a2a28",
  },
  bouton: {
    backgroundColor: "#E8A33D", borderRadius: 12, paddingVertical: 15,
    alignItems: "center", marginTop: 24,
  },
  boutonTexte: { color: "#15326B", fontWeight: "500", fontSize: 16 },
});