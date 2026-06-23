import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DashboardScreen from "../screens/DashboardScreen";
import ProfilScreen from "../screens/ProfilScreen";
import AnnoncesScreen from "../screens/AnnoncesScreen";
import PaiementScreen from "../screens/PaiementScreen";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts } from "../theme/theme";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
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
        name="Accueil"
        component={DashboardScreen}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} /> }}
      />
      <Tab.Screen
        name="Payer"
        component={PaiementScreen}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="card-outline" size={size} color={color} /> }}
      />
      <Tab.Screen
        name="Annonces"
        component={AnnoncesScreen}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="megaphone-outline" size={size} color={color} /> }}
      />
      <Tab.Screen
        name="Profil"
        component={ProfilScreen}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} /> }}
      />
    </Tab.Navigator>
  );
}