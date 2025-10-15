import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  const pools = await prisma.pool.findMany({ include: { owner: true } });
  return NextResponse.json({ pools });
}

export async function POST(req: NextRequest) {
  const {
    title,
    description,
    address,
    latitude,
    longitude,
    photos,
    pricePerHour,
    availability,
    rules,
    extras,
    additional,
    ownerId,
  } = await req.json();
  // ownerId now optional; proceed without it

  //verifier si l'utilisateur est connecté
  try {
    const pool = await prisma.pool.create({
      data: {
        title,
        description,
        address,
        latitude,
        longitude,
        photos,
        pricePerHour,
        availability,
        // rules,
        // extras,
        // additional,
        // verified: false,
        ownerId: ownerId || null,
      },
    });
    return NextResponse.json({ pool });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
