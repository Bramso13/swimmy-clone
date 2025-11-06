import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { auth } from "../../../../../lib/auth";

// Récupérer les messages d'une conversation spécifique
export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const currentUserId = session.user.id as string;
    const otherUserId = params.userId;

    // Récupérer tous les messages entre les deux utilisateurs
    const messages = await (prisma as any).message.findMany({
      where: {
        OR: [
          { senderId: currentUserId, recipientId: otherUserId },
          { senderId: otherUserId, recipientId: currentUserId },
        ],
      },
      orderBy: { createdAt: "asc" },
      include: {
        sender: { select: { id: true, name: true, email: true, image: true, avatarUrl: true } },
        recipient: { select: { id: true, name: true, email: true, image: true, avatarUrl: true } },
      },
    });

    return NextResponse.json({ messages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}

