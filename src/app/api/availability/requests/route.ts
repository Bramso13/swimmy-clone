import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { auth } from "../../../../../lib/auth";

// Créer une demande de disponibilité
export async function POST(req: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { poolId, date, startTime, endTime, adults, children, babies } = await req.json();
    if (!poolId || !date || !startTime || !endTime) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    // Vérifier que la piscine existe
    const pool = await prisma.pool.findUnique({
      where: { id: poolId },
      select: { id: true, title: true }
    });
    if (!pool) {
      return NextResponse.json({ error: "Piscine introuvable" }, { status: 404 });
    }

    const created = await prisma.availabilityRequest.create({
      data: {
        poolId,
        userId: session.user.id, // Utiliser l'utilisateur connecté
        date: new Date(date),
        startTime,
        endTime,
        adults: Number(adults ?? 1),
        children: Number(children ?? 0),
        babies: Number(babies ?? 0),
      },
    });

    return NextResponse.json({ request: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}

// Lister les demandes pour les piscines d'un owner
export async function GET(req: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const ownerId = searchParams.get("ownerId");
    const mine = searchParams.get("mine") === "true"; // retourner mes propres demandes

    // Si on demande "mine=true", on renvoie les demandes soumises par l'utilisateur connecté
    if (mine) {
      const requests = await prisma.availabilityRequest.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        include: {
          pool: { select: { id: true, title: true, ownerId: true, address: true } },
          user: { select: { id: true, name: true, email: true } },
        },
      });
      return NextResponse.json({ requests });
    }

    // Sinon, on liste les demandes reçues par un propriétaire (pending)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== "owner") {
      return NextResponse.json({ error: "Accès non autorisé. Réservé aux propriétaires." }, { status: 403 });
    }

    // Si ownerId est spécifié, vérifier que c'est l'utilisateur connecté
    if (ownerId && ownerId !== session.user.id) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    const where = ownerId
      ? { pool: { ownerId }, status: "pending" }
      : { pool: { ownerId: session.user.id }, status: "pending" };

    const requests = await prisma.availabilityRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        pool: {
          select: { id: true, title: true, ownerId: true, address: true },
        },
        user: { select: { id: true, name: true, email: true } },
      },
    });
    return NextResponse.json({ requests });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}


