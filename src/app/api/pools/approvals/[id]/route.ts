import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";
import { auth } from "../../../../../../lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const body = await req.json();
    const status = body?.status as string;
    if (!status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }

    const reqRow = await prisma.poolApprovalRequest.findUnique({ where: { id: params.id } });
    if (!reqRow) return NextResponse.json({ error: "Demande introuvable" }, { status: 404 });

    if (status === "approved") {
      // Créer la Pool depuis le snapshot
      const pool = await prisma.pool.create({
        data: {
          title: reqRow.title ?? "",
          description: reqRow.description ?? "",
          address: reqRow.address ?? "",
          latitude: reqRow.latitude ?? 0,
          longitude: reqRow.longitude ?? 0,
          photos: reqRow.photos,
          pricePerHour: reqRow.pricePerHour ?? 0,
          availability: reqRow.availability ?? {},
          rules: reqRow.rules,
          additional: reqRow.additional,
          ownerId: session.user.id as string,
          approved: true,
        },
      });

      const updated = await prisma.poolApprovalRequest.update({
        where: { id: params.id },
        data: { status: "approved", poolId: pool.id },
      });
      return NextResponse.json({ request: updated, pool });
    }

    const rejected = await prisma.poolApprovalRequest.update({
      where: { id: params.id },
      data: { status: "rejected" },
    });
    return NextResponse.json({ request: rejected });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}


