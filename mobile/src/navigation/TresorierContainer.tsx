import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import TabNavigator from "./TabNavigator";
import TresorierTabNavigator from "./TresorierTabNavigator";

export default function TresorierContainer() {
  const [modeGestion, setModeGestion] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      {modeGestion ? <TresorierTabNavigator /> : <TabNavigator />}

      <TouchableOpacity style={styles.bouton} onPress={() => setModeGestion((v) => !v)}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <Ionicons
            name={modeGestion ? "arrow-back" : "settings-outline"}
            size={15}
            color="#15326B"
          />
          <Text style={styles.boutonTexte}>
            {modeGestion ? "Mon espace" : "Gestion"}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bouton: {
    position: "absolute",
    top: 58,
    right: 16,
    backgroundColor: "#E8A33D",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    zIndex: 100,
  },
  boutonTexte: { color: "#15326B", fontWeight: "500", fontSize: 13 },
});