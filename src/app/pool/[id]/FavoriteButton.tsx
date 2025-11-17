"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface FavoriteButtonProps {
  poolId: string;
}

export default function FavoriteButton({ poolId }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const session = await authClient.getSession();
      const isAuth = !!session.data?.user;
      setIsAuthenticated(isAuth);
      
      // Vérifier si la piscine est dans les favoris
      if (isAuth) {
        try {
          const response = await fetch(`/api/favorites/check?poolId=${poolId}`);
          const data = await response.json();
          setIsFavorite(data.isFavorite || false);
        } catch (error) {
          console.error("Erreur lors de la vérification du favori:", error);
        }
      }
    };
    checkAuth();
  }, [poolId]);

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      if (isFavorite) {
        // Supprimer des favoris
        await fetch(`/api/favorites?poolId=${poolId}`, {
          method: "DELETE",
        });
        setIsFavorite(false);
      } else {
        // Ajouter aux favoris
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ poolId }),
        });
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Erreur lors de la gestion du favori:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className="inline-flex items-center gap-2 border px-3 py-1.5 rounded-full hover:bg-muted transition-all disabled:opacity-50"
      title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill={isFavorite ? "red" : "none"}
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke={isFavorite ? "red" : "currentColor"}
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
      <span>{isFavorite ? "Enregistré" : "Enregistrer"}</span>
    </button>
  );
}

