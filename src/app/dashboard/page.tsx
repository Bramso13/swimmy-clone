import React from "react";

const DashboardPage = () => {
  // TODO: fetch infos utilisateur, réservations, piscines, solde MangoPay
  return (
    <main className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Mon tableau de bord</h1>
      <div className="mb-4">Bienvenue, [Nom utilisateur]</div>
      <div className="mb-4">Solde MangoPay : [solde] €</div>
      <div className="mb-4">
        <a href="/dashboard/reservations" className="underline">
          Mes réservations
        </a>
      </div>
      <div className="mb-4">
        <a href="/dashboard/pools" className="underline">
          Mes piscines
        </a>
      </div>
      <div className="mb-4">
        <a href="/dashboard/transactions" className="underline">
          Mes transactions
        </a>
      </div>
    </main>
  );
};

export default DashboardPage;
