import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";
import DashboardScreen from "../screens/DashboardScreen";
import PlaceholderScreen from "../screens/PlaceholderScreen";
import ProfilScreen from "../screens/ProfilScreen";
import AnnoncesScreen from "../screens/AnnoncesScreen";

const Tab = createBottomTabNavigator();

// Petit composant icône texte simple (on mettra de vraies icônes plus tard)
function Icone({ symbole, color }: { symbole: string; color: string }) {
  return <Text style={{ fontSize: 20, color }}>{symbole}</Text>;
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#15326B",
        tabBarInactiveTintColor: "#bdb7a8",
        tabBarStyle: { backgroundColor: "#fff", borderTopColor: "#ece6d8", height: 60, paddingBottom: 8, paddingTop: 8 },
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tab.Screen
        name="Accueil"
        component={DashboardScreen}
        options={{ tabBarIcon: ({ color }) => <Icone symbole="⌂" color={color} /> }}
      />
      <Tab.Screen
        name="Payer"
        children={() => <PlaceholderScreen titre="Paiement" />}
        options={{ tabBarIcon: ({ color }) => <Icone symbole="€" color={color} /> }}
      />
      <Tab.Screen
        name="Annonces"
        component={AnnoncesScreen}
        options={{ tabBarIcon: ({ color }) => <Icone symbole="►" color={color} /> }}
      />
      <Tab.Screen
        name="Profil"
        component={ProfilScreen}
        options={{ tabBarIcon: ({ color }) => <Icone symbole="●" color={color} /> }}
      />
    </Tab.Navigator>
  );
}