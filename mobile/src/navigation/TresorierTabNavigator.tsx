import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";
import ValidationScreen from "../screens/tresorier/ValidationScreen";
import MembresScreen from "../screens/tresorier/MembresScreen";
import PublierAnnonceScreen from "../screens/tresorier/PublierAnnonceScreen";
import ProfilScreen from "../screens/ProfilScreen";

const Tab = createBottomTabNavigator();

function Icone({ symbole, color }: { symbole: string; color: string }) {
  return <Text style={{ fontSize: 20, color }}>{symbole}</Text>;
}

export default function TresorierTabNavigator() {
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
        name="Valider"
        component={ValidationScreen}
        options={{ tabBarIcon: ({ color }) => <Icone symbole="✓" color={color} /> }}
      />
      <Tab.Screen
        name="Membres"
        component={MembresScreen}
        options={{ tabBarIcon: ({ color }) => <Icone symbole="☰" color={color} /> }}
      />
      <Tab.Screen
        name="Annoncer"
        component={PublierAnnonceScreen}
        options={{ tabBarIcon: ({ color }) => <Icone symbole="✎" color={color} /> }}
      />
      <Tab.Screen
        name="Profil"
        component={ProfilScreen}
        options={{ tabBarIcon: ({ color }) => <Icone symbole="●" color={color} /> }}
      />
    </Tab.Navigator>
  );
}