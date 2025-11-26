"use client";

import React, { createContext, useCallback, useContext, useState, ReactNode } from "react";
import { useApi } from "./ApiContext";

export interface Pool {
  id: string;
  title: string;
  address: string;
  photos: string[];
  pricePerHour: number;
  approved?: boolean;
  description?: string;
  latitude?: number;
  longitude?: number;
  [key: string]: any; // Pour permettre d'autres propriétés
}

type PoolsContextType = {
  // Récupérer toutes les piscines
  pools: Pool[];
  poolsLoading: boolean;
  poolsError: string | null;
  fetchPools: () => Promise<Pool[]>;
};

const PoolsContext = createContext<PoolsContextType | undefined>(undefined);

export const PoolsProvider = ({ children }: { children: ReactNode }) => {
  const { request } = useApi();
  
  // État pour les piscines
  const [pools, setPools] = useState<Pool[]>([]);
  const [poolsLoading, setPoolsLoading] = useState(false);
  const [poolsError, setPoolsError] = useState<string | null>(null);

  // Récupérer toutes les piscines
  const fetchPools = useCallback(async (): Promise<Pool[]> => {
    setPoolsLoading(true);
    setPoolsError(null);
    
    try {
      const res = await request("/api/pools", { cache: "no-store" });
      
      if (!res.ok) {
        throw new Error("Erreur lors du chargement des piscines");
      }
      
      const data = await res.json();
      const poolsList = (data.pools || []) as Pool[];
      setPools(poolsList);
      return poolsList;
    } catch (error: any) {
      setPoolsError(error.message || "Une erreur est survenue");
      return [];
    } finally {
      setPoolsLoading(false);
    }
  }, [request]);

  const value: PoolsContextType = {
    pools,
    poolsLoading,
    poolsError,
    fetchPools,
  };

  return <PoolsContext.Provider value={value}>{children}</PoolsContext.Provider>;
};

export const usePools = () => {
  const context = useContext(PoolsContext);
  if (!context) {
    throw new Error("usePools doit être utilisé dans un PoolsProvider");
  }
  return context;
};
