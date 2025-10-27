import React from "react";

const PoolsPage = () => {
  // TODO: fetch piscines utilisateur via API
  return (
    <main className="max-w-3xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Mes piscines</h1>
      <div>Liste des piscines (à venir)</div>
      <a
        href="/dashboard/pools/new"
        className="text-white px-4 py-2 rounded"
        style={{backgroundColor: '#0094ec'}}
        onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#0078c4'}
        onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#0094ec'}
      >
        Ajouter une piscine
      </a>
    </main>
  );
};

export default PoolsPage;
