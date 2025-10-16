import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { auth } from "../../../../lib/auth";

// Envoyer un message
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const { recipientId, content, availabilityRequestId } = await req.json();
    if (!recipientId || !content) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    const msg = await prisma.message.create({
      data: {
        senderId: session.user.id as string,
        recipientId,
        content,
        availabilityRequestId: availabilityRequestId || null,
      },
    });
    return NextResponse.json({ message: msg }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}

// Lister les messages reçus par l'utilisateur connecté
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const messages = await (prisma as any).message.findMany({
      where: { recipientId: session.user.id as string },
      orderBy: { createdAt: "desc" },
      include: { sender: { select: { id: true, name: true, email: true } } },
    });
    return NextResponse.json({ messages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}


