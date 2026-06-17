import mongoose from "../config/mongo.js";

const notificationSchema = new mongoose.Schema({
  membreId: { type: Number, required: true },  // id du membre PostgreSQL
  type: { type: String, required: true },        // ex: "paiement_valide", "relance"
  contenu: { type: String, required: true },
  lu: { type: Boolean, default: false },
  dateCreation: { type: Date, default: Date.now },
});

// Index pour récupérer rapidement les notifications d'un membre
notificationSchema.index({ membreId: 1, dateCreation: -1 });

export const Notification = mongoose.model("Notification", notificationSchema);