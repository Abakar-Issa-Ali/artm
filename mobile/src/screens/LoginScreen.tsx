import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image,
  KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import Toast from "../components/Toast";
import { colors, radius, shadow, fonts } from "../theme/theme";

export default function LoginScreen({ onInscription, onMotDePasseOublie }: { onInscription: () => void; onMotDePasseOublie: () => void }) {
  const { connexion } = useAuth();
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [voirMdp, setVoirMdp] = useState(false);
  const [seSouvenir, setSeSouvenir] = useState(false);
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
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* En-tête avec logo */}
        <View style={styles.entete}>
          <Image source={require("../../assets/logo.png")} style={styles.logoImage} resizeMode="contain" />
          <Text style={styles.logoTexte}>ARTM</Text>
          <Text style={styles.sousTitre}>Association des Ressortissants{"\n"}Tchadiens à Marseille</Text>
        </View>

        {/* Carte de connexion */}
        <View style={styles.carte}>
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

          <Text style={styles.label}>Mot de passe</Text>
          <View style={styles.inputMdp}>
            <TextInput
              style={styles.inputMdpChamp}
              placeholder="••••••••"
              placeholderTextColor={colors.grisClair}
              value={motDePasse}
              onChangeText={setMotDePasse}
              secureTextEntry={!voirMdp}
            />
            <TouchableOpacity onPress={() => setVoirMdp(!voirMdp)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name={voirMdp ? "eye-off-outline" : "eye-outline"} size={20} color={colors.gris} />
            </TouchableOpacity>
          </View>

          {/* Se souvenir de moi */}
          <TouchableOpacity style={styles.souvenir} onPress={() => setSeSouvenir(!seSouvenir)} activeOpacity={0.7}>
            <View style={[styles.checkbox, seSouvenir && styles.checkboxCoche]}>
              {seSouvenir && <Ionicons name="checkmark" size={14} color={colors.blanc} />}
            </View>
            <Text style={styles.souvenirTexte}>Se souvenir de moi</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bouton} onPress={gererConnexion} disabled={chargement} activeOpacity={0.85}>
            {chargement ? <ActivityIndicator color={colors.blanc} /> : <Text style={styles.boutonTexte}>Se connecter</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={onMotDePasseOublie} style={styles.lienCentre}>
            <Text style={styles.lienOr}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          <View style={styles.separateur} />

          <TouchableOpacity onPress={onInscription} style={styles.lienCentre}>
            <Text style={styles.lienGris}>Pas encore de compte ?</Text>
            <Text style={[styles.lienOr, { marginTop: 4 }]}>Créer un compte</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Toast message={toast?.message || null} type={toast?.type} onHide={() => setToast(null)} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bleu },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 24, paddingVertical: 50 },
  entete: { alignItems: "center", marginBottom: 28 },
  logoImage: { width: 250, height: 220, marginBottom: -50 },
  logoTexte: { color: colors.blanc, fontSize: 40, fontFamily: fonts.bold, letterSpacing: 1 },
  sousTitre: { color: colors.blanc, textAlign: "center", fontSize: 13, opacity: 0.85, marginTop: -8, lineHeight: 19, fontFamily: fonts.regular },
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
  souvenir: { flexDirection: "row", alignItems: "center", marginTop: 16 },
  checkbox: {
    width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, borderColor: colors.grisClair,
    alignItems: "center", justifyContent: "center", marginRight: 8,
  },
  checkboxCoche: { backgroundColor: colors.bleu, borderColor: colors.bleu },
  souvenirTexte: { color: colors.gris, fontSize: 13.5, fontFamily: fonts.regular },
  bouton: {
    backgroundColor: colors.or, borderRadius: radius.md, paddingVertical: 16,
    alignItems: "center", marginTop: 24,
  },
  boutonTexte: { color: colors.blanc, fontFamily: fonts.semibold, fontSize: 16 },
  lienCentre: { marginTop: 16, alignItems: "center" },
  lienOr: { color: colors.or, fontSize: 13.5, fontFamily: fonts.semibold },
  lienGris: { color: colors.gris, fontSize: 13.5, fontFamily: fonts.regular },
  separateur: { height: 1, backgroundColor: colors.bordure, marginTop: 20 },
});