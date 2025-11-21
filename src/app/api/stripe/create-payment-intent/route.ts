import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "../../../../../lib/prisma";
import { auth } from "../../../../../lib/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-11-17.clover",
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

    // Vérifier que la réservation est acceptée (on ne peut payer que si acceptée)
    if (reservation.status !== "accepted") {
      return NextResponse.json(
        {
          error:
            "Cette réservation n'est pas acceptée. Seules les réservations acceptées peuvent être payées.",
        },
        { status: 400 }
      );
    }

    const reservationDate = new Date(reservation.updatedAt);
    const now = new Date();
    const hoursSinceUpdate =
      (now.getTime() - reservationDate.getTime()) / (1000 * 60 * 60);

    if (hoursSinceUpdate >= 24) {
      return NextResponse.json(
        {
          error:
            "Le délai de paiement a expiré. Vous avez 24 heures après l'acceptation pour effectuer le paiement.",
        },
        { status: 400 }
      );
    }

    // Créer ou récupérer le PaymentIntent
    let paymentIntent: Stripe.PaymentIntent;

    // Vérifier s'il existe déjà une transaction avec un stripeId
    const existingTransaction = await prisma.transaction.findUnique({
      where: { reservationId },
    });

    // Si une transaction existe et est déjà payée, bloquer le paiement
    if (existingTransaction && (existingTransaction.status === "paid" || existingTransaction.status === "completed")) {
      return NextResponse.json(
        { error: "Cette réservation a déjà été payée" },
        { status: 400 }
      );
    }

    if (existingTransaction?.mangopayId?.startsWith("pi_")) {
      // Récupérer le PaymentIntent existant
      try {
        paymentIntent = await stripe.paymentIntents.retrieve(
          existingTransaction.mangopayId
        );
        
        // Si le PaymentIntent est déjà réussi, bloquer le paiement
        if (paymentIntent.status === "succeeded") {
          return NextResponse.json(
            { error: "Cette réservation a déjà été payée" },
            { status: 400 }
          );
        }
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
    return NextResponse.json(
      { error: error.message || "Erreur lors de la création du paiement" },
      { status: 500 }
    );
  }
}
