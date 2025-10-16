import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { prisma } from "../../../../lib/prisma";
import { auth } from "../../../../lib/auth";

export async function GET(req: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const includeReservations = searchParams.get("includeReservations") === "true";
    const ownerId = searchParams.get("ownerId");

    // Si ownerId est spécifié, vérifier que c'est l'utilisateur connecté ou qu'il est owner
    if (ownerId && ownerId !== session.user.id) {
      // Vérifier si l'utilisateur est owner pour voir les piscines d'autres propriétaires
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true }
      });
      if (user?.role !== "owner") {
        return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
      }
    }

    const pools = await prisma.pool.findMany({
      where: ownerId ? { ownerId } : undefined,
      include: {
        owner: true,
        ...(includeReservations && {
          reservations: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: {
              startDate: "desc",
            },
          },
        }),
      },
    });

    return NextResponse.json({ pools });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const {
    title,
    description,
    address,
    latitude,
    longitude,
    photos,
    pricePerHour,
    availability,
    rules,
    extras,
    additional,
    ownerId,
  } = await req.json();
  // ownerId now optional; proceed without it
 
  //verifier si l'utilisateur est connecté
  try {
    // Récupérer l'utilisateur connecté via better-auth (si dispo)
    let finalOwnerId: string | null = null;
    try {
      const session = await auth.api.getSession({ headers: req.headers });
      finalOwnerId = (session?.user?.id as string | undefined) ?? null;
    } catch {}

    const pool = await prisma.pool.create({
      data: {
        title,
        description,
        address,
        latitude,
        longitude,
        photos,
        pricePerHour,
        availability,
        // rules,
        // extras,
        // additional,
        // verified: false,
        ownerId: finalOwnerId || ownerId || null,
      },
    });
    return NextResponse.json({ pool });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
