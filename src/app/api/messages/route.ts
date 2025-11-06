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

// Lister les conversations (utilisateurs avec qui on a échangé)
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const userId = session.user.id as string;

    // Récupérer tous les messages (envoyés et reçus)
    const allMessages = await (prisma as any).message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { recipientId: userId },
        ],
      },
      orderBy: { createdAt: "desc" },
      include: {
        sender: { select: { id: true, name: true, email: true, image: true, avatarUrl: true } },
        recipient: { select: { id: true, name: true, email: true, image: true, avatarUrl: true } },
      },
    });

    // Grouper par conversation (l'autre utilisateur)
    const conversationsMap = new Map<string, any>();
    
    for (const msg of allMessages) {
      const otherUserId = msg.senderId === userId ? msg.recipientId : msg.senderId;
      const otherUser = msg.senderId === userId ? msg.recipient : msg.sender;
      
      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          userId: otherUserId,
          user: otherUser,
          lastMessage: msg,
          unreadCount: 0, // TODO: implémenter le comptage des non lus
        });
      } else {
        const conv = conversationsMap.get(otherUserId);
        // Mettre à jour le dernier message si plus récent
        if (new Date(msg.createdAt) > new Date(conv.lastMessage.createdAt)) {
          conv.lastMessage = msg;
        }
      }
    }

    const conversations = Array.from(conversationsMap.values()).sort((a, b) => 
      new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
    );

    return NextResponse.json({ conversations });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}


