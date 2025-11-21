"use client";

import React, { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardCard from "@/components/dashboard/DashboardCard";
import QuickLinkCard from "@/components/dashboard/QuickLinkCard";

const DashboardPage = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const session = await authClient.getSession();
        const baseUser = session.data?.user || null;
        if (!baseUser) {
          router.replace("/login");
          return;
        }
        try {
          const res = await fetch(`/api/users/${baseUser.id}`);
          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
          } else {
            setUser(baseUser);
          }
        } catch {
          setUser(baseUser);
        }
      } catch (error) {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const userName = user?.name || user?.email || "Utilisateur";

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg, #08436A, #4f46e5)" }}>
              Mon tableau de bord
            </span>
          </h1>
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg, #08436A, #4f46e5)" }}>
            Mon tableau de bord
          </span>
        </h1>
        <p className="text-sm text-muted-foreground">Bienvenue, {userName}</p>
      </div>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          label="Solde MangoPay"
          title="[solde] €"
          footer={
            <Link href="/dashboard/transactions" className="text-sm font-medium" style={{ color: "var(--brand-blue)" }}>
              Voir mes transactions →
            </Link>
          }
        />

        <DashboardCard
          label="Piscines"
          title="Gérer mes piscines"
          footer={
            <div className="mt-1 flex gap-2">
              <Link href="/dashboard/pools" className="px-3 py-1.5 rounded-md text-white" style={{ backgroundColor: "#08436A" }}>
                Mes piscines
              </Link>
              <Link
                href="/dashboard/pools/new"
                className="px-3 py-1.5 rounded-md border"
                style={{ borderColor: "#08436A", color: "#08436A" }}
              >
                Ajouter
              </Link>
            </div>
          }
        />

        <DashboardCard
          label="Messages"
          title="Mes conversations"
          footer={
            <Link href="/dashboard/messages" className="text-sm font-medium" style={{ color: "var(--brand-blue)" }}>
              Ouvrir la messagerie →
            </Link>
          }
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <QuickLinkCard
          href="/dashboard/reservations"
          label="Réservations"
          title="Mes réservations"
          icon="📅"
          description="Gérer →"
        />

        <QuickLinkCard
          href="/dashboard/favorites"
          label="Favoris"
          title="Mes favoris"
          icon="💗"
          accentColor="#e11d48"
          description="Voir →"
        />
      </section>

      {user?.role === "owner" && (
        <section className="mt-8">
          <div className="rounded-xl border bg-white shadow-sm p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm text-gray-500 uppercase tracking-wide">Comptabilité</div>
              <div className="text-xl font-semibold">Suivi des revenus et documents</div>
              <p className="text-sm text-muted-foreground mt-2">
                Accédez à votre futur espace comptable pour gérer vos finances.
              </p>
            </div>
            <Link
              href="/dashboard/comptabilite"
              className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: "#08436A" }}
            >
              Ouvrir la section
            </Link>
          </div>
        </section>
      )}
    </main>
  );
};

export default DashboardPage;
