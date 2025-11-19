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
      // Extraire les champs additionnels (ex: extras, location) stockés dans 'additional'
      let extrasFromRequest: any = undefined;
      let locationFromRequest: any = undefined;
      try {
        const add = (reqRow as any)?.additional ?? null;
        if (add && typeof add === "object") {
          extrasFromRequest = (add as any).extras ?? undefined;
          locationFromRequest = (add as any).location ?? undefined;
        }
      } catch {}

      // Créer la Pool depuis le snapshot en re-projetant les extras/locations
      // Le ownerId doit être le requesterId (le tenant qui a créé la demande), pas l'owner qui approuve
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
          extras: extrasFromRequest, // restitue les équipements
          location: locationFromRequest === "INDOOR" || locationFromRequest === "OUTDOOR" ? locationFromRequest : undefined,
          ownerId: reqRow.requesterId ?? session.user.id as string, // Utiliser le requesterId (créateur) comme ownerId
          approved: true, // La piscine est approuvée pour être visible dans les recherches
          // NOTE: Les réservations sur cette piscine resteront en "pending" jusqu'à acceptation manuelle par le propriétaire
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


