import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from "react-native";

type ConfirmProps = {
  visible: boolean;
  titre: string;
  message?: string;
  texteConfirmer?: string;
  destructif?: boolean;
  onConfirmer: () => void;
  onAnnuler: () => void;
};

export default function Confirm({
  visible, titre, message, texteConfirmer = "Confirmer",
  destructif = false, onConfirmer, onAnnuler,
}: ConfirmProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onAnnuler}>
      <Pressable style={styles.overlay} onPress={onAnnuler}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <Text style={styles.titre}>{titre}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}

          <TouchableOpacity
            style={[styles.btnConfirmer, destructif ? styles.btnDestructif : styles.btnNormal]}
            onPress={onConfirmer}
          >
            <Text style={[styles.btnConfirmerTexte, destructif && { color: "#fff" }]}>
              {texteConfirmer}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnAnnuler} onPress={onAnnuler}>
            <Text style={styles.btnAnnulerTexte}>Annuler</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(21,50,107,0.45)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#FBF8F2", borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 22, paddingBottom: 32 },
  titre: { fontSize: 18, fontWeight: "500", color: "#15326B", textAlign: "center" },
  message: { fontSize: 13.5, color: "#6b6760", textAlign: "center", marginTop: 8, marginBottom: 4, lineHeight: 20 },
  btnConfirmer: { borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 18 },
  btnNormal: { backgroundColor: "#E8A33D" },
  btnDestructif: { backgroundColor: "#A32D2D" },
  btnConfirmerTexte: { color: "#15326B", fontSize: 15, fontWeight: "500" },
  btnAnnuler: { paddingVertical: 13, marginTop: 4 },
  btnAnnulerTexte: { fontSize: 14, color: "#8a857c", textAlign: "center" },
});