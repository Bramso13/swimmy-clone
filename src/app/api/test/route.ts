import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  const annonces = await prisma.annonce.findFirst({
    where: {
      id: "1",
    },
  });
  if (!annonces) {
    return NextResponse.json(
      { error: "Aucune annonce trouvée" },
      { status: 404 }
    );
  }
  return NextResponse.json({ annonces });
}
