import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { auth } from "../../../../../lib/auth";

// Récupérer la piscine pour édition (limitée au propriétaire)
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const pool = await prisma.pool.findUnique({ where: { id: params.id } });
    if (!pool) {
      return NextResponse.json({ error: "Piscine introuvable" }, { status: 404 });
    }

    if ((pool as any).ownerId !== session.user.id) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    return NextResponse.json({ pool });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}

// Mettre à jour partiellement une piscine
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const poolId = params.id;
    const body = await req.json();

    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Vérifier que l'utilisateur est le propriétaire de la piscine
    const pool = await prisma.pool.findUnique({ where: { id: poolId }, select: { ownerId: true } });
    if (!pool) {
      return NextResponse.json({ error: "Piscine introuvable" }, { status: 404 });
    }
    if (pool.ownerId !== (session.user.id as string)) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    const {
      title,
      description,
      address,
      pricePerHour,
      isAvailable,
      rules,
      extras,
      location,
    } = body as {
      title?: string;
      description?: string;
      address?: string;
      pricePerHour?: number;
      isAvailable?: boolean;
      rules?: string[];
      extras?: any;
      location?: "INDOOR" | "OUTDOOR";
    };

    const data: any = {};
    if (typeof title === "string" && title.trim().length > 0) data.title = title.trim();
    if (typeof description === "string") data.description = description;
    if (typeof address === "string") data.address = address;
    if (typeof pricePerHour === "number" && !Number.isNaN(pricePerHour)) data.pricePerHour = pricePerHour;
    if (typeof isAvailable === "boolean") data.isAvailable = isAvailable;
    if (Array.isArray(rules)) data.rules = rules;
    if (extras && typeof extras === "object") data.extras = extras;
    if (location === "INDOOR" || location === "OUTDOOR") data.location = location;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Aucune donnée à mettre à jour" }, { status: 400 });
    }

    const updated = await prisma.pool.update({
      where: { id: poolId },
      data,
    });

    return NextResponse.json({ pool: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}


