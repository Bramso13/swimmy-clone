import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { auth } from "../../../../lib/auth";

// Récupérer les favoris d'un utilisateur
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      include: {
        pool: {
          select: {
            id: true,
            title: true,
            description: true,
            address: true,
            photos: true,
            pricePerHour: true,
            latitude: true,
            longitude: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ favorites });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}

// Ajouter un favori
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { poolId } = await req.json();
    if (!poolId) {
      return NextResponse.json({ error: "poolId manquant" }, { status: 400 });
    }

    // Vérifier que la piscine existe
    const pool = await prisma.pool.findUnique({
      where: { id: poolId },
    });
    if (!pool) {
      return NextResponse.json({ error: "Piscine introuvable" }, { status: 404 });
    }

    // Créer le favori (ou ignorer si existe déjà grâce à la contrainte unique)
    const favorite = await prisma.favorite.upsert({
      where: {
        userId_poolId: {
          userId: session.user.id,
          poolId,
        },
      },
      update: {},
      create: {
        userId: session.user.id,
        poolId,
      },
    });

    return NextResponse.json({ favorite }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}

// Supprimer un favori
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const poolId = searchParams.get("poolId");

    if (!poolId) {
      return NextResponse.json({ error: "poolId manquant" }, { status: 400 });
    }

    await prisma.favorite.deleteMany({
      where: {
        userId: session.user.id,
        poolId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}

