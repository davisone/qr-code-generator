import { Resend } from "resend";
import { BASE_URL } from "./config";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "QRaft <noreply@useqraft.com>";

export async function sendVerificationEmail(email: string, token: string, locale: string = "fr") {
  const url = `${BASE_URL}/${locale}/verify-email?token=${token}`;

  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Vérifiez votre adresse email — QRaft",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #f0ebe1; padding: 32px;">
        <h1 style="font-size: 2rem; letter-spacing: 0.06em; color: #1a1410; margin: 0 0 8px;">QRaft</h1>
        <p style="color: #6b5f52; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 24px;">Vérification email</p>
        <div style="background: #1a1410; padding: 24px; margin-bottom: 24px;">
          <p style="color: #f0ebe1; margin: 0 0 16px; font-size: 0.9rem;">Cliquez sur le bouton ci-dessous pour vérifier votre adresse email. Ce lien expire dans 24 heures.</p>
          <a href="${url}" style="display: inline-block; background: #d4290f; color: #f0ebe1; padding: 12px 24px; text-decoration: none; font-weight: 700; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em;">
            Vérifier mon email →
          </a>
        </div>
        <p style="color: #b5a898; font-size: 0.75rem;">Si vous n'avez pas créé de compte sur QRaft, ignorez cet email.</p>
      </div>
    `,
  });
  if (error) throw new Error(`Resend sendVerificationEmail: ${error.message}`);
}

export async function sendPasswordResetEmail(email: string, token: string, locale: string = "fr") {
  const url = `${BASE_URL}/${locale}/reset-password?token=${token}`;

  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Réinitialisation de mot de passe — QRaft",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #f0ebe1; padding: 32px;">
        <h1 style="font-size: 2rem; letter-spacing: 0.06em; color: #1a1410; margin: 0 0 8px;">QRaft</h1>
        <p style="color: #6b5f52; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 24px;">Réinitialisation de mot de passe</p>
        <div style="background: #1a1410; padding: 24px; margin-bottom: 24px;">
          <p style="color: #f0ebe1; margin: 0 0 16px; font-size: 0.9rem;">Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe. Ce lien expire dans 1 heure.</p>
          <a href="${url}" style="display: inline-block; background: #d4290f; color: #f0ebe1; padding: 12px 24px; text-decoration: none; font-weight: 700; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em;">
            Réinitialiser mon mot de passe →
          </a>
        </div>
        <p style="color: #b5a898; font-size: 0.75rem;">Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de passe ne sera pas modifié.</p>
      </div>
    `,
  });
  if (error) throw new Error(`Resend sendPasswordResetEmail: ${error.message}`);
}
