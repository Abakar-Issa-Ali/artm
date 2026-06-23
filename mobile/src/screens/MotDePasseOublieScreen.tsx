import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "../components/Toast";
import { demanderResetMotDePasse, reinitialiserMotDePasse } from "../services/auth.service";
import { colors, radius, shadow, fonts } from "../theme/theme";

export default function MotDePasseOublieScreen({ onRetour }: { onRetour: () => void }) {
  const [etape, setEtape] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
  const [voirMdp, setVoirMdp] = useState(false);
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
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
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
                placeholderTextColor={colors.grisClair}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TouchableOpacity style={styles.bouton} onPress={demanderCode} disabled={chargement} activeOpacity={0.85}>
                {chargement ? <ActivityIndicator color={colors.blanc} /> : <Text style={styles.boutonTexte}>Recevoir le code</Text>}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.label}>Code reçu par email</Text>
              <TextInput
                style={styles.input}
                placeholder="123456"
                placeholderTextColor={colors.grisClair}
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
              />

              <Text style={styles.label}>Nouveau mot de passe</Text>
              <View style={styles.inputMdp}>
                <TextInput
                  style={styles.inputMdpChamp}
                  placeholder="••••••••"
                  placeholderTextColor={colors.grisClair}
                  value={nouveauMotDePasse}
                  onChangeText={setNouveauMotDePasse}
                  secureTextEntry={!voirMdp}
                />
                <TouchableOpacity onPress={() => setVoirMdp(!voirMdp)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name={voirMdp ? "eye-off-outline" : "eye-outline"} size={20} color={colors.gris} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.bouton} onPress={reinitialiser} disabled={chargement} activeOpacity={0.85}>
                {chargement ? <ActivityIndicator color={colors.blanc} /> : <Text style={styles.boutonTexte}>Réinitialiser</Text>}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setEtape(1)} style={styles.lienSecondaire}>
                <Text style={styles.lienGris}>Je n'ai pas reçu le code — réessayer</Text>
              </TouchableOpacity>
            </>
          )}

          <View style={styles.separateur} />

          <TouchableOpacity onPress={onRetour} style={styles.lienCentre}>
            <Text style={styles.lienOr}>Retour à la connexion</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Toast message={toast?.message || null} type={toast?.type} onHide={() => setToast(null)} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bleu },
  scroll: { padding: 24, paddingTop: 90, paddingBottom: 40, flexGrow: 1, justifyContent: "center" },
  titre: { color: colors.blanc, fontSize: 28, fontFamily: fonts.bold, textAlign: "center" },
  sousTitre: { color: colors.blanc, textAlign: "center", fontSize: 14, opacity: 0.85, marginTop: 6, marginBottom: 28, lineHeight: 20, fontFamily: fonts.regular },
  carte: { backgroundColor: colors.blanc, borderRadius: radius.xl, padding: 24, ...shadow.carte },
  label: { color: colors.texte, fontSize: 13, fontFamily: fonts.semibold, marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: colors.fond, borderWidth: 1, borderColor: colors.bordure,
    borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15,
    color: colors.texte, fontFamily: fonts.regular,
  },
  inputMdp: {
    flexDirection: "row", alignItems: "center", backgroundColor: colors.fond,
    borderWidth: 1, borderColor: colors.bordure, borderRadius: radius.md, paddingHorizontal: 14,
  },
  inputMdpChamp: { flex: 1, paddingVertical: 13, fontSize: 15, color: colors.texte, fontFamily: fonts.regular },
  bouton: { backgroundColor: colors.or, borderRadius: radius.md, paddingVertical: 16, alignItems: "center", marginTop: 24 },
  boutonTexte: { color: colors.blanc, fontFamily: fonts.semibold, fontSize: 16 },
  separateur: { height: 1, backgroundColor: colors.bordure, marginTop: 20 },
  lienCentre: { marginTop: 16, alignItems: "center" },
  lienSecondaire: { marginTop: 14, alignItems: "center" },
  lienOr: { color: colors.or, fontSize: 13.5, fontFamily: fonts.semibold },
  lienGris: { color: colors.gris, fontSize: 13.5, fontFamily: fonts.regular },
});