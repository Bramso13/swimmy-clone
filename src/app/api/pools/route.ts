import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
  if (!ownerId) {
    return NextResponse.json({ error: "ownerId requis." }, { status: 400 });
  }
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
        rules,
        extras,
        additional,
        ownerId,
      },
    });
    return NextResponse.json({ pool });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
