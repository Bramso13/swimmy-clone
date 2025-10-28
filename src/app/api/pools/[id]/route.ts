import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { auth } from "../../../../../lib/auth";

// Mettre à jour partiellement une piscine (ex: disponibilité)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const poolId = params.id;
    const body = await req.json();
    const { isAvailable } = body as { isAvailable?: boolean };

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

    const updated = await prisma.pool.update({
      where: { id: poolId },
      data: {
        ...(typeof isAvailable === "boolean" ? { isAvailable } : {}),
      },
    });

    return NextResponse.json({ pool: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}


