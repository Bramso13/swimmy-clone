import React from "react";

const SearchPage = () => {
  // TODO: formulaire de recherche, affichage résultats
  return (
    <main className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Rechercher une piscine</h1>
      <form className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Lieu"
          className="border rounded px-2 py-1"
        />
        <input type="date" className="border rounded px-2 py-1" />
        <input
          type="number"
          placeholder="Prix max"
          className="border rounded px-2 py-1"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Rechercher
        </button>
      </form>
      <div>Résultats de recherche (à venir)</div>
    </main>
  );
};

export default SearchPage;
