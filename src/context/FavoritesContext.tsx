"use client";

import React, { createContext, useCallback, useContext, useState, ReactNode } from "react";
import { useApi } from "./ApiContext";

export interface Favorite {
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

type FavoritesContextType = {
  // Liste complète des favoris
  favorites: Favorite[];
  favoritesLoading: boolean;
  favoritesError: string | null;
  fetchFavorites: () => Promise<void>;
  
  // Vérifier si une piscine est dans les favoris
  checkFavorite: (poolId: string) => Promise<boolean>;
  isFavorite: (poolId: string) => boolean;
  
  // Ajouter/supprimer des favoris
  toggleFavorite: (poolId: string) => Promise<boolean>;
  addFavorite: (poolId: string) => Promise<boolean>;
  removeFavorite: (poolId: string) => Promise<boolean>;
  
  // État de chargement pour les opérations
  toggling: Record<string, boolean>;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const { request } = useApi();
  
  // État pour la liste complète des favoris
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [favoritesError, setFavoritesError] = useState<string | null>(null);
  
  // État local pour savoir si une piscine est favorie (cache)
  const [favoritePoolIds, setFavoritePoolIds] = useState<Set<string>>(new Set());
  const [toggling, setToggling] = useState<Record<string, boolean>>({});

  // Charger tous les favoris
  const fetchFavorites = useCallback(async () => {
    setFavoritesLoading(true);
    setFavoritesError(null);
    
    try {
      const res = await request("/api/favorites");
      
      if (!res.ok) {
        throw new Error("Erreur lors du chargement des favoris");
      }
      
      const data = await res.json();
      const favoritesList = (data.favorites || []) as Favorite[];
      setFavorites(favoritesList);
      
      // Mettre à jour le cache des IDs de piscines favorites
      const poolIds = new Set<string>(favoritesList.map((fav: Favorite) => fav.pool.id));
      setFavoritePoolIds(poolIds);
    } catch (error: any) {
      setFavoritesError(error.message || "Une erreur est survenue");
    } finally {
      setFavoritesLoading(false);
    }
  }, [request]);

  // Vérifier si une piscine est dans les favoris (via API)
  const checkFavorite = useCallback(async (poolId: string): Promise<boolean> => {
    try {
      const res = await request(`/api/favorites/check?poolId=${poolId}`);
      const data = await res.json();
      const isFav = data.isFavorite || false;
      
      // Mettre à jour le cache
      setFavoritePoolIds((prev) => {
        const next = new Set(prev);
        if (isFav) {
          next.add(poolId);
        } else {
          next.delete(poolId);
        }
        return next;
      });
      
      return isFav;
    } catch (error: any) {
      console.error("Erreur lors de la vérification du favori:", error);
      return false;
    }
  }, [request]);

  // Vérifier si une piscine est favorie (depuis le cache local)
  const isFavorite = useCallback((poolId: string): boolean => {
    return favoritePoolIds.has(poolId);
  }, [favoritePoolIds]);

  // Ajouter un favori
  const addFavorite = useCallback(async (poolId: string): Promise<boolean> => {
    setToggling((prev) => ({ ...prev, [poolId]: true }));
    
    try {
      const res = await request("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ poolId }),
      });
      
      if (res.ok) {
        // Mettre à jour le cache
        setFavoritePoolIds((prev) => new Set([...prev, poolId]));
        // Recharger la liste complète pour avoir les données complètes
        await fetchFavorites();
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Erreur lors de l'ajout du favori:", error);
      return false;
    } finally {
      setToggling((prev) => ({ ...prev, [poolId]: false }));
    }
  }, [request, fetchFavorites]);

  // Supprimer un favori
  const removeFavorite = useCallback(async (poolId: string): Promise<boolean> => {
    setToggling((prev) => ({ ...prev, [poolId]: true }));
    
    try {
      const res = await request(`/api/favorites?poolId=${poolId}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        // Mettre à jour le cache
        setFavoritePoolIds((prev) => {
          const next = new Set(prev);
          next.delete(poolId);
          return next;
        });
        // Retirer de la liste complète
        setFavorites((prev) => prev.filter((fav) => fav.pool.id !== poolId));
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Erreur lors de la suppression du favori:", error);
      return false;
    } finally {
      setToggling((prev) => ({ ...prev, [poolId]: false }));
    }
  }, [request]);

  // Toggle favori (ajouter ou supprimer)
  const toggleFavorite = useCallback(async (poolId: string): Promise<boolean> => {
    const currentlyFavorite = favoritePoolIds.has(poolId);
    
    if (currentlyFavorite) {
      return await removeFavorite(poolId);
    } else {
      return await addFavorite(poolId);
    }
  }, [favoritePoolIds, addFavorite, removeFavorite]);

  const value: FavoritesContextType = {
    favorites,
    favoritesLoading,
    favoritesError,
    fetchFavorites,
    checkFavorite,
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    toggling,
  };

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites doit être utilisé dans un FavoritesProvider");
  }
  return context;
};

