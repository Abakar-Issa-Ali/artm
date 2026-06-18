import { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Modal, Pressable } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import api from "../config/api";
import ModifierProfilScreen from "./ModifierProfilScreen";

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

  function confirmerDeconnexion() {
      setConfirmDeco(true);
  }

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
        <ActivityIndicator size="large" color="#15326B" />
      </View>
    );
  }

  // Initiales pour l'avatar
  const initiales = `${profil?.prenom?.[0] || ""}${profil?.nom?.[0] || ""}`.toUpperCase();

  // Date d'adhésion lisible
  let adhesion = "";
  if (profil?.dateAdhesion) {
    const d = new Date(profil.dateAdhesion);
    adhesion = `Membre depuis ${MOIS[d.getMonth() + 1]} ${d.getFullYear()}`;
  }

  return (
    <ScrollView style={styles.page}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTexte}>{initiales}</Text>
        </View>
        <Text style={styles.nom}>{profil?.prenom} {profil?.nom}</Text>
        <Text style={styles.adhesion}>{adhesion}</Text>
      </View>

      <View style={styles.contenu}>
        <View style={styles.carte}>
          <Ligne label="Email" valeur={profil?.email} />
          <Ligne label="Téléphone" valeur={profil?.telephone || "Non renseigné"} />
          <Ligne label="Rôle" valeur={`${profil?.role} · ${Number(profil?.montantCotisation).toFixed(2)} €/mois`} derniere />
        </View>

        <TouchableOpacity style={styles.modifier} onPress={() => setEdition(true)}>
          <Text style={styles.modifierTexte}>Modifier mon profil</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deconnexion} onPress={confirmerDeconnexion}>
          <Text style={styles.deconnexionTexte}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
      <Modal visible={confirmDeco} transparent animationType="fade" onRequestClose={() => setConfirmDeco(false)}>
        <Pressable style={styles.overlay} onPress={() => setConfirmDeco(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={styles.sheetTitre}>Déconnexion</Text>
            <Text style={styles.sheetSous}>Voulez-vous vraiment vous déconnecter ?</Text>

            <TouchableOpacity style={styles.sheetDeco} onPress={deconnexion}>
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

function Ligne({ label, valeur, derniere }: { label: string; valeur: string; derniere?: boolean }) {
  return (
    <View style={[styles.ligne, derniere && { borderBottomWidth: 0 }]}>
      <Text style={styles.ligneLabel}>{label}</Text>
      <Text style={styles.ligneValeur}>{valeur}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  modifier: { backgroundColor: "#fff", borderWidth: 0.5, borderColor: "#d8d2c4", borderRadius: 12, paddingVertical: 13, alignItems: "center", marginTop: 16 },
  modifierTexte: { color: "#15326B", fontWeight: "500", fontSize: 14 },  
  page: { flex: 1, backgroundColor: "#FBF8F2" },
  loader: { flex: 1, backgroundColor: "#FBF8F2", alignItems: "center", justifyContent: "center" },
  header: { backgroundColor: "#15326B", paddingTop: 60, paddingBottom: 28, alignItems: "center" },
  avatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: "#E8A33D", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  avatarTexte: { color: "#15326B", fontSize: 26, fontWeight: "500" },
  nom: { color: "#FBF8F2", fontSize: 18, fontWeight: "500" },
  adhesion: { color: "#FBF8F2", opacity: 0.7, fontSize: 12.5, marginTop: 4 },
  contenu: { padding: 20 },
  carte: { backgroundColor: "#fff", borderWidth: 0.5, borderColor: "#ece6d8", borderRadius: 13, overflow: "hidden" },
  ligne: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: "#f0ebe0" },
  ligneLabel: { color: "#8a857c", fontSize: 12, marginBottom: 3 },
  ligneValeur: { color: "#2a2a28", fontSize: 14.5 },
  deconnexion: { marginTop: 20, alignItems: "center", paddingVertical: 14 },
  deconnexionTexte: { color: "#A32D2D", fontWeight: "500", fontSize: 15 },
  overlay: { flex: 1, backgroundColor: "rgba(21,50,107,0.45)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#FBF8F2", borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 22, paddingBottom: 32 },
  sheetTitre: { fontSize: 18, fontWeight: "500", color: "#15326B", textAlign: "center" },
  sheetSous: { fontSize: 13, color: "#8a857c", textAlign: "center", marginTop: 4, marginBottom: 20 },
  sheetDeco: { backgroundColor: "#A32D2D", borderRadius: 12, paddingVertical: 14, marginBottom: 9 },
  sheetDecoTexte: { color: "#fff", fontSize: 15, fontWeight: "500", textAlign: "center" },
  sheetAnnuler: { paddingVertical: 13 },
  sheetAnnulerTexte: { fontSize: 14, color: "#8a857c", textAlign: "center" },
});