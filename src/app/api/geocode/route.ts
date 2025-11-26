import { NextRequest, NextResponse } from "next/server";

const GEO_ENDPOINT = "https://api-adresse.data.gouv.fr/search/";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const incomingParams = url.searchParams;
    const q = incomingParams.get("q");
    if (!q || q.trim().length === 0) {
      return NextResponse.json({ error: "Paramètre q requis" }, { status: 400 });
    }

    const upstream = new URL(GEO_ENDPOINT);
    incomingParams.forEach((value, key) => {
      upstream.searchParams.append(key, value);
    });

    const res = await fetch(upstream.toString(), {
      headers: {
        "user-agent": "swimmy-clone/1.0 (+https://github.com/)",
        accept: "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      console.warn("Adresse API error:", res.status, text);
      return NextResponse.json({ error: "Adresse API indisponible" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur proxy géocodage:", error);
    return NextResponse.json({ error: "Erreur proxy géocodage" }, { status: 500 });
  }
}


