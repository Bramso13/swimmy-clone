"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import PoolCard, { type Pool as PoolCardType } from "@/components/PoolCard";

type PoolItem = PoolCardType & {
  isRented?: boolean;
  renterName?: string | null;
  editHref?: string;
};

type ApprovalItem = PoolItem & {
  requestId: string;
  poolId?: string | null;
  status: string;
  createdAt?: string;
};

const PoolsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pools, setPools] = useState<PoolItem[]>([]);
  const [rented, setRented] = useState<Array<{ id: string; title: string; renter: string }>>([]);
  const [approvalRequests, setApprovalRequests] = useState<ApprovalItem[]>([]);
  const [approvedPools, setApprovedPools] = useState<ApprovalItem[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

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
          const extras = p?.extras && typeof p.extras === 'object' ? p.extras : {};
          const equipments = Array.isArray((extras as any)?.equipments)
            ? (extras as any).equipments.filter((e: any) => typeof e === 'string' && e.trim().length > 0)
            : [];
          const rulesList = Array.isArray(p?.rules)
            ? (p.rules as any[]).filter((e) => typeof e === 'string' && e.trim().length > 0)
            : [];
          if (isRented && renterName) {
            rentedNow.push({ id: p.id, title: p.title, renter: renterName });
          }
          allItems.push({
            id: p.id,
            title: p.title,
            photos: Array.isArray(p.photos) ? p.photos : [],
            pricePerHour: typeof p.pricePerHour === 'number' ? p.pricePerHour : Number(p.pricePerHour || 0),
            address: p.address || undefined,
            description: typeof p.description === 'string' ? p.description : '',
            equipments,
            rules: rulesList,
            badge: p.approved === false ? 'En attente' : null,
            isRented,
            renterName,
            editHref: `/dashboard/pools/${p.id}/edit`,
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
              ? approvalsData.requests.map((req: any) => {
                  const poolId = req.poolId ?? null;
                  const id = poolId || req.id;
                  return {
                    requestId: req.id,
                    poolId,
                    status: req.status || "pending",
                    createdAt: req.createdAt || undefined,
                    id,
                    title: req.title || "Piscine sans titre",
                    address: req.address || undefined,
                    photos: Array.isArray(req.photos) ? req.photos : [],
                    pricePerHour: typeof req.pricePerHour === "number" ? req.pricePerHour : Number(req.pricePerHour || 0),
                    description: typeof req.description === 'string' ? req.description : '',
                    badge: req.status === 'pending' ? 'En attente' : req.status === 'approved' ? 'Validée' : 'Refusée',
                    equipments: (() => {
                      const direct = Array.isArray(req.extras?.equipments) ? req.extras.equipments : null;
                      const additionalExtras = req.additional && typeof req.additional === 'object' && Array.isArray(req.additional?.extras?.equipments)
                        ? req.additional.extras.equipments
                        : null;
                      const source = direct || additionalExtras || [];
                      return source.filter((e: any) => typeof e === 'string' && e.trim().length > 0);
                    })(),
                    rules: Array.isArray(req.rules) ? req.rules.filter((r: any) => typeof r === 'string' && r.trim().length > 0) : [],
                    isRented: false,
                    renterName: null,
                    editHref: poolId ? `/dashboard/pools/${poolId}/edit` : undefined,
                  };
                })
              : [];
            // Séparer les demandes en attente des piscines validées (qui ont un poolId et sont approuvées)
            const pending = mapped.filter(req => req.status === 'pending' && !req.poolId);
            const approved = mapped.filter(req => req.status === 'approved' && req.poolId);
            setApprovalRequests(pending);
            setApprovedPools(approved);
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

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const Sidebar = (
    <div className="p-6">
      <div className="text-sm text-gray-500 mb-4">Gestion des annonces</div>
      <div className="space-y-2">
        <Link
          href="/dashboard/pools/new"
          className="block w-full rounded-lg border border-gray-200 px-4 py-3 text-center font-medium text-[var(--brand-blue)] hover:bg-gray-50"
        >
          Ajouter une piscine
        </Link>
        <Link
          href="/dashboard"
          className="block w-full rounded-lg border border-gray-200 px-4 py-3 text-center text-sm text-gray-600 hover:bg-gray-50"
        >
          ← Retour au dashboard
        </Link>
      </div>
    </div>
  );

  return (
    <main className="max-w-6xl mx-auto p-6">
      {isMobile && (
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => setShowSidebar(true)}
            className="px-4 py-2 rounded-full border border-gray-300 bg-white text-sm font-medium"
          >
            ☰ Menu
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Mes piscines</h1>
        </div>
      )}
      <div className="mb-6 flex items-center justify-between">
        {!isMobile && <h1 className="text-2xl font-bold">Mes piscines</h1>}
        <a
          href="/dashboard/pools/new"
          className="text-white px-4 py-2 rounded"
          style={{ backgroundColor: '#08436A' }}
          onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#062F4B'}
          onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#08436A'}
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
            style={{ backgroundColor: '#08436A' }}
            onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#062F4B'}
            onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#08436A'}
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
                  <p className="text-sm text-gray-600">Ces annonces sont encore en attente d'approbation par l'équipe YoumPool.</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {approvalRequests.map((req) => (
                  <div key={req.requestId} className="space-y-2">
                    <PoolCard pool={req} />
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-gray-500">En attente de validation</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Statut : En attente
                      {req.createdAt && (
                        <> — Soumise le {new Date(req.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}</>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
          {approvedPools.length > 0 && (
            <section className="mb-8 rounded-xl border bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-lg font-semibold">Vos piscines validées</h2>
                  <p className="text-sm text-gray-600">Ces piscines sont approuvées et visibles sur la page de recherche.</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {approvedPools.map((req) => (
                  <div key={req.requestId} className="space-y-2">
                    <PoolCard pool={req} />
                    <div className="flex flex-wrap items-center gap-2">
                      {req.poolId ? (
                        <Link
                          href={`/dashboard/pools/${req.poolId}/edit`}
                          className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100"
                        >
                          Modifier
                        </Link>
                      ) : (
                        <span className="text-xs text-gray-500">En attente de création de la piscine</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      Validée
                      {req.createdAt && (
                        <> — Soumise le {new Date(req.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}</>
                      )}
                    </div>
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
          {pools.length > 0 && (
            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Toutes vos piscines</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pools.map((pool) => (
              <div key={pool.id} className="space-y-2">
                <PoolCard pool={pool} />
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={pool.editHref || `/dashboard/pools/${pool.id}/edit`}
                    className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Modifier
                  </Link>
                </div>
                {pool.isRented && (
                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
                    Actuellement indisponible
                    {pool.renterName ? ` — louée par ${pool.renterName}` : ''}
                  </div>
                )}
              </div>
            ))}
              </div>
            </section>
          )}
        </div>
      )}
      {isMobile && showSidebar && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowSidebar(false)} />
          <div className="absolute top-0 right-0 h-full w-4/5 max-w-sm bg-white shadow-2xl border-l border-gray-200">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="text-base font-semibold text-gray-900">Actions rapides</div>
              <button onClick={() => setShowSidebar(false)} className="text-2xl text-gray-500">✕</button>
            </div>
            {Sidebar}
          </div>
        </div>
      )}
    </main>
  );
};

export default PoolsPage;

