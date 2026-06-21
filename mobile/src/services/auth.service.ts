import api from "../config/api";

export async function demanderResetMotDePasse(email: string) {
  const { data } = await api.post("/auth/mot-de-passe-oublie", { email });
  return data;
}

export async function reinitialiserMotDePasse(email: string, code: string, nouveauMotDePasse: string) {
  const { data } = await api.post("/auth/reinitialiser", { email, code, nouveauMotDePasse });
  return data;
}