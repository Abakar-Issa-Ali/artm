import nodemailer from "nodemailer";

// Configuration du transporteur Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function envoyerCodeReinitialisation(destinataire: string, code: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; border: 1px solid #ece6d8; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #15326B; padding: 20px; text-align: center;">
        <h1 style="color: #E8A33D; margin: 0; font-size: 24px;">ARTM</h1>
      </div>
      <div style="padding: 24px; color: #2a2a28;">
        <h2 style="color: #15326B; font-size: 18px;">Réinitialisation de votre mot de passe</h2>
        <p>Vous avez demandé à réinitialiser votre mot de passe. Voici votre code de vérification :</p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="display: inline-block; background-color: #FBF8F2; border: 1px solid #d8d2c4; border-radius: 10px; padding: 14px 28px; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #15326B;">
            ${code}
          </span>
        </div>
        <p style="color: #6b6760; font-size: 14px;">Ce code est valable pendant 15 minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
      </div>
      <div style="background-color: #FBF8F2; padding: 14px; text-align: center; color: #8a857c; font-size: 12px;">
        Association des Ressortissants Tchadiens à Marseille
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"ARTM" <${process.env.EMAIL_USER}>`,
    to: destinataire,
    subject: "Réinitialisation de votre mot de passe ARTM",
    html,
  });
}