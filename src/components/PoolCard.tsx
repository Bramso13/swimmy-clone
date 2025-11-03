"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";

export type Pool = {
  id: string;
  title: string;
  photos: string[];
  pricePerHour: number;
  address?: string;
};

function isValidSrc(src?: string) {
  if (!src) return false;
  if (src.startsWith("/") || src.startsWith("data:")) return true;
  try {
    const u = new URL(src);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export default function PoolCard({ pool }: { pool: Pool }) {
  const initialCover = useMemo(() => (pool.photos || []).find(isValidSrc), [pool.photos]);
  const [showImage, setShowImage] = useState<boolean>(!!initialCover);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = async () => {
      const session = await authClient.getSession();
      const isAuth = !!session.data?.user;
      setIsAuthenticated(isAuth);
      
      // Vérifier si la piscine est dans les favoris
      if (isAuth) {
        try {
          const response = await fetch(`/api/favorites/check?poolId=${pool.id}`);
          const data = await response.json();
          setIsFavorite(data.isFavorite || false);
        } catch (error) {
          console.error("Erreur lors de la vérification du favori:", error);
        }
      }
    };
    checkAuth();
  }, [pool.id]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }

    try {
      if (isFavorite) {
        // Supprimer des favoris
        await fetch(`/api/favorites?poolId=${pool.id}`, {
          method: "DELETE",
        });
        setIsFavorite(false);
      } else {
        // Ajouter aux favoris
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ poolId: pool.id }),
        });
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Erreur lors de la gestion du favori:", error);
    }
  };

  const photosCount = Array.isArray(pool.photos) ? pool.photos.length : 0;
  const locationText = pool.address ?? "";

  return (
    <Link
      href={`/pool/${pool.id}`}
      className="block bg-white border rounded-xl shadow hover:shadow-lg transition-shadow overflow-hidden"
    >
      <div className="relative h-56 w-full bg-muted">
        {showImage && initialCover ? (
          <Image
            src={initialCover}
            alt={pool.title}
            fill
            className="object-cover"
            onError={() => setShowImage(false)}
            unoptimized // optionnel si tu utilises des images externes sans les autoriser dans next.config.js
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
            Sans image
          </div>
        )}
        {/* Compteur d'images en haut à gauche */}
        {photosCount > 0 && (
          <span className="absolute top-2 left-2 text-[11px] px-2 py-1 rounded-full bg-black/60 text-white">
            1/{photosCount}
          </span>
        )}
        {/* Bouton favori en haut à droite de l'image */}
        {isAuthenticated && (
          <button
            onClick={toggleFavorite}
            className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-all shadow-md"
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
          </button>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="font-semibold text-[15px] line-clamp-1">{pool.title}</div>
            {locationText && (
              <div className="text-xs text-gray-500 line-clamp-1">{locationText}</div>
            )}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-gray-700">
            <span className="hidden sm:inline">Nouveau</span>
            <span className="text-blue-500">★</span>
          </div>
        </div>
        <div className="mt-2 font-bold text-sm" style={{color: '#0094ec'}}>
          {Math.round(Number(pool.pricePerHour || 0))} €/heure
        </div>
      </div>
    </Link>
  );
}
