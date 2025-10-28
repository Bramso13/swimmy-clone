import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { auth } from "../../../../../lib/auth";

// Lister les demandes d'approbation pour un owner (par défaut: connecté)
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const scope = searchParams.get("scope"); // "mine" | "all"
    const status = searchParams.get("status"); // optionnel: pending | approved | rejected

    // Rôle de l'utilisateur
    const current = await prisma.user.findUnique({
      where: { id: session.user.id as string },
      select: { role: true },
    });

    if (scope === "all") {
      // Accessible aux owners: voir toutes les demandes (par défaut pending)
      if (current?.role !== "owner") {
        return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
      }
      const where: any = {};
      if (status) where.status = status;
      else where.status = "pending";
      const requests = await prisma.poolApprovalRequest.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ requests });
    }

    // Par défaut: retourner seulement les demandes de l'utilisateur courant (tous statuts)
    const whereMine: any = { requesterId: session.user.id as string };
    if (status) whereMine.status = status;
    const requests = await prisma.poolApprovalRequest.findMany({
      where: whereMine,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ requests });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}


