"use server";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";
import { auth } from "../../../../../../lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const userId = session?.user?.id as string | undefined;

    if (!userId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const pools = await prisma.pool.findMany({
      where: { ownerId: userId },
      select: {
        id: true,
        title: true,
        reservations: {
          where: { status: "paid" },
          select: { amount: true },
        },
      },
    });

    const formatted = pools.map((pool) => ({
      id: pool.id,
      title: pool.title,
      totalRevenue: pool.reservations.reduce((sum, r) => sum + (r.amount || 0), 0),
    }));

    return NextResponse.json({ pools: formatted });
  } catch (error) {
    console.error("Erreur revenue pools:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}


