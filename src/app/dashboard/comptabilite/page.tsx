"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { usePools } from "@/context/PoolsContext";
import RevenueSnapshotCard from "@/components/dashboard/RevenueSnapshotCard";
import DashboardHero from "@/components/dashboard/DashboardHero";
import SectionIntro from "@/components/dashboard/SectionIntro";
import StatCard from "@/components/dashboard/StatCard";
import DashboardCtaCard from "@/components/dashboard/DashboardCtaCard";

const revenueSnapshots = [
  {
    label: "Revenus du mois en cours",
    period: "1 → 30 (estimé)",
    value: "— €",
    hint: "Montant net à percevoir pour vos réservations confirmées ce mois-ci.",
  },
  {
    label: "Revenus des 3 derniers mois",
    period: "Rolling 90 jours",
    value: "— €",
    hint: "Vision cumulée pour anticiper vos encaissements à court terme.",
  },
  {
    label: "Revenus de l'année",
    period: new Date().getFullYear().toString(),
    value: "— €",
    hint: "Synthèse annuelle (brut) des réservations validées.",
  },
];

const ComptabilitePage = () => {
  const { fetchOwnerPools } = usePools();
  const [totalPools, setTotalPools] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPoolsCount = async () => {
      try {
        const session = await authClient.getSession();
        const userId = session.data?.user?.id as string | undefined;
        
        if (!userId) {
          setLoading(false);
          return;
        }

        // Récupérer les piscines du propriétaire via le contexte
        const pools = await fetchOwnerPools(userId);
        setTotalPools(pools.length);
      } catch (error) {
        // Erreur gérée par le contexte
      } finally {
        setLoading(false);
      }
    };

    fetchPoolsCount();
  }, [fetchOwnerPools]);
  return (
    <main className="max-w-4xl mx-auto p-6">
      <DashboardHero
        eyebrow="Dashboard propriétaire"
        title="Comptabilité"
        description="Cette section sera disponible pour suivre vos revenus, charges et documents comptables."
      />

      <section className="mb-10">
        <SectionIntro
          eyebrow="Vue d'ensemble"
          title="Revenus prévisionnels"
          description="Suivez vos revenus sur différentes périodes dès que les données comptables seront synchronisées."
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

      <section className="mb-10">
        <SectionIntro eyebrow="Statistiques" title="Vos piscines" />
        <StatCard
          label="Nombre total de piscines"
          value={totalPools ?? "—"}
          helperText="Nombre total de piscines que vous avez enregistrées sur la plateforme."
          icon="🏊"
          loading={loading}
        />
      </section>

      <DashboardCtaCard href="/dashboard" label="Retour au tableau de bord" />
    </main>
  );
};

export default ComptabilitePage;


