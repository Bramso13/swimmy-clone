import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
// import MangoPay SDK ici si besoin

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { reservationId, userId, amount } = await req.json();
  if (!reservationId || !userId || !amount) {
    return NextResponse.json(
      { error: "Champs requis manquants." },
      { status: 400 }
    );
  }
  // Ici, on simule l'appel MangoPay (à remplacer par l'intégration réelle)
  const mangopayPayinId =
    "sandbox_payin_" + Math.random().toString(36).substring(2, 10);
  try {
    const transaction = await prisma.transaction.create({
      data: {
        reservationId,
        userId,
        mangopayId: mangopayPayinId,
        status: "pending",
        amount,
      },
    });
    // On met à jour la réservation avec la transaction
    await prisma.reservation.update({
      where: { id: reservationId },
      data: { transaction: { connect: { id: transaction.id } } },
    });
    return NextResponse.json({ transaction });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
