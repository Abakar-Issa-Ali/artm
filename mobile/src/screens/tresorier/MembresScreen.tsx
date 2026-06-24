import { useState, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity, Modal, Pressable, TextInput } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";
import Confirm from "../../components/Confirm";
import Toast from "../../components/Toast";
import { getMembres, getResume, changerRole, desactiverMembre, reactiverMembre, supprimerMembre, relancerMembre, getComptesEnAttente, validerCompte } from "../../services/tresorier.service";
import { colors, radius, shadow, fonts } from "../../theme/theme";

// Petit graphique en anneau (donut) pour le taux de paiement
function Donut({ taux }: { taux: number }) {
  const taille = 64, epaisseur = 8, rayon = (taille - epaisseur) / 2;
  const circonf = 2 * Math.PI * rayon;
  const rempli = circonf * (taux / 100);
  return (
    <View style={{ width: taille, height: taille, alignItems: "center", justifyContent: "center" }}>
      <Svg width={taille} height={taille}>
        <Circle cx={taille / 2} cy={taille / 2} r={rayon} stroke={colors.bordure} strokeWidth={epaisseur} fill="none" />
        <Circle
          cx={taille / 2} cy={taille / 2} r={rayon}
          stroke={colors.bleu} strokeWidth={epaisseur} fill="none"
          strokeDasharray={`${rempli} ${circonf}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${taille / 2} ${taille / 2})`}
        />
      </Svg>
      <Text style={styles.donutTexte}>{taux}%</Text>
    </View>
  );
}

export default function MembresScreen() {
  const [membres, setMembres] = useState<any[]>([]);
  const [enAttente, setEnAttente] = useState<any[]>([]);
  const [chargement, setChargement] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [resume, setResume] = useState<any>(null);
  const [aSupprimer, setASupprimer] = useState<any>(null);
  const [validation, setValidation] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "succes" | "erreur" } | null>(null);
  const [selection, setSelection] = useState<any>(null);
  const [menuRoleVisible, setMenuRoleVisible] = useState(false);
  const [recherche, setRecherche] = useState("");

  const charger = useCallback(async () => {
    try {
      const [data, resumeData, attenteData] = await Promise.all([getMembres(), getResume(), getComptesEnAttente()]);
      setMembres(data);
      setResume(resumeData);
      setEnAttente(attenteData);
    } catch (error) {
      console.log("Erreur membres", error);
    } finally {
      setChargement(false);
      setRefresh(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { charger(); }, [charger]));

  function fermer() {
    setSelection(null);
    setMenuRoleVisible(false);
  }

  async function action(fn: () => Promise<any>) {
    try {
      await fn();
      fermer();
      await charger();
    } catch (error: any) {
      setToast({ message: error.response?.data?.error || "Action impossible", type: "erreur" });
    }
  }

  async function relancer(m: any) {
    try {
      await relancerMembre(m.id);
      setToast({ message: `Relance envoyée à ${m.prenom}`, type: "succes" });
    } catch (error: any) {
      setToast({ message: error.response?.data?.error || "Relance impossible", type: "erreur" });
    }
  }

  async function valider(m: any) {
    setValidation(m.id);
    try {
      await validerCompte(m.id);
      setToast({ message: `Compte de ${m.prenom} validé`, type: "succes" });
      await charger();
    } catch (error: any) {
      setToast({ message: error.response?.data?.error || "Validation impossible", type: "erreur" });
    } finally {
      setValidation(null);
    }
  }

  function confirmerSuppression(m: any) {
    setASupprimer(m);
  }

  async function executerSuppression() {
    const m = aSupprimer;
    setASupprimer(null);
    if (!m) return;
    try {
      await supprimerMembre(m.id);
      await charger();
      setToast({ message: `${m.prenom} ${m.nom} supprimé`, type: "succes" });
    } catch (error: any) {
      setToast({ message: error.response?.data?.error || "Suppression impossible", type: "erreur" });
    }
  }

  if (chargement) {
    return <View style={styles.loader}><ActivityIndicator size="large" color={colors.bleu} /></View>;
  }

  const aJour = membres.filter((m) => m.aJour).length;
  const enRetard = membres.filter((m) => !m.aJour && m.actif);
  // Filtre la liste sur nom + prénom (insensible à la casse)
  const membresFiltres = membres.filter((m) => {
    const texte = `${m.prenom} ${m.nom}`.toLowerCase();
    return texte.includes(recherche.trim().toLowerCase());
  });

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.headerTitre}>Membres</Text>
        <Text style={styles.headerSous}>{membres.length} membres · {aJour} à jour</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.contenu}
        refreshControl={<RefreshControl refreshing={refresh} onRefresh={() => { setRefresh(true); charger(); }} />}
      >
        {/* Résumé du tableau de bord avec donut */}
        {resume && (
          <View style={styles.resume}>
            <View style={{ flex: 1 }}>
              <Text style={styles.resumeTitre}>Résumé</Text>
              <Text style={styles.resumeLigne}>Membres actifs : <Text style={styles.resumeValeur}>{resume.membresActifs}</Text></Text>
              <Text style={styles.resumeLigne}>Encaissé ce mois : <Text style={styles.resumeValeur}>{Number(resume.totalEncaisse).toFixed(2)} €</Text> ({resume.nombrePayees}/{resume.nombreTotal})</Text>
              <Text style={styles.resumeLigne}>Taux de paiement : <Text style={styles.resumeValeur}>{resume.tauxPaiement}%</Text></Text>
            </View>
            <Donut taux={Number(resume.tauxPaiement) || 0} />
          </View>
        )}

        {/* Comptes en attente de validation */}
        {enAttente.length > 0 && (
          <>
            <Text style={styles.section}>Comptes en attente ({enAttente.length})</Text>
            {enAttente.map((m) => (
              <View key={"attente" + m.id} style={styles.attenteLigne}>
                <View style={styles.attenteIcone}>
                  <Ionicons name="person-add-outline" size={18} color={colors.bleu} />
                </View>
                <View style={styles.infos}>
                  <Text style={styles.nom}>{m.prenom} {m.nom}</Text>
                  <Text style={styles.attenteEmail}>{m.email}</Text>
                </View>
                <TouchableOpacity
                  style={styles.validerBtn}
                  onPress={() => valider(m)}
                  disabled={validation === m.id}
                  activeOpacity={0.85}
                >
                  {validation === m.id
                    ? <ActivityIndicator color={colors.blanc} size="small" />
                    : <Text style={styles.validerTexte}>Valider</Text>}
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {/* Membres en retard */}
        {enRetard.length > 0 && (
          <>
            <Text style={styles.section}>Membres en retard</Text>
            {enRetard.map((m) => (
              <View key={"retard" + m.id} style={styles.retardLigne}>
                <View style={styles.infos}>
                  <Text style={styles.nom}>{m.prenom} {m.nom}</Text>
                  <Text style={styles.retardTexte}>{m.nombreEnRetard} mois en retard</Text>
                </View>
                <TouchableOpacity style={styles.relanceBtn} onPress={() => relancer(m)} activeOpacity={0.85}>
                  <Text style={styles.relanceTexte}>Relancer</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}
        <Text style={styles.section}>Tous les membres</Text>

        <View style={styles.recherche}>
          <Ionicons name="search-outline" size={18} color={colors.grisClair} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.rechercheInput}
            placeholder="Rechercher un membre..."
            placeholderTextColor={colors.grisClair}
            value={recherche}
            onChangeText={setRecherche}
          />
          {recherche.length > 0 && (
            <TouchableOpacity onPress={() => setRecherche("")} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close-circle" size={18} color={colors.grisClair} />
            </TouchableOpacity>
          )}
        </View>

        {membresFiltres.length === 0 ? (
          <Text style={styles.vide}>Aucun membre trouvé.</Text>
        ) : membresFiltres.map((m) => {
          const initiales = `${m.prenom?.[0] || ""}${m.nom?.[0] || ""}`.toUpperCase();
          return (
            <TouchableOpacity key={m.id} style={[styles.ligne, !m.actif && { opacity: 0.5 }]} onPress={() => setSelection(m)} activeOpacity={0.8}>
              <View style={styles.avatar}><Text style={styles.avatarTexte}>{initiales}</Text></View>
              <View style={styles.infos}>
                <Text style={styles.nom}>{m.prenom} {m.nom}</Text>
                <Text style={styles.role}>{m.role}{!m.actif && " · désactivé"}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: m.aJour ? colors.badgeVertFond : colors.badgeRougeFond }]}>
                <Text style={[styles.badgeTexte, { color: m.aJour ? colors.badgeVertTexte : colors.badgeRougeTexte }]}>
                  {m.aJour ? "À jour" : `${m.nombreEnRetard} retard${m.nombreEnRetard > 1 ? "s" : ""}`}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Modal d'actions */}
      <Modal visible={!!selection} transparent animationType="fade" onRequestClose={fermer}>
        <Pressable style={styles.overlay} onPress={fermer}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            {selection && (
              <>
                <Text style={styles.sheetTitre}>{selection.prenom} {selection.nom}</Text>
                <Text style={styles.sheetSous}>Rôle : {selection.role}{!selection.actif && " · désactivé"}</Text>

                {!menuRoleVisible ? (
                  <>
                    <TouchableOpacity style={styles.optionBtn} onPress={() => setMenuRoleVisible(true)}>
                      <Ionicons name="swap-horizontal" size={18} color={colors.bleu} style={styles.optionIcone} />
                      <Text style={styles.optionTexte}>Changer le rôle</Text>
                    </TouchableOpacity>

                    {selection.actif ? (
                      <TouchableOpacity style={styles.optionBtn} onPress={() => action(() => desactiverMembre(selection.id))}>
                        <Ionicons name="pause-circle-outline" size={18} color={colors.or} style={styles.optionIcone} />
                        <Text style={styles.optionTexte}>Désactiver</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity style={styles.optionBtn} onPress={() => action(() => reactiverMembre(selection.id))}>
                        <Ionicons name="play-circle-outline" size={18} color={colors.vert} style={styles.optionIcone} />
                        <Text style={styles.optionTexte}>Réactiver</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity style={styles.optionBtn} onPress={() => confirmerSuppression(selection)}>
                      <Ionicons name="trash-outline" size={18} color={colors.rouge} style={styles.optionIcone} />
                      <Text style={[styles.optionTexte, { color: colors.rouge }]}>Supprimer définitivement</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text style={styles.sheetSection}>Nouveau rôle</Text>
                    <TouchableOpacity style={styles.optionBtn} onPress={() => action(() => changerRole(selection.id, "membre"))}>
                      <Text style={styles.optionTexte}>Membre (5€)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.optionBtn} onPress={() => action(() => changerRole(selection.id, "bureau"))}>
                      <Text style={styles.optionTexte}>Bureau (10€)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.optionBtn} onPress={() => action(() => changerRole(selection.id, "tresorier"))}>
                      <Text style={styles.optionTexte}>Trésorier</Text>
                    </TouchableOpacity>
                  </>
                )}

                <TouchableOpacity style={styles.annulerBtn} onPress={fermer}>
                  <Text style={styles.annulerTexte}>Annuler</Text>
                </TouchableOpacity>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      <Confirm
        visible={!!aSupprimer}
        titre="Suppression définitive"
        message={aSupprimer ? `Supprimer ${aSupprimer.prenom} ${aSupprimer.nom} et toutes ses données ? Cette action est irréversible.` : ""}
        texteConfirmer="Supprimer"
        destructif
        onConfirmer={executerSuppression}
        onAnnuler={() => setASupprimer(null)}
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
  resume: { flexDirection: "row", alignItems: "center", backgroundColor: colors.blanc, borderRadius: radius.lg, padding: 18, marginBottom: 20, ...shadow.carte },
  resumeTitre: { fontSize: 16, fontFamily: fonts.bold, color: colors.texte, marginBottom: 10 },
  resumeLigne: { fontSize: 13.5, color: colors.gris, marginBottom: 5, fontFamily: fonts.regular },
  resumeValeur: { fontFamily: fonts.semibold, color: colors.texte },
  donutTexte: { position: "absolute", fontSize: 14, fontFamily: fonts.bold, color: colors.texte },
  section: { color: colors.gris, fontSize: 14, fontFamily: fonts.semibold, marginBottom: 12, marginTop: 4 },
  attenteLigne: { flexDirection: "row", alignItems: "center", backgroundColor: "#EAF0FB", borderRadius: radius.md, padding: 14, marginBottom: 10 },
  attenteIcone: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.blanc, alignItems: "center", justifyContent: "center", marginRight: 12 },
  attenteEmail: { fontSize: 12.5, color: colors.gris, marginTop: 2, fontFamily: fonts.regular },
  validerBtn: { backgroundColor: colors.vert, borderRadius: radius.sm, paddingVertical: 9, paddingHorizontal: 16, minWidth: 76, alignItems: "center" },
  validerTexte: { color: colors.blanc, fontFamily: fonts.semibold, fontSize: 13 },
  retardLigne: { flexDirection: "row", alignItems: "center", backgroundColor: colors.badgeRougeFond, borderRadius: radius.md, padding: 14, marginBottom: 10 },
  retardTexte: { fontSize: 12.5, color: colors.badgeRougeTexte, marginTop: 2, fontFamily: fonts.regular },
  relanceBtn: { backgroundColor: colors.or, borderRadius: radius.sm, paddingVertical: 9, paddingHorizontal: 16 },
  relanceTexte: { color: colors.blanc, fontFamily: fonts.semibold, fontSize: 13 },
  ligne: { flexDirection: "row", alignItems: "center", backgroundColor: colors.blanc, borderRadius: radius.md, padding: 14, marginBottom: 10, ...shadow.carte },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.bleu, alignItems: "center", justifyContent: "center", marginRight: 12 },
  avatarTexte: { color: colors.blanc, fontFamily: fonts.bold, fontSize: 15 },
  infos: { flex: 1 },
  nom: { fontSize: 15, fontFamily: fonts.semibold, color: colors.texte },
  role: { fontSize: 12.5, color: colors.gris, marginTop: 2, fontFamily: fonts.regular },
  badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  badgeTexte: { fontSize: 12, fontFamily: fonts.semibold },
  overlay: { flex: 1, backgroundColor: "rgba(30,41,59,0.45)", justifyContent: "flex-end" },
  sheet: { backgroundColor: colors.blanc, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 22, paddingBottom: 32 },
  sheetTitre: { fontSize: 18, fontFamily: fonts.bold, color: colors.texte, textAlign: "center" },
  sheetSous: { fontSize: 13, color: colors.gris, textAlign: "center", marginTop: 4, marginBottom: 18, fontFamily: fonts.regular },
  sheetSection: { fontSize: 12.5, color: colors.gris, fontFamily: fonts.semibold, marginBottom: 8 },
  optionBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: colors.fond, borderRadius: radius.md, paddingVertical: 15, paddingHorizontal: 16, marginBottom: 9 },
  optionIcone: { marginRight: 8 },
  optionTexte: { fontSize: 15, color: colors.texte, fontFamily: fonts.semibold },
  annulerBtn: { paddingVertical: 13, marginTop: 4 },
  annulerTexte: { fontSize: 14, color: colors.gris, textAlign: "center", fontFamily: fonts.medium },
  recherche: { flexDirection: "row", alignItems: "center", backgroundColor: colors.blanc, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 4, marginBottom: 12, borderWidth: 1, borderColor: colors.bordure },
  rechercheInput: { flex: 1, paddingVertical: 10, fontSize: 14.5, color: colors.texte, fontFamily: fonts.regular },
  vide: { color: colors.gris, textAlign: "center", marginTop: 16, fontSize: 14, fontFamily: fonts.regular },
});