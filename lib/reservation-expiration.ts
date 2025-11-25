"use server";

import { prisma } from "./prisma";
import { checkAndReactivatePool } from "./pool-availability";

const ACCEPTED_STATUS = "accepted";
const EXPIRED_STATUS = "rejected";
const CANCELLED_TRANSACTION_STATUS = "refused";

/**
 * Rejette automatiquement les réservations acceptées
 * dont la demande de paiement a plus de `expiryHours`.
 */
export async function rejectExpiredPaymentRequests(expiryHours = 24) {
  const threshold = new Date(Date.now() - expiryHours * 60 * 60 * 1000);

  const expiredReservations = await prisma.reservation.findMany({
    where: {
      status: ACCEPTED_STATUS,
      updatedAt: { lt: threshold },
    },
    select: {
      id: true,
      poolId: true,
      transaction: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!expiredReservations.length) {
    return { processed: 0 };
  }

  for (const reservation of expiredReservations) {
    await prisma.reservation.update({
      where: { id: reservation.id },
      data: { status: EXPIRED_STATUS },
    });

    if (reservation.transaction?.id) {
      await prisma.transaction.update({
        where: { id: reservation.transaction.id },
        data: { status: CANCELLED_TRANSACTION_STATUS },
      });
    }

    if (reservation.poolId) {
      await checkAndReactivatePool(reservation.poolId);
    }
  }

  return { processed: expiredReservations.length };
}

