import React from "react";

const NewPoolPage = () => {
  // TODO: gérer la soumission du formulaire vers l’API
  return (
    <main className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Ajouter une piscine</h1>
      <form className="space-y-2">
        <input
          type="text"
          name="title"
          placeholder="Titre"
          className="border rounded px-2 py-1 w-full"
        />
        <textarea
          name="description"
          placeholder="Description"
          className="border rounded px-2 py-1 w-full"
        />
        <input
          type="text"
          name="address"
          placeholder="Adresse"
          className="border rounded px-2 py-1 w-full"
        />
        <input
          type="number"
          name="latitude"
          placeholder="Latitude"
          className="border rounded px-2 py-1 w-full"
        />
        <input
          type="number"
          name="longitude"
          placeholder="Longitude"
          className="border rounded px-2 py-1 w-full"
        />
        <input
          type="text"
          name="photos"
          placeholder="URLs des photos (séparées par des virgules)"
          className="border rounded px-2 py-1 w-full"
        />
        <input
          type="number"
          name="pricePerHour"
          placeholder="Prix à l’heure (€)"
          className="border rounded px-2 py-1 w-full"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Créer
        </button>
      </form>
    </main>
  );
};

export default NewPoolPage;
