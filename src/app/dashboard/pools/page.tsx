"use client";

import React, { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import PoolCard, { type Pool as PoolCardType } from "@/components/PoolCard";

type PoolItem = PoolCardType & {
  address?: string;
  isRented?: boolean;
  renterName?: string | null;
};

type ApprovalItem = {
  id: string;
  title: string;
  status: string;
  address?: string | null;
  createdAt?: string;
};

const PoolsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pools, setPools] = useState<PoolItem[]>([]);
  const [rented, setRented] = useState<Array<{ id: string; title: string; renter: string }>>([]);
  const [approvalRequests, setApprovalRequests] = useState<ApprovalItem[]>([]);

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
        const allItems: PoolItem[] = [];
        for (const p of all) {
          const accepted = (p.reservations || []).find((r: any) => r.status === 'accepted' || r.status === 'paid');
          const approvedReq = (p.availabilityRequests || []).find((ar: any) => ar.status === 'approved');
          const renterName = (accepted?.user?.name || accepted?.user?.email) || (approvedReq?.user?.name || approvedReq?.user?.email) || null;
          const isRented = Boolean(accepted || approvedReq || p.isAvailable === false);
          if (isRented && renterName) {
            rentedNow.push({ id: p.id, title: p.title, renter: renterName });
          }
          allItems.push({
            id: p.id,
            title: p.title,
            photos: p.photos || [],
            pricePerHour: p.pricePerHour,
            address: p.address,
            isRented,
            renterName,
          });
        }
        setPools(allItems);
        setRented(rentedNow);

        // Récupérer également les piscines en attente (demandes d'approbation)
        try {
          const approvalsRes = await fetch(`/api/pools/approvals`, { cache: "no-store" });
          if (approvalsRes.ok) {
            const approvalsData = await approvalsRes.json();
            const mapped: ApprovalItem[] = Array.isArray(approvalsData?.requests)
              ? approvalsData.requests.map((req: any) => ({
                  id: req.id,
                  title: req.title || "Piscine sans titre",
                  status: req.status || "pending",
                  address: req.address || null,
                  createdAt: req.createdAt || undefined,
                }))
              : [];
            setApprovalRequests(mapped);
          } else if (approvalsRes.status === 401) {
            setApprovalRequests([]);
          }
        } catch (approvalsError) {
          console.error("Erreur lors du chargement des demandes d'approbation", approvalsError);
        }
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
          {approvalRequests.length > 0 && (
            <section className="mb-8 rounded-xl border bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-lg font-semibold">Piscines en cours de validation</h2>
                  <p className="text-sm text-gray-600">Ces annonces sont encore en attente d'approbation par l'équipe Swimmy.</p>
                </div>
              </div>
              <div className="space-y-3">
                {approvalRequests.map((req) => (
                  <div key={req.id} className="rounded-lg border border-dashed px-3 py-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="font-medium text-gray-900">{req.title}</div>
                        {req.address && <div className="text-sm text-gray-600">{req.address}</div>}
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                          req.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : req.status === "approved"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {req.status === "pending"
                          ? "En attente"
                          : req.status === "approved"
                          ? "Validée"
                          : "Refusée"}
                      </span>
                    </div>
                    {req.createdAt && (
                      <div className="mt-1 text-xs text-gray-500">
                        Soumise le {new Date(req.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
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
              <div key={pool.id} className="space-y-2">
                <PoolCard pool={pool} />
                {pool.isRented && (
                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
                    Actuellement indisponible
                    {pool.renterName ? ` — louée par ${pool.renterName}` : ''}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
};

export default PoolsPage;
