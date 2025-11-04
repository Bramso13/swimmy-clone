import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { auth } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

// Lister les commentaires d'une piscine
export async function GET(req: NextRequest) {
  try {
    const poolId = req.nextUrl.searchParams.get("poolId");
    if (!poolId) {
      return NextResponse.json({ error: "poolId requis" }, { status: 400 });
    }

    const comments = await (prisma as any).comment.findMany({
      where: { poolId },
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, name: true, email: true, image: true } },
      },
    });
    return NextResponse.json({ comments });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}

// Créer un commentaire pour une piscine (réservations acceptées uniquement)
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const { poolId, reservationId, content } = await req.json();
    if (!poolId || !content) {
      return NextResponse.json({ error: "poolId et content requis" }, { status: 400 });
    }

    // Autorisation: réservation acceptée/payée OU demande de dispo approuvée
    let allowed = false;
    if (reservationId) {
      const res = await (prisma as any).reservation.findFirst({ where: { id: reservationId, status: { in: ["accepted", "paid"] } } });
      if (res) allowed = true;
    }
    if (!allowed) {
      const ar = await (prisma as any).availabilityRequest.findFirst({
        where: { poolId, userId: session.user.id as string, status: "approved" },
      });
      if (ar) allowed = true;
    }
    if (!allowed) {
      return NextResponse.json({ error: "Autorisation requise: réservation acceptée ou demande approuvée" }, { status: 403 });
    }

    const created = await (prisma as any).comment.create({
      data: {
        content,
        poolId,
        reservationId: reservationId || null,
        authorId: session.user.id as string,
      },
      include: { author: { select: { id: true, name: true, email: true, image: true } } },
    });

    return NextResponse.json({ comment: created, message: "Commentaire publié" }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}


