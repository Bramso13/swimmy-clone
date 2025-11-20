import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { checkAndReactivatePool } from "../../../../lib/pool-availability";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  let reservations;
  if (userId) {
    reservations = await prisma.reservation.findMany({
      where: { userId },
      include: { pool: true, transaction: true },
    });
  } else {
    reservations = await prisma.reservation.findMany({
      include: { pool: true, transaction: true },
    });
  }
  return NextResponse.json({ reservations });
}

export async function POST(req: NextRequest) {
  const { poolId, userId, startDate, endDate, amount } = await req.json();
  if (!poolId || !userId || !startDate || !endDate || !amount) {
    return NextResponse.json(
      { error: "Champs requis manquants." },
      { status: 400 }
    );
  }
  try {
    // IMPORTANT: Toutes les réservations sont créées avec le statut "pending"
    // Le propriétaire de la piscine doit les accepter manuellement
    // même si la demande d'annonce a été approuvée et que la piscine existe
    const reservation = await prisma.reservation.create({
      data: {
        poolId,
        userId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        amount,
        status: "pending", // Toujours "pending" jusqu'à acceptation manuelle par le propriétaire
      },
      include: {
        pool: {
          select: {
            title: true,
            ownerId: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Envoyer un message au propriétaire pour l'informer de la demande de réservation
    if (reservation.pool.ownerId && reservation.pool.ownerId !== userId) {
      try {
        const startDateFormatted = new Date(startDate).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        const endDateFormatted = new Date(endDate).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        await prisma.message.create({
          data: {
            senderId: userId,
            recipientId: reservation.pool.ownerId,
            content: `Nouvelle demande de réservation pour "${reservation.pool.title}"\n\nDu ${startDateFormatted} au ${endDateFormatted}\nMontant: ${amount} €\n\nVeuillez accepter ou refuser cette demande dans votre tableau de bord.`,
          },
        });
      } catch (msgError) {
        console.error("Erreur lors de l'envoi du message au propriétaire:", msgError);
        // Ne pas bloquer la création de la réservation si le message échoue
      }
    }

    return NextResponse.json({ reservation });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// Mise à jour du statut d'une réservation
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body?.id as string | undefined;
    const status = body?.status as string | undefined;

    if (!id || !status) {
      return NextResponse.json({ error: "id et status sont requis" }, { status: 400 });
    }

    const allowed = ["pending", "accepted", "rejected", "paid", "cancelled", "refused"];
    if (!allowed.includes(status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }

    const updated = await prisma.reservation.update({
      where: { id },
      data: { status },
      include: { 
        pool: {
          select: {
            id: true,
            title: true,
            ownerId: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        transaction: true,
      },
    });

    // Mettre à jour la disponibilité de la piscine selon le statut
    try {
      if (updated?.poolId) {
        if (["accepted", "paid"].includes(status)) {
          // Marquer comme indisponible si la réservation est acceptée ou payée
          await prisma.pool.update({ where: { id: updated.poolId }, data: { isAvailable: false } });
        } else if (["cancelled", "refused", "rejected"].includes(status)) {
          // Si la réservation est annulée/refusée, vérifier et réactiver si nécessaire
          await checkAndReactivatePool(updated.poolId);
        }
        // Vérifier et réactiver automatiquement si toutes les réservations sont expirées
        // (même si le statut n'a pas changé, on vérifie pour les cas où la date est passée)
        await checkAndReactivatePool(updated.poolId);
      }
    } catch {}

    // Si la réservation est acceptée, envoyer un message au locataire avec un lien de paiement
    if (status === "accepted" && updated.user && updated.pool.ownerId) {
      try {
        const startDateFormatted = new Date(updated.startDate).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        const endDateFormatted = new Date(updated.endDate).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        // Construire l'URL de paiement
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000';
        const paymentUrl = `${baseUrl}/payment/${updated.id}`;
        
        await prisma.message.create({
          data: {
            senderId: updated.pool.ownerId,
            recipientId: updated.user.id,
            content: `Votre demande de réservation pour "${updated.pool.title}" a été acceptée !\n\nDu ${startDateFormatted} au ${endDateFormatted}\nMontant: ${updated.amount} €\n\nCliquez sur le bouton ci-dessous ou utilisez ce lien pour procéder au paiement :\n${paymentUrl}\n\nRESERVATION_ID:${updated.id}`,
          },
        });
      } catch (msgError) {
        console.error("Erreur lors de l'envoi du message au locataire:", msgError);
        // Ne pas bloquer la mise à jour de la réservation si le message échoue
      }
    }

    return NextResponse.json({ reservation: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}