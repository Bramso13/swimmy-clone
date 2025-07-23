import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const event = await req.json();
  // Exemple : { TransactionId, Status, EventType }
  if (!event.TransactionId || !event.Status) {
    return NextResponse.json({ error: "Payload invalide." }, { status: 400 });
  }
  try {
    // On met à jour la transaction
    await prisma.transaction.update({
      where: { id: event.TransactionId },
      data: { status: event.Status },
    });
    return NextResponse.json({ message: "OK" });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
