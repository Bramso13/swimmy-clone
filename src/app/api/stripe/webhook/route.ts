import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "../../../../../lib/prisma";
import { sendReservationConfirmationEmail } from "../../../../../lib/send-email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-12-18.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Signature manquante" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error("Erreur webhook:", err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    // Gérer les événements de paiement
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const reservationId = paymentIntent.metadata.reservationId;

      if (reservationId) {
        // Mettre à jour la transaction
        await prisma.transaction.updateMany({
          where: { mangopayId: paymentIntent.id },
          data: { status: "succeeded" },
        });

        // Mettre à jour la réservation
        await prisma.reservation.update({
          where: { id: reservationId },
          data: { status: "paid" },
        });

        // Marquer la piscine comme indisponible
        const reservation = await prisma.reservation.findUnique({
          where: { id: reservationId },
          select: { poolId: true },
        });

        if (reservation) {
          await prisma.pool.update({
            where: { id: reservation.poolId },
            data: { isAvailable: false },
          });
        }

        // Envoyer l'email de confirmation (en arrière-plan, ne pas bloquer)
        sendReservationConfirmationEmail(reservationId).catch((err) => {
          console.error("Erreur lors de l'envoi de l'email:", err);
        });
      }
    } else if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      await prisma.transaction.updateMany({
        where: { mangopayId: paymentIntent.id },
        data: { status: "failed" },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Erreur webhook:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

