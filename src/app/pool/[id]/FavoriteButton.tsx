"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useFavorites } from "@/context/FavoritesContext";

interface FavoriteButtonProps {
  poolId: string;
}

export default function FavoriteButton({ poolId }: FavoriteButtonProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const router = useRouter();
  const { isFavorite, checkFavorite, toggleFavorite, toggling } = useFavorites();

  useEffect(() => {
    const checkAuth = async () => {
      const session = await authClient.getSession();
      const isAuth = !!session.data?.user;
      setIsAuthenticated(isAuth);
      
      // Vérifier si la piscine est dans les favoris
      if (isAuth) {
        await checkFavorite(poolId);
      }
    };
    checkAuth();
  }, [poolId, checkFavorite]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    await toggleFavorite(poolId);
  };

  const isFav = isFavorite(poolId);

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={toggling[poolId]}
      className="inline-flex items-center gap-2 border px-3 py-1.5 rounded-full hover:bg-muted transition-all disabled:opacity-50"
      title={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill={isFav ? "red" : "none"}
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke={isFav ? "red" : "currentColor"}
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
      <span>{isFav ? "Enregistré" : "Enregistrer"}</span>
    </button>
  );
}

