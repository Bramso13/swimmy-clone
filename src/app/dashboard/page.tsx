"use client";

import React, { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
        <div className="rounded-xl border bg-white shadow-sm p-5">
          <div className="text-xs uppercase text-gray-500 mb-1">Solde MangoPay</div>
          <div className="text-2xl font-bold">[solde] €</div>
          <div className="mt-3">
            <Link href="/dashboard/transactions" className="text-sm font-medium" style={{ color: 'var(--brand-blue)' }}>
              Voir mes transactions →
            </Link>
          </div>
        </div>

        <div className="rounded-xl border bg-white shadow-sm p-5">
          <div className="text-xs uppercase text-gray-500 mb-1">Piscines</div>
          <div className="text-2xl font-bold">Gérer mes piscines</div>
          <div className="mt-3 flex gap-2">
            <Link href="/dashboard/pools" className="px-3 py-1.5 rounded-md text-white" style={{ backgroundColor: '#08436A' }}>Mes piscines</Link>
            <Link href="/dashboard/pools/new" className="px-3 py-1.5 rounded-md border" style={{ borderColor: '#08436A', color: '#08436A' }}>Ajouter</Link>
          </div>
        </div>

        <div className="rounded-xl border bg-white shadow-sm p-5">
          <div className="text-xs uppercase text-gray-500 mb-1">Messages</div>
          <div className="text-2xl font-bold">Mes conversations</div>
          <div className="mt-3">
            <Link href="/dashboard/messages" className="text-sm font-medium" style={{ color: 'var(--brand-blue)' }}>
              Ouvrir la messagerie →
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link href="/dashboard/reservations" className="group rounded-xl border bg-white shadow-sm p-6 transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Réservations</div>
              <div className="text-xl font-semibold">Mes réservations</div>
            </div>
            <span className="text-2xl" style={{ color: 'var(--brand-blue)' }}>📅</span>
          </div>
          <div className="mt-3 text-sm text-gray-600 group-hover:underline" style={{ color: 'var(--brand-blue)' }}>Gérer →</div>
        </Link>

        <Link href="/dashboard/favorites" className="group rounded-xl border bg-white shadow-sm p-6 transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Favoris</div>
              <div className="text-xl font-semibold">Mes favoris</div>
            </div>
            <span className="text-2xl text-pink-600">💗</span>
          </div>
          <div className="mt-3 text-sm text-gray-600 group-hover:underline" style={{ color: 'var(--brand-blue)' }}>Voir →</div>
        </Link>
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
