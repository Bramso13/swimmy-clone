"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { usePools } from "@/context/PoolsContext";
import DashboardHero from "@/components/dashboard/DashboardHero";
import SectionIntro from "@/components/dashboard/SectionIntro";
import DashboardCtaCard from "@/components/dashboard/DashboardCtaCard";
import { useApi } from "@/context/ApiContext";

type RevenueSummary = {
  currentMonth: number;
  rolling90Days: number;
  yearToDate: number;
  totalPaid: number;
  pending: number;
  pendingCount: number;
  lastPayoutAt: string | null;
};

type PendingRevenue = {
  total: number;
  count: number;
};

type SummaryCardProps = {
  label: string;
  value: string;
  helper: string;
  icon: string;
  loading?: boolean;
};

const ComptabilitePage = () => {
  const { fetchOwnerPools } = usePools();
  const { request } = useApi();
  const [totalPools, setTotalPools] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [revenue, setRevenue] = useState<RevenueSummary | null>(null);
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [revenueError, setRevenueError] = useState<string | null>(null);
  const [pendingRevenue, setPendingRevenue] = useState<PendingRevenue | null>(null);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [pendingError, setPendingError] = useState<string | null>(null);
  const [poolRevenueLoading, setPoolRevenueLoading] = useState(false);
  const [poolRevenueError, setPoolRevenueError] = useState<string | null>(null);
  const [poolsRevenue, setPoolsRevenue] = useState<
    { id: string; title: string | null; totalRevenue: number }[]
  >([]);
  const SummaryCard = ({ label, value, helper, icon, loading }: SummaryCardProps) => (
    <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{label}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
        {loading ? "…" : value}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{helper}</p>
    </div>
  );

  const isPaidReservation = (reservation: any) => {
    if (!reservation) return false;
    const reservationStatus = reservation.status;
    const transactionStatus = reservation.transaction?.status;
    return (
      reservationStatus === "paid" ||
      transactionStatus === "succeeded" ||
      transactionStatus === "paid" ||
      transactionStatus === "completed"
    );
  };

  const loadPoolRevenue = useCallback(async () => {
    try {
      setPoolRevenueLoading(true);
      setPoolRevenueError(null);
      const session = await authClient.getSession();
      if (!session.data?.user?.id) {
        throw new Error("Utilisateur non authentifié");
      }
      const res = await request(`/api/pools?includeReservations=true`, { cache: "no-store" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Impossible de récupérer les revenus par piscine");
      }
      const data = await res.json();
      const poolsData = Array.isArray(data?.pools) ? data.pools : [];
      const formatted = poolsData.map((pool: any) => {
        const paidReservations = Array.isArray(pool?.reservations)
          ? pool.reservations.filter(isPaidReservation)
          : [];

        const totalRevenue = paidReservations.reduce(
          (sum: number, reservation: any) => sum + Number(reservation?.amount || 0),
          0
        );

        return {
          id: pool.id,
          title: pool.title,
          totalRevenue,
        };
      });
      setPoolsRevenue(formatted);
    } catch (err: any) {
      setPoolRevenueError(err.message || "Erreur lors du chargement des revenus par piscine");
    } finally {
      setPoolRevenueLoading(false);
    }
  }, [request]);
  useEffect(() => {
    loadPoolRevenue();
  }, [loadPoolRevenue]);


  useEffect(() => {
    const fetchPoolsCount = async () => {
      try {
        const session = await authClient.getSession();
        const userId = session.data?.user?.id as string | undefined;

        if (!userId) {
          setLoading(false);
          return;
        }

        const pools = await fetchOwnerPools(userId);
        setTotalPools(pools.length);
      } catch {
        // Erreur gérée par le contexte
      } finally {
        setLoading(false);
      }
    };

    fetchPoolsCount();
  }, [fetchOwnerPools]);

  useEffect(() => {
    let cancelled = false;

    const fetchRevenue = async () => {
      setRevenueLoading(true);
      setRevenueError(null);
      try {
        const res = await request("/api/dashboard/revenue", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || "Impossible de récupérer les revenus Stripe.");
        }
        if (!cancelled) {
          if (process.env.NODE_ENV !== "production") {
            console.log("[Comptabilité] Revenue API response", data);
          }
          setRevenue(data.revenue);
        }
      } catch (error: any) {
        if (!cancelled) {
          setRevenue(null);
          setRevenueError(error.message || "Erreur de récupération des revenus.");
        }
      } finally {
        if (!cancelled) {
          setRevenueLoading(false);
        }
      }
    };

    fetchRevenue();
    return () => {
      cancelled = true;
    };
  }, [request]);

  useEffect(() => {
    let aborted = false;

    const fetchPending = async () => {
      setPendingLoading(true);
      setPendingError(null);
      try {
        const res = await request("/api/dashboard/revenue/pending", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || "Impossible de récupérer les revenus en attente.");
        }
        if (!aborted) {
          setPendingRevenue({
            total: typeof data?.pending === "number" ? data.pending : 0,
            count: typeof data?.count === "number" ? data.count : 0,
          });
        }
      } catch (error: any) {
        if (!aborted) {
          setPendingRevenue(null);
          setPendingError(error.message || "Erreur lors du calcul des revenus en attente.");
        }
      } finally {
        if (!aborted) {
          setPendingLoading(false);
        }
      }
    };

    fetchPending();
    return () => {
      aborted = true;
    };
  }, [request]);

  const formatCurrency = (amount?: number | null) => {
    const safeAmount = typeof amount === "number" ? amount : 0;
    return `${safeAmount.toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} €`;
  };

  const renderRevenueValue = (amount?: number | null) => {
    if (revenueLoading) {
      return <span className="text-sm text-muted-foreground">Chargement…</span>;
    }
    if (revenueError) {
      return <span className="text-sm text-red-500">—</span>;
    }
    return formatCurrency(amount);
  };

  const now = useMemo(() => new Date(), []);
  const monthPeriod = useMemo(() => {
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return `1 → ${lastDay}`;
  }, [now]);

  const revenueSnapshots = [
    {
      label: "Revenus du mois en cours",
      period: monthPeriod,
      value: renderRevenueValue(revenue?.currentMonth),
      hint: "Montant net confirmé pour vos réservations payées ce mois-ci.",
    },
    {
      label: "Revenus des 3 derniers mois",
      period: "Rolling 90 jours",
      value: renderRevenueValue(revenue?.rolling90Days),
      hint: "Vision cumulée pour anticiper vos encaissements à court terme.",
    },
    {
      label: "Revenus de l'année",
      period: now.getFullYear().toString(),
      value: renderRevenueValue(revenue?.yearToDate),
      hint: "Synthèse annuelle (brut) des réservations validées.",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <section className="relative overflow-hidden rounded-3xl border border-slate-100 bg-gradient-to-br from-sky-50 via-white to-indigo-50 px-6 py-10 shadow-[0_25px_70px_-30px_rgba(15,23,42,0.4)] sm:px-10">
          <div className="absolute inset-0 opacity-40 mix-blend-multiply">
            <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.25),_transparent_45%),_radial-gradient(circle_at_bottom,_rgba(79,70,229,0.25),_transparent_45%)]" />
          </div>
          <div className="relative z-10">
            <DashboardHero
              eyebrow="Dashboard propriétaire"
              title="Comptabilité"
              description="Surveillez vos flux financiers, anticipez vos encaissements et préparez vos exports comptables en un clin d'œil."
            />

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {revenueSnapshots.map((snapshot) => (
                <div
                  key={snapshot.label}
                  className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <p className="text-sm font-medium text-slate-500">{snapshot.label}</p>
                  <div className="mt-2 text-2xl font-semibold text-slate-900">{snapshot.value}</div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">{snapshot.period}</p>
                  <p className="mt-3 text-sm text-slate-600">{snapshot.hint}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <SectionIntro
              eyebrow="Vue d'ensemble"
              title="Captez l'essentiel"
              description={
                revenueError
                  ? "Impossible de récupérer les revenus Stripe pour le moment."
                  : "Vos indicateurs principaux s'actualisent en direct pour piloter votre flotte."
              }
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <SummaryCard
                label="Nombre total de piscines"
                value={totalPools !== null ? totalPools.toString() : "—"}
                helper="Piscines actives actuellement listées."
                icon="🏊"
                loading={loading}
              />
              <SummaryCard
                label="Revenus en attente"
                value={
                  pendingError
                    ? "—"
                    : formatCurrency(pendingRevenue?.total)
                }
                helper={
                  pendingError
                    ? pendingError
                    : pendingRevenue
                    ? `${pendingRevenue.count} réservation(s) validée(s) à encaisser.`
                    : "Montant estimé des prochaines rentrées."
                }
                icon="💶"
                loading={pendingLoading}
              />
              <SummaryCard
                label="Revenus encaissés (total)"
                value={formatCurrency(revenue?.totalPaid)}
                helper="Cumul des paiements déjà effectués."
                icon="💼"
                loading={revenueLoading}
              />
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Revenus par piscine</h3>
                  <p className="text-sm text-muted-foreground">
                    Analysez les performances individuelles et identifiez vos best-sellers.
                  </p>
                </div>
                <button
                  onClick={loadPoolRevenue}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60"
                  disabled={poolRevenueLoading}
                >
                  {poolRevenueLoading ? "Actualisation…" : "Rafraîchir"}
                </button>
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100">
                {poolRevenueLoading && poolsRevenue.length === 0 ? (
                  <div className="bg-slate-50 px-4 py-8 text-center text-sm text-muted-foreground">
                    Chargement des revenus…
                  </div>
                ) : poolRevenueError ? (
                  <div className="bg-rose-50 px-4 py-8 text-sm text-rose-600">
                    Erreur : {poolRevenueError}
                  </div>
                ) : poolsRevenue.length === 0 ? (
                  <div className="bg-slate-50 px-4 py-8 text-center text-sm text-muted-foreground">
                    Aucune réservation payée enregistrée pour vos piscines.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100 text-sm">
                      <thead className="bg-slate-50/60 text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="px-4 py-3 text-left">Piscine</th>
                          <th className="px-4 py-3 text-right">Revenus cumulés</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {poolsRevenue.map((pool) => (
                          <tr key={pool.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-medium text-slate-800">
                              {pool.title || "Sans titre"}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-sky-600">
                              {formatCurrency(pool.totalRevenue)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Encaissements imminents</h3>
                  <p className="text-sm text-muted-foreground">
                    Synchronisé avec vos réservations confirmées.
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {pendingLoading ? "Synchronisation…" : `${pendingRevenue?.count ?? 0} réservations`}
                </span>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <p className="text-sm font-medium text-slate-500">Montant à encaisser</p>
                <p className="mt-1 text-3xl font-semibold text-emerald-600">
                  {pendingLoading ? "…" : pendingError ? "—" : formatCurrency(pendingRevenue?.total)}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {pendingError
                    ? pendingError
                    : "Les fonds seront versés automatiquement dès validation du paiement."}
                </p>
              </div>

              <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
                <li>• Vérifiez que vos IBAN et documents KYC sont à jour.</li>
                <li>• Les montants en attente sont recalculés toutes les 15 minutes.</li>
                <li>• Besoin d'une avance ? Contactez-nous via le support.</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-slate-900">Timeline de cashflow</h3>
              <p className="text-sm text-muted-foreground">
                Les jalons clés pour préparer vos déclarations et vos transferts.
              </p>
              <ul className="mt-6 space-y-5">
                {revenueSnapshots.map((snapshot) => (
                  <li key={snapshot.label} className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-sky-500" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{snapshot.label}</p>
                      <div className="text-sm text-slate-500">{snapshot.period}</div>
                      <div className="mt-1 text-base font-semibold text-slate-900">{snapshot.value}</div>
                      <p className="text-sm text-muted-foreground">{snapshot.hint}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <DashboardCtaCard href="/dashboard" label="Retour au tableau de bord" />
      </div>
    </main>
  );
};

export default ComptabilitePage;


