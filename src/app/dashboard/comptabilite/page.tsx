"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { usePools } from "@/context/PoolsContext";
import RevenueSnapshotCard from "@/components/dashboard/RevenueSnapshotCard";

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
      <div className="mb-8">
        <p className="text-sm text-muted-foreground uppercase tracking-wide">Dashboard propriétaire</p>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(90deg, #08436A, #4f46e5)" }}
          >
            Comptabilité
          </span>
        </h1>
        <p className="text-muted-foreground">
          Cette section sera disponible pour suivre vos revenus, charges et documents comptables.
        </p>
      </div>

      <section className="mb-10">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground uppercase tracking-wide">Vue d'ensemble</p>
          <h2 className="text-xl font-semibold mt-1">Revenus prévisionnels</h2>
          <p className="text-sm text-muted-foreground">
            Suivez vos revenus sur différentes périodes dès que les données comptables seront synchronisées.
          </p>
        </div>
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
        <div className="mb-4">
          <p className="text-sm text-muted-foreground uppercase tracking-wide">Statistiques</p>
          <h2 className="text-xl font-semibold mt-1">Vos piscines</h2>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Nombre total de piscines</p>
              {loading ? (
                <p className="text-2xl font-bold text-gray-400">Chargement...</p>
              ) : (
                <p className="text-3xl font-extrabold" style={{ color: "#08436A" }}>
                  {totalPools !== null ? totalPools : "—"}
                </p>
              )}
            </div>
            <div className="text-4xl">🏊</div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Nombre total de piscines que vous avez enregistrées sur la plateforme.
          </p>
        </div>
      </section>

      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center shadow-sm">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white"
          style={{ backgroundColor: "#08436A" }}
        >
          Retour au tableau de bord
        </Link>
      </div>
    </main>
  );
};

export default ComptabilitePage;


