"use server";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { auth } from "../../../../../lib/auth";

const SUCCESS_STATUSES = ["succeeded", "paid"];
const PENDING_RESERVATION_STATUSES = ["pending", "accepted"];
const PENDING_TRANSACTION_STATUSES = ["pending", "accepted"];

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const userId = session?.user?.id as string | undefined;

    if (!userId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const ninetyDaysAgo = new Date(now);
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 89);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const transactionWhere = {
      reservation: {
        is: {
          pool: {
            is: {
              ownerId: userId,
            },
          },
        },
      },
    };
    const reservationWhere = {
      pool: {
        is: {
          ownerId: userId,
        },
      },
    };

    const [currentMonth, rolling90Days, yearToDate, pendingReservations, pendingTransactions, lastPayout] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          ...transactionWhere,
          status: { in: SUCCESS_STATUSES },
          createdAt: { gte: startOfMonth, lt: startOfNextMonth },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          ...transactionWhere,
          status: { in: SUCCESS_STATUSES },
          createdAt: { gte: ninetyDaysAgo },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          ...transactionWhere,
          status: { in: SUCCESS_STATUSES },
          createdAt: { gte: startOfYear },
        },
        _sum: { amount: true },
      }),
      prisma.reservation.aggregate({
        where: {
          ...reservationWhere,
          status: { in: PENDING_RESERVATION_STATUSES },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          ...transactionWhere,
          status: { in: PENDING_TRANSACTION_STATUSES },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.findFirst({
        where: {
          ...transactionWhere,
          status: { in: SUCCESS_STATUSES },
        },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
    ]);

    return NextResponse.json({
      revenue: {
        currentMonth: currentMonth._sum.amount ?? 0,
        rolling90Days: rolling90Days._sum.amount ?? 0,
        yearToDate: yearToDate._sum.amount ?? 0,
        pending: (pendingReservations._sum.amount ?? 0) + (pendingTransactions._sum.amount ?? 0),
        lastPayoutAt: lastPayout?.createdAt ?? null,
      },
    });
  } catch (error) {
    console.error("Erreur récupération revenue dashboard:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}


