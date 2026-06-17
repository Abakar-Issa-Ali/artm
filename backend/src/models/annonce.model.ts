import mongoose from "../config/mongo.js";

const annonceSchema = new mongoose.Schema({
  auteurId: { type: Number, required: true },  // id du membre (bureau) PostgreSQL
  titre: { type: String, required: true },
  contenu: { type: String, required: true },
  datePublication: { type: Date, default: Date.now },
});

export const Annonce = mongoose.model("Annonce", annonceSchema);