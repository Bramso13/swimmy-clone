import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { auth } from "../../../../../lib/auth";

// Vérifier si une piscine est dans les favoris
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ isFavorite: false });
    }

    const { searchParams } = new URL(req.url);
    const poolId = searchParams.get("poolId");

    if (!poolId) {
      return NextResponse.json({ error: "poolId manquant" }, { status: 400 });
    }

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_poolId: {
          userId: session.user.id,
          poolId,
        },
      },
    });

    return NextResponse.json({ isFavorite: !!favorite });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}

