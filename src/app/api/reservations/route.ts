import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
    const reservation = await prisma.reservation.create({
      data: {
        poolId,
        userId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        amount,
        status: "pending",
      },
    });
    return NextResponse.json({ reservation });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
