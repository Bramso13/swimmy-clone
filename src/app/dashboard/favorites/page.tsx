"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import PoolCard from "@/components/PoolCard";

interface Favorite {
  id: string;
  pool: {
    id: string;
    title: string;
    description: string;
    address: string;
    photos: string[];
    pricePerHour: number;
    latitude: number;
    longitude: number;
  };
  createdAt: string;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const session = await authClient.getSession();
        if (!session.data?.user) {
          window.location.href = "/login";
          return;
        }

        const response = await fetch("/api/favorites");
        if (!response.ok) {
          throw new Error("Erreur lors du chargement des favoris");
        }

        const data = await response.json();
        setFavorites(data.favorites || []);
      } catch (err: any) {
        setError(err.message || "Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-800 dark:text-red-400 mb-2">Erreur</h2>
            <p className="text-red-700 dark:text-red-300">{error}</p>
            <Link
              href="/dashboard"
              className="inline-block mt-4 text-red-600 dark:text-red-400 hover:underline"
            >
              ← Retour au tableau de bord
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block"
          >
            ← Retour au tableau de bord
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            ❤️ Mes piscines favorites
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Retrouvez toutes les piscines que vous avez enregistrées
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💙</div>
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Aucune piscine favorite pour le moment
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Commencez à enregistrer vos piscines préférées en cliquant sur le cœur
            </p>
            <Link
              href="/search"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Découvrir des piscines
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {favorites.map((fav) => (
              <PoolCard key={fav.id} pool={fav.pool} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

