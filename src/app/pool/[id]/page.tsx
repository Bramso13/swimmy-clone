import React from "react";

const PoolDetailPage = async ({ params }: { params: { id: string } }) => {
  // TODO: fetch piscine par ID via API
  // const pool = await fetch(...)
  return (
    <main className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">Titre de la piscine</h1>
      <div className="mb-4">Adresse, description, photos, etc.</div>
      <div className="mb-4">Galerie d’images (à venir)</div>
      <div className="mb-4">Calendrier de disponibilités (à venir)</div>
      <form className="space-y-2">
        <label className="block">Date de réservation</label>
        <input type="date" className="border rounded px-2 py-1" />
        <label className="block">Heure</label>
        <input type="time" className="border rounded px-2 py-1" />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Réserver
        </button>
      </form>
    </main>
  );
};

export default PoolDetailPage;
