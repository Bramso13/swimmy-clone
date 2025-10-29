import React from "react";

const DashboardPage = () => {
  // TODO: fetch infos utilisateur, réservations, piscines, solde MangoPay
  return (
    <main className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg, #0094ec, #4f46e5)" }}>
            Mon tableau de bord
          </span>
        </h1>
        <p className="text-sm text-muted-foreground">Bienvenue, [Nom utilisateur]</p>
      </div>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-white shadow-sm p-5">
          <div className="text-xs uppercase text-gray-500 mb-1">Solde MangoPay</div>
          <div className="text-2xl font-bold">[solde] €</div>
          <div className="mt-3">
            <a href="/dashboard/transactions" className="text-sm font-medium" style={{ color: '#0094ec' }}>
              Voir mes transactions →
            </a>
          </div>
        </div>

        <div className="rounded-xl border bg-white shadow-sm p-5">
          <div className="text-xs uppercase text-gray-500 mb-1">Piscines</div>
          <div className="text-2xl font-bold">Gérer mes piscines</div>
          <div className="mt-3 flex gap-2">
            <a href="/dashboard/pools" className="px-3 py-1.5 rounded-md text-white" style={{ backgroundColor: '#0094ec' }}>Mes piscines</a>
            <a href="/dashboard/pools/new" className="px-3 py-1.5 rounded-md border" style={{ borderColor: '#0094ec', color: '#0094ec' }}>Ajouter</a>
          </div>
        </div>

        <div className="rounded-xl border bg-white shadow-sm p-5">
          <div className="text-xs uppercase text-gray-500 mb-1">Messages</div>
          <div className="text-2xl font-bold">Mes conversations</div>
          <div className="mt-3">
            <a href="/dashboard/messages" className="text-sm font-medium" style={{ color: '#0094ec' }}>
              Ouvrir la messagerie →
            </a>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <a href="/dashboard/reservations" className="group rounded-xl border bg-white shadow-sm p-6 transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Réservations</div>
              <div className="text-xl font-semibold">Mes réservations</div>
            </div>
            <span className="text-2xl" style={{ color: '#0094ec' }}>📅</span>
          </div>
          <div className="mt-3 text-sm text-gray-600 group-hover:underline" style={{ color: '#0094ec' }}>Gérer →</div>
        </a>

        <a href="/dashboard/favorites" className="group rounded-xl border bg-white shadow-sm p-6 transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Favoris</div>
              <div className="text-xl font-semibold">Mes favoris</div>
            </div>
            <span className="text-2xl text-pink-600">💗</span>
          </div>
          <div className="mt-3 text-sm text-gray-600 group-hover:underline" style={{ color: '#0094ec' }}>Voir →</div>
        </a>
      </section>
    </main>
  );
};

export default DashboardPage;
