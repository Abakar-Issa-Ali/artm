import { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getPaiementsEnAttente, validerPaiement, rejeterPaiement } from "../../services/tresorier.service";
import Confirm from "../../components/Confirm";
import Toast from "../../components/Toast";
import { colors, radius, shadow, fonts } from "../../theme/theme";

const MOIS = ["", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

export default function ValidationScreen() {
  const [paiements, setPaiements] = useState<any[]>([]);
  const [chargement, setChargement] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [traitement, setTraitement] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "succes" | "erreur" } | null>(null);
  const [confirmation, setConfirmation] = useState<any>(null);

  const charger = useCallback(async () => {
    try {
      const data = await getPaiementsEnAttente();
      setPaiements(data);
    } catch (error) {
      console.log("Erreur validation", error);
    } finally {
      setChargement(false);
      setRefresh(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { charger(); }, [charger]));

  async function traiter(id: number, action: "valider" | "rejeter") {
    setTraitement(id);
    try {
      if (action === "valider") {
        await validerPaiement(id);
      } else {
        await rejeterPaiement(id);
      }
      await charger();
    } catch (error: any) {
      setToast({ message: error.response?.data?.error || "Action impossible", type: "erreur" });
    } finally {
      setTraitement(null);
    }
  }

  function confirmer(id: number, action: "valider" | "rejeter", nom: string) {
    const verbe = action === "valider" ? "Valider" : "Rejeter";
    setConfirmation({
      id, action, nom,
      titre: `${verbe} le paiement`,
      message: `${verbe} le paiement de ${nom} ?`,
      texteConfirmer: verbe,
      destructif: action === "rejeter",
    });
  }

  if (chargement) {
    return <View style={styles.loader}><ActivityIndicator size="large" color={colors.bleu} /></View>;
  }

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.headerTitre}>Paiements à valider</Text>
        <Text style={styles.headerSous}>{paiements.length} en attente</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.contenu}
        refreshControl={<RefreshControl refreshing={refresh} onRefresh={() => { setRefresh(true); charger(); }} />}
      >
        {paiements.length === 0 ? (
          <View style={styles.videBloc}>
            <View style={styles.videPastille}>
              <Ionicons name="checkmark-done" size={48} color={colors.vert} />
            </View>
            <Text style={styles.videTitre}>Aucun paiement en attente</Text>
          </View>
        ) : (
          paiements.map((p) => {
            const nom = `${p.membre.prenom} ${p.membre.nom}`;
            const enCours = traitement === p.id;
            return (
              <View key={p.id} style={styles.carte}>
                <View style={styles.carteHead}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarTexte}>{(p.membre.prenom?.[0] || "") + (p.membre.nom?.[0] || "")}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.nom}>{nom}</Text>
                    <Text style={styles.detail}>
                      {MOIS[p.cotisation.mois]} {p.cotisation.annee} · {Number(p.montant).toFixed(2)} € · {p.mode}
                    </Text>
                  </View>
                </View>
                {enCours ? (
                  <ActivityIndicator color={colors.bleu} style={{ marginTop: 12 }} />
                ) : (
                  <View style={styles.actions}>
                    <TouchableOpacity style={[styles.btn, styles.btnRejeter]} onPress={() => confirmer(p.id, "rejeter", nom)} activeOpacity={0.85}>
                      <Text style={styles.btnRejeterTexte}>Rejeter</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btn, styles.btnValider]} onPress={() => confirmer(p.id, "valider", nom)} activeOpacity={0.85}>
                      <Text style={styles.btnValiderTexte}>Valider</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      <Confirm
        visible={!!confirmation}
        titre={confirmation?.titre || ""}
        message={confirmation?.message}
        texteConfirmer={confirmation?.texteConfirmer}
        destructif={confirmation?.destructif}
        onConfirmer={() => {
          const c = confirmation;
          setConfirmation(null);
          if (c) traiter(c.id, c.action);
        }}
        onAnnuler={() => setConfirmation(null)}
      />

      <Toast message={toast?.message || null} type={toast?.type} onHide={() => setToast(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.fond },
  loader: { flex: 1, backgroundColor: colors.fond, alignItems: "center", justifyContent: "center" },
  header: { backgroundColor: colors.bleu, paddingTop: 60, paddingHorizontal: 20, paddingBottom: 22, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerTitre: { color: colors.blanc, fontSize: 19, fontFamily: fonts.semibold },
  headerSous: { color: colors.blanc, opacity: 0.8, fontSize: 13, marginTop: 3, fontFamily: fonts.regular },
  contenu: { padding: 20 },
  videBloc: { alignItems: "center", marginTop: 60 },
  videPastille: { width: 90, height: 90, borderRadius: 45, backgroundColor: colors.badgeVertFond, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  videTitre: { color: colors.texte, fontSize: 16, fontFamily: fonts.semibold },
  carte: { backgroundColor: colors.blanc, borderRadius: radius.lg, padding: 16, marginBottom: 12, ...shadow.carte },
  carteHead: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.bleu, alignItems: "center", justifyContent: "center", marginRight: 12 },
  avatarTexte: { color: colors.blanc, fontSize: 15, fontFamily: fonts.bold },
  nom: { fontSize: 15, fontFamily: fonts.semibold, color: colors.texte },
  detail: { fontSize: 13, color: colors.gris, marginTop: 3, fontFamily: fonts.regular },
  actions: { flexDirection: "row", gap: 10 },
  btn: { flex: 1, paddingVertical: 13, borderRadius: radius.md, alignItems: "center" },
  btnValider: { backgroundColor: colors.vert },
  btnValiderTexte: { color: colors.blanc, fontFamily: fonts.semibold, fontSize: 14 },
  btnRejeter: { backgroundColor: colors.blanc, borderWidth: 1.5, borderColor: colors.rouge },
  btnRejeterTexte: { color: colors.rouge, fontFamily: fonts.semibold, fontSize: 14 },
});