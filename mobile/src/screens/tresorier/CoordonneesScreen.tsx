import { useState, useCallback } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getCoordonnees, updateCoordonnees } from "../../services/coordonnees.service";
import Toast from "../../components/Toast";
import { colors, radius, shadow, fonts } from "../../theme/theme";

export default function CoordonneesScreen({ onRetour }: { onRetour: () => void }) {
  const [iban, setIban] = useState("");
  const [titulaire, setTitulaire] = useState("");
  const [reference, setReference] = useState("");
  const [numeroWero, setNumeroWero] = useState("");
  const [noteCarte, setNoteCarte] = useState("");
  const [chargement, setChargement] = useState(true);
  const [envoi, setEnvoi] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "succes" | "erreur" } | null>(null);

  const charger = useCallback(async () => {
    try {
      const c = await getCoordonnees();
      setIban(c.iban || "");
      setTitulaire(c.titulaire || "");
      setReference(c.reference || "");
      setNumeroWero(c.numeroWero || "");
      setNoteCarte(c.noteCarte || "");
    } catch (error) {
      console.log("Erreur coordonnées", error);
    } finally {
      setChargement(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { charger(); }, [charger]));

  async function enregistrer() {
    setEnvoi(true);
    try {
      await updateCoordonnees({
        iban: iban.trim(),
        titulaire: titulaire.trim(),
        reference: reference.trim(),
        numeroWero: numeroWero.trim(),
        noteCarte: noteCarte.trim(),
      });
      setToast({ message: "Coordonnées mises à jour", type: "succes" });
    } catch (error: any) {
      setToast({ message: error.response?.data?.error || "Mise à jour impossible", type: "erreur" });
    } finally {
      setEnvoi(false);
    }
  }

  if (chargement) {
    return <View style={styles.loader}><ActivityIndicator size="large" color={colors.bleu} /></View>;
  }

  return (
    <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onRetour} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={styles.retour}>
          <Ionicons name="arrow-back" size={22} color={colors.blanc} />
        </TouchableOpacity>
        <Text style={styles.headerTitre}>Coordonnées de paiement</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contenu} keyboardShouldPersistTaps="handled">
        <Text style={styles.intro}>
          Ces coordonnées sont affichées aux membres lorsqu'ils déclarent un paiement.
        </Text>

        <View style={styles.carte}>
          <Text style={styles.section}>Virement bancaire</Text>

          <Text style={styles.label}>Titulaire du compte</Text>
          <TextInput style={styles.input} value={titulaire} onChangeText={setTitulaire} placeholder="Association ARTM" placeholderTextColor={colors.grisClair} />

          <Text style={styles.label}>IBAN</Text>
          <TextInput style={styles.input} value={iban} onChangeText={setIban} placeholder="FR76 ..." placeholderTextColor={colors.grisClair} autoCapitalize="characters" />

          <Text style={styles.label}>Référence à indiquer</Text>
          <TextInput style={styles.input} value={reference} onChangeText={setReference} placeholder="Nom + mois" placeholderTextColor={colors.grisClair} />
        </View>

        <View style={styles.carte}>
          <Text style={styles.section}>Autres moyens</Text>

          <Text style={styles.label}>Numéro Wero</Text>
          <TextInput style={styles.input} value={numeroWero} onChangeText={setNumeroWero} placeholder="06 ..." placeholderTextColor={colors.grisClair} keyboardType="phone-pad" />

          <Text style={styles.label}>Note carte / autres instructions</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={noteCarte}
            onChangeText={setNoteCarte}
            placeholder="Ex : paiement par carte bientôt disponible"
            placeholderTextColor={colors.grisClair}
            multiline
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity style={styles.bouton} onPress={enregistrer} disabled={envoi} activeOpacity={0.85}>
          {envoi ? <ActivityIndicator color={colors.blanc} /> : <Text style={styles.boutonTexte}>Enregistrer</Text>}
        </TouchableOpacity>
      </ScrollView>
      <Toast message={toast?.message || null} type={toast?.type} onHide={() => setToast(null)} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.fond },
  loader: { flex: 1, backgroundColor: colors.fond, alignItems: "center", justifyContent: "center" },
header: { backgroundColor: colors.bleu, paddingTop: 60, paddingLeft: 20, paddingRight: 130, paddingBottom: 22, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, flexDirection: "row", alignItems: "center" },
  retour: { marginRight: 14 },
  headerTitre: { color: colors.blanc, fontSize: 19, fontFamily: fonts.semibold },
  contenu: { padding: 20 },
  intro: { color: colors.gris, fontSize: 13.5, lineHeight: 20, marginBottom: 16, fontFamily: fonts.regular },
  carte: { backgroundColor: colors.blanc, borderRadius: radius.lg, padding: 18, marginBottom: 16, ...shadow.carte },
  section: { color: colors.texte, fontSize: 15, fontFamily: fonts.bold, marginBottom: 6 },
  label: { color: colors.texte, fontSize: 13, fontFamily: fonts.semibold, marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: colors.fond, borderWidth: 1, borderColor: colors.bordure, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: colors.texte, fontFamily: fonts.regular },
  textarea: { height: 80 },
  bouton: { backgroundColor: colors.or, borderRadius: radius.md, paddingVertical: 16, alignItems: "center", marginTop: 4, marginBottom: 20 },
  boutonTexte: { color: colors.blanc, fontFamily: fonts.semibold, fontSize: 16 },
});