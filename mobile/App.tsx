import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from "@expo-google-fonts/poppins";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import LoginScreen from "./src/screens/LoginScreen";
import HomeScreen from "./src/screens/HomeScreen";
import TabNavigator from "./src/navigation/TabNavigator";
import TresorierContainer from "./src/navigation/TresorierContainer";
import { useState } from "react";
import RegisterScreen from "./src/screens/RegisterScreen";
import MotDePasseOublieScreen from "./src/screens/MotDePasseOublieScreen";

function Routes() {
  const { membre, chargement } = useAuth();
  const [afficheInscription, setAfficheInscription] = useState(false);
  const [afficheMotDePasseOublie, setAfficheMotDePasseOublie] = useState(false);

  if (chargement) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#F59E0B" />
      </View>
    );
  }

  if (!membre) {
    if (afficheInscription) {
      return <RegisterScreen onRetour={() => setAfficheInscription(false)} />;
    }
    if (afficheMotDePasseOublie) {
      return <MotDePasseOublieScreen onRetour={() => setAfficheMotDePasseOublie(false)} />;
    }
    return (
      <LoginScreen
        onInscription={() => setAfficheInscription(true)}
        onMotDePasseOublie={() => setAfficheMotDePasseOublie(true)}
      />
    );
  }

  return membre.role === "tresorier" ? <TresorierContainer /> : <TabNavigator />;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#F59E0B" />
      </View>
    );
  }

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
  loader: { flex: 1, backgroundColor: "#2563EB", alignItems: "center", justifyContent: "center" },
});