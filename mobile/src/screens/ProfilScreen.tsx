import { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Modal, Pressable } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import api from "../config/api";
import ModifierProfilScreen from "./ModifierProfilScreen";
import { colors, radius, shadow, fonts } from "../theme/theme";

const MOIS = ["", "janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

export default function ProfilScreen() {
  const { membre, deconnexion } = useAuth();
  const [profil, setProfil] = useState<any>(null);
  const [chargement, setChargement] = useState(true);
  const [edition, setEdition] = useState(false);
  const [confirmDeco, setConfirmDeco] = useState(false);

  const charger = useCallback(async () => {
    try {
      const reponse = await api.get("/auth/me");
      setProfil(reponse.data);
    } catch (error) {
      console.log("Erreur profil", error);
    } finally {
      setChargement(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { charger(); }, [charger]));

  if (edition && profil) {
    return (
      <ModifierProfilScreen
        profil={profil}
        onTermine={() => { setEdition(false); charger(); }}
        onAnnuler={() => setEdition(false)}
      />
    );
  }

  if (chargement) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.bleu} />
      </View>
    );
  }

  const initiales = `${profil?.prenom?.[0] || ""}${profil?.nom?.[0] || ""}`.toUpperCase();

  let adhesion = "";
  if (profil?.dateAdhesion) {
    const d = new Date(profil.dateAdhesion);
    adhesion = `Membre depuis ${MOIS[d.getMonth() + 1]} ${d.getFullYear()}`;
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={{ paddingBottom: 30 }}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTexte}>{initiales}</Text>
        </View>
        <Text style={styles.nom}>{profil?.prenom} {profil?.nom}</Text>
        <Text style={styles.adhesion}>{adhesion}</Text>
      </View>

      <View style={styles.contenu}>
        <View style={styles.carte}>
          <Ligne icone="mail-outline" label="Email" valeur={profil?.email} />
          <Ligne icone="call-outline" label="Téléphone" valeur={profil?.telephone || "Non renseigné"} />
          <Ligne icone="person-outline" label="Rôle" valeur={`${profil?.role} · ${Number(profil?.montantCotisation).toFixed(2)} €/mois`} derniere />
        </View>

        <TouchableOpacity style={styles.modifier} onPress={() => setEdition(true)} activeOpacity={0.85}>
          <Ionicons name="create-outline" size={18} color={colors.bleu} style={{ marginRight: 8 }} />
          <Text style={styles.modifierTexte}>Modifier mon profil</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deconnexion} onPress={() => setConfirmDeco(true)} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={18} color={colors.rouge} style={{ marginRight: 8 }} />
          <Text style={styles.deconnexionTexte}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={confirmDeco} transparent animationType="fade" onRequestClose={() => setConfirmDeco(false)}>
        <Pressable style={styles.overlay} onPress={() => setConfirmDeco(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={styles.sheetTitre}>Déconnexion</Text>
            <Text style={styles.sheetSous}>Voulez-vous vraiment vous déconnecter ?</Text>

            <TouchableOpacity style={styles.sheetDeco} onPress={deconnexion} activeOpacity={0.85}>
              <Text style={styles.sheetDecoTexte}>Se déconnecter</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sheetAnnuler} onPress={() => setConfirmDeco(false)}>
              <Text style={styles.sheetAnnulerTexte}>Annuler</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

function Ligne({ icone, label, valeur, derniere }: { icone: any; label: string; valeur: string; derniere?: boolean }) {
  return (
    <View style={[styles.ligne, derniere && { borderBottomWidth: 0 }]}>
      <View style={styles.ligneIcone}>
        <Ionicons name={icone} size={18} color={colors.bleu} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.ligneLabel}>{label}</Text>
        <Text style={styles.ligneValeur}>{valeur}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.fond },
  loader: { flex: 1, backgroundColor: colors.fond, alignItems: "center", justifyContent: "center" },
  header: { backgroundColor: colors.bleu, paddingTop: 60, paddingBottom: 30, alignItems: "center", borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  avatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.or, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  avatarTexte: { color: colors.blanc, fontSize: 30, fontFamily: fonts.bold },
  nom: { color: colors.blanc, fontSize: 20, fontFamily: fonts.bold },
  adhesion: { color: colors.blanc, opacity: 0.8, fontSize: 13, marginTop: 4, fontFamily: fonts.regular },
  contenu: { padding: 20 },
  carte: { backgroundColor: colors.blanc, borderRadius: radius.lg, overflow: "hidden", ...shadow.carte },
  ligne: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.bordure },
  ligneIcone: { width: 38, height: 38, borderRadius: 10, backgroundColor: colors.fond, alignItems: "center", justifyContent: "center", marginRight: 12 },
  ligneLabel: { color: colors.grisClair, fontSize: 12, marginBottom: 2, fontFamily: fonts.regular },
  ligneValeur: { color: colors.texte, fontSize: 15, fontFamily: fonts.medium },
  modifier: { flexDirection: "row", backgroundColor: colors.blanc, borderWidth: 1.5, borderColor: colors.bleu, borderRadius: radius.md, paddingVertical: 14, alignItems: "center", justifyContent: "center", marginTop: 18 },
  modifierTexte: { color: colors.bleu, fontFamily: fonts.semibold, fontSize: 15 },
  deconnexion: { flexDirection: "row", backgroundColor: colors.blanc, borderWidth: 1.5, borderColor: colors.rouge, borderRadius: radius.md, paddingVertical: 14, alignItems: "center", justifyContent: "center", marginTop: 12 },
  deconnexionTexte: { color: colors.rouge, fontFamily: fonts.semibold, fontSize: 15 },
  overlay: { flex: 1, backgroundColor: "rgba(30,41,59,0.45)", justifyContent: "flex-end" },
  sheet: { backgroundColor: colors.blanc, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 22, paddingBottom: 32 },
  sheetTitre: { fontSize: 18, fontFamily: fonts.bold, color: colors.texte, textAlign: "center" },
  sheetSous: { fontSize: 13.5, color: colors.gris, textAlign: "center", marginTop: 4, marginBottom: 20, fontFamily: fonts.regular },
  sheetDeco: { backgroundColor: colors.rouge, borderRadius: radius.md, paddingVertical: 15, marginBottom: 9 },
  sheetDecoTexte: { color: colors.blanc, fontSize: 15, fontFamily: fonts.semibold, textAlign: "center" },
  sheetAnnuler: { paddingVertical: 13 },
  sheetAnnulerTexte: { fontSize: 14, color: colors.gris, textAlign: "center", fontFamily: fonts.medium },
});