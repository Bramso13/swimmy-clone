import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { prisma } from "../../../../lib/prisma";
import { auth } from "../../../../lib/auth";
import { reactivateExpiredPools } from "../../../../lib/pool-availability";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeReservations = searchParams.get("includeReservations") === "true";
    const ownerId = searchParams.get("ownerId");

    // Auth seulement si on demande des infos sensibles (ownerId filtré ou réservations incluses)
    let sessionUserId: string | null = null;
    if (includeReservations || ownerId) {
      const session = await auth.api.getSession({ headers: req.headers });
      if (!session?.user) {
        return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
      }
      sessionUserId = session.user.id as string;

      // Si ownerId est différent de l'utilisateur courant, s'assurer qu'il a le rôle owner
      if (ownerId && ownerId !== sessionUserId) {
        const user = await prisma.user.findUnique({ where: { id: sessionUserId }, select: { role: true } });
        if (user?.role !== "owner") {
          return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
        }
      }
    }

    // Réactiver automatiquement les piscines dont les réservations sont expirées
    // On le fait en arrière-plan pour ne pas ralentir la réponse
    reactivateExpiredPools().catch((err: unknown) => {
      console.error("Erreur lors de la réactivation automatique des piscines:", err);
    });

    const pools = await prisma.pool.findMany({
      where: ownerId ? { ownerId } : undefined,
      include: {
        owner: true,
        ...(includeReservations && {
          reservations: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
            orderBy: { startDate: "desc" },
          },
          availabilityRequests: {
            include: { user: { select: { id: true, name: true, email: true } } },
            orderBy: { createdAt: "desc" },
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
    location,
  } = await req.json();
  // ownerId now optional; proceed without it
 
  //verifier si l'utilisateur est connecté
  try {
    // Récupérer l'utilisateur connecté via better-auth (si dispo)
    let finalOwnerId: string | null = null;
    let currentUserRole: string | null = null;
    try {
      const session = await auth.api.getSession({ headers: req.headers });
      finalOwnerId = (session?.user?.id as string | undefined) ?? null;
      if (session?.user?.id) {
        const u = await prisma.user.findUnique({ where: { id: session.user.id as string }, select: { role: true } });
        currentUserRole = u?.role ?? null;
      }
    } catch {}

    // Si le créateur est un tenant, on ne crée PAS la Pool. On crée une demande d'approbation.
    if (currentUserRole === "tenant") {
      const approval = await prisma.poolApprovalRequest.create({
        data: {
          requesterId: finalOwnerId,
          status: "pending",
          title,
          description,
          address,
          latitude,
          longitude,
          photos,
          pricePerHour,
          availability,
          rules,
          // On conserve aussi les extras (ex: equipments) dans le snapshot
          // en les sérialisant dans 'additional' si besoin
          // mais comme PoolApprovalRequest n'a pas 'extras', on peut les inclure dans 'additional'
          // sans casser le schéma existant
          // Note: si tu souhaites une colonne dédiée, on peut étendre le schéma
          // Ici on merge simplement
          // @ts-ignore
          additional: { ...(additional || {}), extras: extras || undefined, location: location || "OUTDOOR" },
        },
      });
      return NextResponse.json({ approval, message: "Votre annonce a été soumise et attend validation." }, { status: 202 });
    }

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
        rules,
        extras,
        additional,
        location: (location === "INDOOR" || location === "OUTDOOR") ? location : "OUTDOOR",
        // verified: false,
        ownerId: finalOwnerId || ownerId || null,
      },
    });
    return NextResponse.json({ pool });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
