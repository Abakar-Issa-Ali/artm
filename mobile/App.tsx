import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import LoginScreen from "./src/screens/LoginScreen";
import HomeScreen from "./src/screens/HomeScreen";

function Routes() {
  const { membre, chargement } = useAuth();

  // Pendant la vérification du token au démarrage
  if (chargement) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#E8A33D" />
      </View>
    );
  }

  // Si pas connecté → login, sinon → l'app
  return membre ? <HomeScreen /> : <LoginScreen />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <Routes />
          <StatusBar style="light" />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, backgroundColor: "#15326B", alignItems: "center", justifyContent: "center" },
});