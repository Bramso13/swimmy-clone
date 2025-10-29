import React from "react";
import PoolCard from "@/components/PoolCard";

async function getPools() {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  const res = await fetch(`${base}/api/pools`, { cache: "no-store" });
  const j = await res.json();
  return j.pools ?? [];
}

export default async function SearchPage() {
  const pools = await getPools();
  return (
    <main className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">Toutes les piscines</h1>
      <p className="text-gray-600 mb-4">{pools.length} résultat{pools.length > 1 ? 's' : ''}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {pools.map((p: any) => (
          <PoolCard key={p.id} pool={p} />
        ))}
      </div>
    </main>
  );
}


