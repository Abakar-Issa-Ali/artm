import mongoose from "mongoose";

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/artm";

export async function connectMongo() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Connecté à MongoDB");
  } catch (error) {
    console.error("Erreur de connexion MongoDB :", error);
    process.exit(1);
  }
}

export default mongoose;