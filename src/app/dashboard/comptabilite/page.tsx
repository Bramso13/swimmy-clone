"use client";

import { useEffect, useMemo, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { usePools } from "@/context/PoolsContext";
import RevenueSnapshotCard from "@/components/dashboard/RevenueSnapshotCard";
import DashboardHero from "@/components/dashboard/DashboardHero";
import SectionIntro from "@/components/dashboard/SectionIntro";
import StatCard from "@/components/dashboard/StatCard";
import DashboardCtaCard from "@/components/dashboard/DashboardCtaCard";
import { useApi } from "@/context/ApiContext";

type RevenueSummary = {
  currentMonth: number;
  rolling90Days: number;
  yearToDate: number;
  totalPaid: number;
  pending: number;
  lastPayoutAt: string | null;
};

const ComptabilitePage = () => {
  const { fetchOwnerPools } = usePools();
  const { request } = useApi();
  const [totalPools, setTotalPools] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [revenue, setRevenue] = useState<RevenueSummary | null>(null);
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [revenueError, setRevenueError] = useState<string | null>(null);

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
    <main className="max-w-4xl mx-auto p-6">
      <DashboardHero
        eyebrow="Dashboard propriétaire"
        title="Comptabilité"
        description="Visualisez vos revenus confirmés, vos réservations en attente et exportez bientôt vos documents comptables."
      />

      <section className="mb-10">
        <SectionIntro
          eyebrow="Vue d'ensemble"
          title="Revenus prévisionnels"
          description={
            revenueError
              ? "Impossible de récupérer les revenus Stripe pour le moment."
              : "Suivez vos revenus confirmés sur différentes périodes."
          }
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {revenueSnapshots.map((snapshot) => (
            <RevenueSnapshotCard
              key={snapshot.label}
              label={snapshot.label}
              period={snapshot.period}
              value={snapshot.value}
              hint={snapshot.hint}
            />
          ))}
        </div>
      </section>

      <section className="mb-10 space-y-4">
        <SectionIntro eyebrow="Statistiques" title="Vos piscines" />
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard
            label="Nombre total de piscines"
            value={totalPools ?? "—"}
            helperText="Nombre total de piscines que vous avez enregistrées sur la plateforme."
            icon="🏊"
            loading={loading}
          />
          <StatCard
            label="Revenus en attente"
            value={revenueLoading ? "…" : formatCurrency(revenue?.pending)}
            helperText="Montant des réservations acceptées mais non encore payées."
            icon="💶"
            loading={revenueLoading}
          />
          <StatCard
            label="Revenus encaissés (total)"
            value={revenueLoading ? "…" : formatCurrency(revenue?.totalPaid)}
            helperText="Somme cumulée de toutes vos réservations déjà payées."
            icon="💼"
            loading={revenueLoading}
          />
        </div>
      </section>

      <DashboardCtaCard href="/dashboard" label="Retour au tableau de bord" />
    </main>
  );
};

export default ComptabilitePage;


