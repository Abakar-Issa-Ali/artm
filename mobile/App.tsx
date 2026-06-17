import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import api from "./src/config/api";

export default function App() {
  const [statut, setStatut] = useState("Pas encore testé");

  async function testerConnexion() {
    try {
      const reponse = await api.get("/../health");
      setStatut("Connecté ! " + JSON.stringify(reponse.data));
    } catch (error: any) {
      setStatut("Erreur : " + error.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titre}>ARTM</Text>
      <Text style={styles.statut}>{statut}</Text>
      <TouchableOpacity style={styles.bouton} onPress={testerConnexion}>
        <Text style={styles.boutonTexte}>Tester la connexion à l'API</Text>
      </TouchableOpacity>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#15326B", alignItems: "center", justifyContent: "center", padding: 24 },
  titre: { color: "#E8A33D", fontSize: 36, fontWeight: "500", marginBottom: 20 },
  statut: { color: "#FBF8F2", fontSize: 14, textAlign: "center", marginBottom: 30 },
  bouton: { backgroundColor: "#E8A33D", paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12 },
  boutonTexte: { color: "#15326B", fontWeight: "500", fontSize: 15 },
});