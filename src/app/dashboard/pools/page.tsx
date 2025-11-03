"use client";

import React, { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import PoolCard, { type Pool as PoolCardType } from "@/components/PoolCard";

type PoolItem = PoolCardType & { address?: string };

const PoolsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pools, setPools] = useState<PoolItem[]>([]);
  const [rented, setRented] = useState<Array<{ id: string; title: string; renter: string }>>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const session = await authClient.getSession();
        const userId = session.data?.user?.id as string | undefined;
        if (!userId) {
          setPools([]);
          setLoading(false);
          return;
        }
        const res = await fetch(`/api/pools?ownerId=${encodeURIComponent(userId)}&includeReservations=true`, { cache: "no-store" });
        if (!res.ok) throw new Error("Impossible de charger vos piscines");
        const data = await res.json();
        const all: any[] = data.pools || [];
        const rentedNow: Array<{ id: string; title: string; renter: string }> = [];
        const available: PoolItem[] = [];
        for (const p of all) {
          const accepted = (p.reservations || []).find((r: any) => r.status === 'accepted' || r.status === 'paid');
          const approvedReq = (p.availabilityRequests || []).find((ar: any) => ar.status === 'approved');
          if (accepted || approvedReq || p.isAvailable === false) {
            const who = (accepted?.user?.name || accepted?.user?.email) || (approvedReq?.user?.name || approvedReq?.user?.email) || 'Client';
            rentedNow.push({ id: p.id, title: p.title, renter: who });
            continue;
          }
          available.push({
            id: p.id,
            title: p.title,
            photos: p.photos || [],
            pricePerHour: p.pricePerHour,
            address: p.address,
          });
        }
        setPools(available);
        setRented(rentedNow);
      } catch (e: any) {
        setError(e.message || "Erreur réseau");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <main className="max-w-6xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mes piscines</h1>
        <a
          href="/dashboard/pools/new"
          className="text-white px-4 py-2 rounded"
          style={{backgroundColor: '#0094ec'}}
          onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#0078c4'}
          onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#0094ec'}
        >
          Ajouter une piscine
        </a>
      </div>

      {loading ? (
        <div className="rounded border bg-white p-6 text-center text-gray-500">Chargement...</div>
      ) : error ? (
        <div className="rounded border bg-white p-6 text-center text-red-600">{error}</div>
      ) : pools.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
          <div className="text-xl font-semibold mb-2">Aucune piscine</div>
          <p className="text-gray-600 mb-4">Vous n'avez pas encore ajouté de piscine.</p>
          <a
            href="/dashboard/pools/new"
            className="inline-block text-white px-4 py-2 rounded"
            style={{backgroundColor: '#0094ec'}}
            onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#0078c4'}
            onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#0094ec'}
          >
            Ajouter ma première piscine
          </a>
        </div>
      ) : (
        <div>
          {rented.length > 0 && (
            <div className="mb-6 rounded-lg border bg-white p-4">
              <div className="font-semibold mb-2">Actuellement louées</div>
              <ul className="space-y-1 text-sm text-gray-700">
                {rented.map((r) => (
                  <li key={r.id}>• {r.title} — louée par {r.renter}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pools.map((pool) => (
              <PoolCard key={pool.id} pool={pool} />
            ))}
          </div>
        </div>
      )}
    </main>
  );
};

export default PoolsPage;
