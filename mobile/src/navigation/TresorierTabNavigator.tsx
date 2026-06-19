import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import ValidationScreen from "../screens/tresorier/ValidationScreen";
import MembresScreen from "../screens/tresorier/MembresScreen";
import GestionAnnoncesScreen from "../screens/tresorier/GestionAnnoncesScreen";
import ProfilScreen from "../screens/ProfilScreen";

const Tab = createBottomTabNavigator();

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
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="checkmark-circle-outline" size={size} color={color} /> }}
      />
      <Tab.Screen
        name="Membres"
        component={MembresScreen}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} /> }}
      />
      <Tab.Screen
        name="Annoncer"
        component={GestionAnnoncesScreen}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="create-outline" size={size} color={color} /> }}
      />
      <Tab.Screen
        name="Profil"
        component={ProfilScreen}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} /> }}
      />
    </Tab.Navigator>
  );
}