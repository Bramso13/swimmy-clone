import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";
import { auth } from "../../../../../../lib/auth";

// Mettre à jour le statut: approved / rejected
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Vérifier l'authentification
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    const status = body?.status as string;
    if (!status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }

    // Vérifier que l'utilisateur est owner
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== "owner") {
      return NextResponse.json({ error: "Accès non autorisé. Réservé aux propriétaires." }, { status: 403 });
    }

    // Vérifier que la demande appartient à une piscine de cet owner
    const request = await prisma.availabilityRequest.findUnique({
      where: { id: params.id },
      include: {
        pool: {
          select: { ownerId: true }
        }
      }
    });

    if (!request) {
      return NextResponse.json({ error: "Demande introuvable" }, { status: 404 });
    }

    if (request.pool.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Accès non autorisé à cette demande" }, { status: 403 });
    }

    const updated = await prisma.availabilityRequest.update({
      where: { id: params.id },
      data: { status },
    });

    // Envoyer un message au demandeur si présent
    if (request.userId) {
      await (prisma as any).message.create({
        data: {
          senderId: session.user.id as string,
          recipientId: request.userId,
          content: (body?.message as string) || (status === "approved" ? "Votre demande est acceptée." : "Votre demande est refusée."),
          availabilityRequestId: request.id,
        },
      });
    }

    return NextResponse.json({ request: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}


