import { prisma } from "./prisma";

/**
 * Réactive automatiquement les piscines dont toutes les réservations sont expirées
 * Cette fonction vérifie toutes les piscines marquées comme indisponibles
 * et les réactive si aucune réservation active n'existe
 */
export async function reactivateExpiredPools() {
  try {
    const now = new Date();

    // Trouver toutes les piscines marquées comme indisponibles
    const unavailablePools = await prisma.pool.findMany({
      where: { isAvailable: false },
      include: {
        reservations: {
          where: {
            status: {
              in: ["accepted", "paid"],
            },
          },
        },
        availabilityRequests: {
          where: {
            status: "approved",
          },
        },
      },
    });

    const poolsToReactivate: string[] = [];

    for (const pool of unavailablePools) {
      // Vérifier s'il y a des réservations actives (date de fin dans le futur)
      const hasActiveReservation = pool.reservations.some((reservation) => {
        const endDate = new Date(reservation.endDate);
        return endDate >= now;
      });

      // Vérifier s'il y a des demandes de disponibilité approuvées actives
      // (une demande est considérée comme active si la date est dans le futur)
      const hasActiveAvailabilityRequest = pool.availabilityRequests.some((request) => {
        const requestDate = new Date(request.date);
        // Ajouter l'heure de fin à la date pour vérifier si c'est passé
        const [hours, minutes] = request.endTime.split(":").map(Number);
        const endDateTime = new Date(requestDate);
        endDateTime.setHours(hours, minutes, 0, 0);
        return endDateTime >= now;
      });

      // Si aucune réservation active n'existe, réactiver la piscine
      if (!hasActiveReservation && !hasActiveAvailabilityRequest) {
        poolsToReactivate.push(pool.id);
      }
    }

    // Réactiver toutes les piscines sans réservations actives
    if (poolsToReactivate.length > 0) {
      await prisma.pool.updateMany({
        where: { id: { in: poolsToReactivate } },
        data: { isAvailable: true },
      });
    }

    return {
      reactivated: poolsToReactivate.length,
      poolIds: poolsToReactivate,
    };
  } catch (error) {
    console.error("Erreur lors de la réactivation automatique des piscines:", error);
    throw error;
  }
}

/**
 * Vérifie et réactive une piscine spécifique si ses réservations sont expirées
 */
export async function checkAndReactivatePool(poolId: string) {
  try {
    const now = new Date();

    const pool = await prisma.pool.findUnique({
      where: { id: poolId },
      include: {
        reservations: {
          where: {
            status: {
              in: ["accepted", "paid"],
            },
          },
        },
        availabilityRequests: {
          where: {
            status: "approved",
          },
        },
      },
    });

    if (!pool || pool.isAvailable) {
      return { reactivated: false };
    }

    // Vérifier s'il y a des réservations actives
    const hasActiveReservation = pool.reservations.some((reservation) => {
      const endDate = new Date(reservation.endDate);
      return endDate >= now;
    });

    // Vérifier s'il y a des demandes de disponibilité approuvées actives
    const hasActiveAvailabilityRequest = pool.availabilityRequests.some((request) => {
      const requestDate = new Date(request.date);
      const [hours, minutes] = request.endTime.split(":").map(Number);
      const endDateTime = new Date(requestDate);
      endDateTime.setHours(hours, minutes, 0, 0);
      return endDateTime >= now;
    });

    // Si aucune réservation active n'existe, réactiver la piscine
    if (!hasActiveReservation && !hasActiveAvailabilityRequest) {
      await prisma.pool.update({
        where: { id: poolId },
        data: { isAvailable: true },
      });
      return { reactivated: true };
    }

    return { reactivated: false };
  } catch (error) {
    console.error(`Erreur lors de la vérification de la piscine ${poolId}:`, error);
    throw error;
  }
}

