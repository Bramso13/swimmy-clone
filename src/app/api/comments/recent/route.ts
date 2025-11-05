import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const limitParam = req.nextUrl.searchParams.get("limit");
    const limit = Math.min(20, Math.max(1, Number(limitParam) || 10));

    const comments = await (prisma as any).comment.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        author: { select: { id: true, name: true, email: true, image: true } },
        pool: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json({ comments });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}


