import { View, Text, StyleSheet } from "react-native";

export default function PlaceholderScreen({ titre }: { titre: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.texte}>{titre}</Text>
      <Text style={styles.sous}>Écran à venir</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FBF8F2", alignItems: "center", justifyContent: "center" },
  texte: { color: "#15326B", fontSize: 20, fontWeight: "500" },
  sous: { color: "#8a857c", fontSize: 14, marginTop: 6 },
});