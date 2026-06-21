import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import ValidationScreen from "../screens/tresorier/ValidationScreen";
import MembresScreen from "../screens/tresorier/MembresScreen";
import GestionAnnoncesScreen from "../screens/tresorier/GestionAnnoncesScreen";
import ProfilScreen from "../screens/ProfilScreen";
import { colors, fonts } from "../theme/theme";

const Tab = createBottomTabNavigator();

export default function TresorierTabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.bleu,
        tabBarInactiveTintColor: colors.grisClair,
        tabBarStyle: {
          backgroundColor: colors.blanc,
          borderTopColor: colors.bordure,
          height: 62 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontFamily: fonts.medium },
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