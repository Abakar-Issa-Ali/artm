import { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import api from "../config/api";

const MOIS = ["", "janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

export default function ProfilScreen() {
  const { membre, deconnexion } = useAuth();
  const [profil, setProfil] = useState<any>(null);
  const [chargement, setChargement] = useState(true);

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
    Alert.alert("Déconnexion", "Voulez-vous vraiment vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Se déconnecter", style: "destructive", onPress: deconnexion },
    ]);
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

        <TouchableOpacity style={styles.deconnexion} onPress={confirmerDeconnexion}>
          <Text style={styles.deconnexionTexte}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
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
});