import { useEffect } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { useRef } from "react";

type ToastProps = {
  message: string | null;
  type?: "succes" | "erreur";
  onHide: () => void;
};

export default function Toast({ message, type = "succes", onHide }: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (message) {
      // Apparition
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      // Disparition après 2,5s
      const timer = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => onHide());
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!message) return null;

  const fond = type === "erreur" ? "#A32D2D" : "#15326B";

  return (
    <Animated.View style={[styles.toast, { backgroundColor: fond, opacity }]} pointerEvents="none">
      <Text style={styles.texte}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
    zIndex: 1000,
  },
  texte: { color: "#FBF8F2", fontSize: 14, fontWeight: "500", textAlign: "center" },
});