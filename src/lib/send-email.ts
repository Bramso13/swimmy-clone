import { Resend } from "resend";
import { prisma } from "./prisma";

const resend = new Resend(process.env.RESEND_API_KEY || "");

export async function sendReservationConfirmationEmail(reservationId: string) {
  try {
    // Vérifier que la clé Resend est configurée
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.includes("REMPLACEZ")) {
      console.error("⚠️ RESEND_API_KEY n'est pas configurée. L'email ne sera pas envoyé.");
      return { success: false, error: "Configuration email manquante" };
    }

    // Récupérer la réservation avec toutes les infos nécessaires
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
        pool: {
          select: {
            title: true,
            address: true,
            pricePerHour: true,
            ownerId: true,
          },
        },
      },
    });

    if (!reservation || !reservation.user?.email) {
      return { success: false, error: "Réservation ou email introuvable" };
    }

    // Formater les dates
    const startDate = new Date(reservation.startDate);
    const endDate = new Date(reservation.endDate);
    const formattedStartDate = startDate.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const formattedEndDate = endDate.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Envoyer l'email
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: reservation.user.email,
      subject: `Confirmation de réservation - ${reservation.pool?.title || "Piscine"}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(to right, #0D6AA2, #1A8BC7);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
              }
              .content {
                background: #f9f9f9;
                padding: 30px;
                border-radius: 0 0 10px 10px;
              }
              .success-icon {
                font-size: 48px;
                margin-bottom: 20px;
              }
              .details {
                background: white;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
              }
              .detail-row {
                margin: 15px 0;
                padding-bottom: 15px;
                border-bottom: 1px solid #eee;
              }
              .detail-row:last-child {
                border-bottom: none;
              }
              .label {
                font-weight: bold;
                color: #0D6AA2;
                display: block;
                margin-bottom: 5px;
              }
              .value {
                color: #666;
              }
              .amount {
                font-size: 24px;
                font-weight: bold;
                color: #0D6AA2;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                color: #999;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>✓ Paiement réussi !</h1>
              <p>Votre réservation a été confirmée</p>
            </div>
            <div class="content">
              <div class="success-icon">🎉</div>
              <h2>Bonjour ${reservation.user.name || "Cher client"},</h2>
              <p>Votre paiement a été traité avec succès et votre réservation est maintenant confirmée.</p>
              
              <div class="details">
                <h3 style="margin-top: 0; color: #0D6AA2;">Détails de votre réservation</h3>
                
                <div class="detail-row">
                  <span class="label">Piscine :</span>
                  <span class="value">${reservation.pool?.title || "Non renseigné"}</span>
                </div>
                
                <div class="detail-row">
                  <span class="label">Adresse :</span>
                  <span class="value">${reservation.pool?.address || "Non renseigné"}</span>
                </div>
                
                <div class="detail-row">
                  <span class="label">Date de début :</span>
                  <span class="value">${formattedStartDate}</span>
                </div>
                
                <div class="detail-row">
                  <span class="label">Date de fin :</span>
                  <span class="value">${formattedEndDate}</span>
                </div>
                
                <div class="detail-row">
                  <span class="label">Montant total :</span>
                  <span class="amount">${reservation.amount} €</span>
                </div>
              </div>
              
              <p style="margin-top: 30px;">Nous vous remercions pour votre confiance et vous souhaitons une excellente expérience !</p>
              
              <div class="footer">
                <p>Vous pouvez consulter vos réservations dans votre tableau de bord.</p>
                <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Erreur Resend:", error);
      return { success: false, error: "Erreur lors de l'envoi de l'email" };
    }

    return { success: true, emailId: data?.id };
  } catch (error: any) {
    console.error("Erreur envoi email:", error);
    return { success: false, error: error.message || "Erreur serveur" };
  }
}

