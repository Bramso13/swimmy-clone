import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "../../../../../lib/prisma";
import { auth } from "../../../../../lib/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-12-18.acacia",
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { reservationId } = await req.json();
    
    if (!reservationId) {
      return NextResponse.json(
        { error: "reservationId est requis" },
        { status: 400 }
      );
    }

    // Récupérer la réservation
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { pool: true, user: true },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "Réservation introuvable" },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur connecté est bien le propriétaire de la réservation
    if (reservation.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    // Vérifier que la réservation n'a pas déjà été payée
    if (reservation.status === "paid" || reservation.status === "accepted") {
      return NextResponse.json(
        { error: "Cette réservation a déjà été payée" },
        { status: 400 }
      );
    }

    // Créer ou récupérer le PaymentIntent
    let paymentIntent: Stripe.PaymentIntent;

    // Vérifier s'il existe déjà une transaction avec un stripeId
    const existingTransaction = await prisma.transaction.findUnique({
      where: { reservationId },
    });

    if (existingTransaction?.mangopayId?.startsWith("pi_")) {
      // Récupérer le PaymentIntent existant
      try {
        paymentIntent = await stripe.paymentIntents.retrieve(existingTransaction.mangopayId);
      } catch {
        // Si le PaymentIntent n'existe plus, en créer un nouveau
        paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(reservation.amount * 100), // Convertir en centimes
          currency: "eur",
          metadata: {
            reservationId: reservation.id,
            userId: reservation.userId,
            poolId: reservation.poolId,
          },
        });
      }
    } else {
      // Créer un nouveau PaymentIntent
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(reservation.amount * 100), // Convertir en centimes
        currency: "eur",
        metadata: {
          reservationId: reservation.id,
          userId: reservation.userId,
          poolId: reservation.poolId,
        },
      });

      // Créer ou mettre à jour la transaction
      if (existingTransaction) {
        await prisma.transaction.update({
          where: { id: existingTransaction.id },
          data: {
            mangopayId: paymentIntent.id,
            status: "pending",
            amount: reservation.amount,
          },
        });
      } else {
        await prisma.transaction.create({
          data: {
            reservationId: reservation.id,
            userId: reservation.userId,
            mangopayId: paymentIntent.id,
            status: "pending",
            amount: reservation.amount,
          },
        });
      }
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error("Erreur Stripe:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de la création du paiement" },
      { status: 500 }
    );
  }
}

