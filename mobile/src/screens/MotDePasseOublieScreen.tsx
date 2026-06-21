import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView,
} from "react-native";
import Toast from "../components/Toast";
import { demanderResetMotDePasse, reinitialiserMotDePasse } from "../services/auth.service";

export default function MotDePasseOublieScreen({ onRetour }: { onRetour: () => void }) {
  // etape 1 = saisie email, etape 2 = saisie code + nouveau mot de passe
  const [etape, setEtape] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
  const [chargement, setChargement] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "succes" | "erreur" } | null>(null);

  async function demanderCode() {
    if (!email.trim()) {
      setToast({ message: "Merci de saisir votre email.", type: "erreur" });
      return;
    }
    setChargement(true);
    try {
      await demanderResetMotDePasse(email.trim().toLowerCase());
      setToast({ message: "Si un compte existe, un code a été envoyé par email.", type: "succes" });
      setEtape(2);
    } catch (error: any) {
      setToast({ message: error.response?.data?.error || "Erreur lors de l'envoi.", type: "erreur" });
    } finally {
      setChargement(false);
    }
  }

  async function reinitialiser() {
    if (!code.trim() || !nouveauMotDePasse) {
      setToast({ message: "Merci de saisir le code et le nouveau mot de passe.", type: "erreur" });
      return;
    }
    if (nouveauMotDePasse.length < 6) {
      setToast({ message: "Le mot de passe doit faire au moins 6 caractères.", type: "erreur" });
      return;
    }
    setChargement(true);
    try {
      await reinitialiserMotDePasse(email.trim().toLowerCase(), code.trim(), nouveauMotDePasse);
      setToast({ message: "Mot de passe réinitialisé ! Vous pouvez vous connecter.", type: "succes" });
      setTimeout(onRetour, 1500);
    } catch (error: any) {
      setToast({ message: error.response?.data?.error || "Réinitialisation impossible.", type: "erreur" });
    } finally {
      setChargement(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.titre}>Mot de passe oublié</Text>
        <Text style={styles.sousTitre}>
          {etape === 1
            ? "Saisissez votre email pour recevoir un code"
            : "Saisissez le code reçu et votre nouveau mot de passe"}
        </Text>

        <View style={styles.carte}>
          {etape === 1 ? (
            <>
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
              <TouchableOpacity style={styles.bouton} onPress={demanderCode} disabled={chargement}>
                {chargement ? <ActivityIndicator color="#15326B" /> : <Text style={styles.boutonTexte}>Recevoir le code</Text>}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.label}>Code reçu par email</Text>
              <TextInput
                style={styles.input}
                placeholder="123456"
                placeholderTextColor="#aaa399"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
              />

              <Text style={styles.label}>Nouveau mot de passe</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#aaa399"
                value={nouveauMotDePasse}
                onChangeText={setNouveauMotDePasse}
                secureTextEntry
              />

              <TouchableOpacity style={styles.bouton} onPress={reinitialiser} disabled={chargement}>
                {chargement ? <ActivityIndicator color="#15326B" /> : <Text style={styles.boutonTexte}>Réinitialiser</Text>}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setEtape(1)} style={styles.lienSecondaire}>
                <Text style={styles.lienTexte}>Je n'ai pas reçu le code — réessayer</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity onPress={onRetour} style={styles.lien}>
            <Text style={styles.lienTexte}>Retour à la connexion</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Toast message={toast?.message || null} type={toast?.type} onHide={() => setToast(null)} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#15326B" },
  scroll: { padding: 24, paddingTop: 90, paddingBottom: 40, flexGrow: 1, justifyContent: "center" },
  titre: { color: "#E8A33D", fontSize: 28, fontWeight: "500", textAlign: "center" },
  sousTitre: { color: "#FBF8F2", textAlign: "center", fontSize: 13, opacity: 0.8, marginTop: 6, marginBottom: 28, lineHeight: 19 },
  carte: { backgroundColor: "#FBF8F2", borderRadius: 20, padding: 22 },
  label: { color: "#15326B", fontSize: 13, fontWeight: "500", marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: "#fff", borderWidth: 0.5, borderColor: "#d8d2c4", borderRadius: 11, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: "#2a2a28" },
  bouton: { backgroundColor: "#E8A33D", borderRadius: 12, paddingVertical: 15, alignItems: "center", marginTop: 24 },
  boutonTexte: { color: "#15326B", fontWeight: "500", fontSize: 16 },
  lien: { marginTop: 16, alignItems: "center" },
  lienSecondaire: { marginTop: 14, alignItems: "center" },
  lienTexte: { color: "#15326B", fontSize: 13.5 },
});