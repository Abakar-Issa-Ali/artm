import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import Toast from "../components/Toast";
import { colors, radius, shadow, fonts } from "../theme/theme";

export default function RegisterScreen({ onRetour }: { onRetour: () => void }) {
  const { inscription } = useAuth();
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [voirMdp, setVoirMdp] = useState(false);
  const [voirConfirm, setVoirConfirm] = useState(false);
  const [accepteConditions, setAccepteConditions] = useState(false);
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
    if (motDePasse !== confirmation) {
      setToast({ message: "Les deux mots de passe ne correspondent pas.", type: "erreur" });
      return;
    }
    if (!accepteConditions) {
      setToast({ message: "Vous devez accepter les conditions d'utilisation.", type: "erreur" });
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
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.titre}>Créer un compte</Text>
        <Text style={styles.sousTitre}>Rejoignez l'ARTM</Text>

        <View style={styles.carte}>
          <Text style={styles.label}>Prénom</Text>
          <TextInput style={styles.input} value={prenom} onChangeText={setPrenom} placeholder="Votre prénom" placeholderTextColor={colors.grisClair} />

          <Text style={styles.label}>Nom</Text>
          <TextInput style={styles.input} value={nom} onChangeText={setNom} placeholder="Votre nom" placeholderTextColor={colors.grisClair} />

          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="votre@email.fr" placeholderTextColor={colors.grisClair} autoCapitalize="none" keyboardType="email-address" />

          <Text style={styles.label}>Téléphone (optionnel)</Text>
          <TextInput style={styles.input} value={telephone} onChangeText={setTelephone} placeholder="06..." placeholderTextColor={colors.grisClair} keyboardType="phone-pad" />

          <Text style={styles.label}>Mot de passe</Text>
          <View style={styles.inputMdp}>
            <TextInput
              style={styles.inputMdpChamp}
              value={motDePasse}
              onChangeText={setMotDePasse}
              placeholder="••••••••"
              placeholderTextColor={colors.grisClair}
              secureTextEntry={!voirMdp}
            />
            <TouchableOpacity onPress={() => setVoirMdp(!voirMdp)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name={voirMdp ? "eye-off-outline" : "eye-outline"} size={20} color={colors.gris} />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Confirmer le mot de passe</Text>
          <View style={styles.inputMdp}>
            <TextInput
              style={styles.inputMdpChamp}
              value={confirmation}
              onChangeText={setConfirmation}
              placeholder="••••••••"
              placeholderTextColor={colors.grisClair}
              secureTextEntry={!voirConfirm}
            />
            <TouchableOpacity onPress={() => setVoirConfirm(!voirConfirm)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name={voirConfirm ? "eye-off-outline" : "eye-outline"} size={20} color={colors.gris} />
            </TouchableOpacity>
          </View>

          {/* Conditions d'utilisation */}
          <TouchableOpacity style={styles.conditions} onPress={() => setAccepteConditions(!accepteConditions)} activeOpacity={0.7}>
            <View style={[styles.checkbox, accepteConditions && styles.checkboxCoche]}>
              {accepteConditions && <Ionicons name="checkmark" size={14} color={colors.blanc} />}
            </View>
            <Text style={styles.conditionsTexte}>
              J'accepte les conditions d'utilisation et la politique de confidentialité de l'ARTM.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bouton} onPress={gererInscription} disabled={chargement} activeOpacity={0.85}>
            {chargement ? <ActivityIndicator color={colors.blanc} /> : <Text style={styles.boutonTexte}>Créer mon compte</Text>}
          </TouchableOpacity>

          <View style={styles.separateur} />

          <TouchableOpacity onPress={onRetour} style={styles.lienCentre}>
            <Text style={styles.lienGris}>
              J'ai déjà un compte ? <Text style={styles.lienOr}>Se connecter</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Toast message={toast?.message || null} type={toast?.type} onHide={() => setToast(null)} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bleu },
  scroll: { padding: 24, paddingTop: 70, paddingBottom: 40, flexGrow: 1, justifyContent: "center" },
  titre: { color: colors.blanc, fontSize: 28, fontFamily: fonts.bold, textAlign: "center" },
  sousTitre: { color: colors.blanc, textAlign: "center", fontSize: 14, opacity: 0.85, marginTop: 6, marginBottom: 28, fontFamily: fonts.regular },
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
  conditions: { flexDirection: "row", alignItems: "flex-start", marginTop: 18 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: colors.grisClair,
    alignItems: "center", justifyContent: "center", marginRight: 10, marginTop: 1,
  },
  checkboxCoche: { backgroundColor: colors.bleu, borderColor: colors.bleu },
  conditionsTexte: { flex: 1, color: colors.gris, fontSize: 13, lineHeight: 19, fontFamily: fonts.regular },
  bouton: {
    backgroundColor: colors.or, borderRadius: radius.md, paddingVertical: 16,
    alignItems: "center", marginTop: 24,
  },
  boutonTexte: { color: colors.blanc, fontFamily: fonts.semibold, fontSize: 16 },
  separateur: { height: 1, backgroundColor: colors.bordure, marginTop: 20 },
  lienCentre: { marginTop: 16, alignItems: "center" },
  lienGris: { color: colors.gris, fontSize: 13.5, fontFamily: fonts.regular },
  lienOr: { color: colors.or, fontSize: 13.5, fontFamily: fonts.semibold },
});