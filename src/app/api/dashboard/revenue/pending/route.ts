"use server";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";
import { auth } from "../../../../../../lib/auth";
import { rejectExpiredPaymentRequests } from "../../../../../../lib/reservation-expiration";

const PENDING_RESERVATION_STATUSES = ["accepted"];

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const userId = session?.user?.id as string | undefined;

    if (!userId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Avant de calculer les montants, expirer les demandes trop anciennes
    await rejectExpiredPaymentRequests();

    const [pendingAggregate, pendingCount] = await Promise.all([
      prisma.reservation.aggregate({
        where: {
          status: { in: PENDING_RESERVATION_STATUSES },
        },
        _sum: { amount: true },
      }),
      prisma.reservation.count({
        where: {
          status: { in: PENDING_RESERVATION_STATUSES },
        },
      }),
    ]);

    return NextResponse.json({
      pending: pendingAggregate._sum.amount ?? 0,
      count: pendingCount,
    });
  } catch (error) {
    console.error("Erreur revenus en attente:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

