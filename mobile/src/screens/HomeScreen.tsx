import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function HomeScreen() {
  const { membre, deconnexion } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.titre}>Bienvenue</Text>
      <Text style={styles.nom}>{membre?.prenom} {membre?.nom}</Text>
      <Text style={styles.role}>Rôle : {membre?.role}</Text>
      <TouchableOpacity style={styles.bouton} onPress={deconnexion}>
        <Text style={styles.boutonTexte}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FBF8F2", alignItems: "center", justifyContent: "center", padding: 24 },
  titre: { color: "#15326B", fontSize: 22, opacity: 0.7 },
  nom: { color: "#15326B", fontSize: 28, fontWeight: "500", marginTop: 4 },
  role: { color: "#8a857c", fontSize: 14, marginTop: 8 },
  bouton: { backgroundColor: "#15326B", borderRadius: 12, paddingVertical: 14, paddingHorizontal: 28, marginTop: 32 },
  boutonTexte: { color: "#FBF8F2", fontWeight: "500", fontSize: 15 },
});