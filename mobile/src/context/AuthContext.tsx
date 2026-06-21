import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import * as SecureStore from "expo-secure-store";
import api from "../config/api";

interface Membre {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
}

interface AuthContextType {
  membre: Membre | null;
  chargement: boolean;
  connexion: (email: string, motDePasse: string) => Promise<void>;
  inscription: (data: any) => Promise<void>;
  deconnexion: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [membre, setMembre] = useState<Membre | null>(null);
  const [chargement, setChargement] = useState(true);

  // Au démarrage, on vérifie si un token existe déjà
  useEffect(() => {
    async function verifierToken() {
      try {
        const token = await SecureStore.getItemAsync("token");
        if (token) {
          const reponse = await api.get("/auth/me");
          setMembre(reponse.data);
        }
      } catch {
        await SecureStore.deleteItemAsync("token");
      } finally {
        setChargement(false);
      }
    }
    verifierToken();
  }, []);

  async function connexion(email: string, motDePasse: string) {
    const reponse = await api.post("/auth/login", { email, motDePasse });
    await SecureStore.setItemAsync("token", reponse.data.token);
    setMembre(reponse.data.membre);
  }

  async function inscription(data: any) {
    const reponse = await api.post("/auth/register", data);
    await SecureStore.setItemAsync("token", reponse.data.token);
    setMembre(reponse.data.membre);
  }

  async function deconnexion() {
    await SecureStore.deleteItemAsync("token");
    setMembre(null);
  }

  return (
    <AuthContext.Provider value={{ membre, chargement, connexion, inscription, deconnexion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
}
