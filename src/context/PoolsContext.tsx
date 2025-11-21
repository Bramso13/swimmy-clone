"use client";

import React, { createContext, useCallback, useContext, useState, ReactNode } from "react";
import { Pool } from "./types";

type PoolsContextType = {
  pools: Pool[];
  poolsLoading: boolean;
  poolsError: string | null;
  fetchPools: () => Promise<void>;
  fetchOwnerPools: (ownerId: string) => Promise<Pool[]>;
  getPoolById: (id: string) => Pool | undefined;
  searchPools: (query: string) => Pool[];
  clearPoolsError: () => void;
};

const PoolsContext = createContext<PoolsContextType | undefined>(undefined);

export const PoolsProvider = ({ children }: { children: ReactNode }) => {
  const [pools, setPools] = useState<Pool[]>([]);
  const [poolsLoading, setPoolsLoading] = useState(false);
  const [poolsError, setPoolsError] = useState<string | null>(null);

  const fetchPools = useCallback(async () => {
    setPoolsLoading(true);
    setPoolsError(null);
    try {
      const response = await fetch("/api/pools");
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des piscines");
      }
      const data = await response.json();
      setPools(Array.isArray(data.pools) ? data.pools : []);
    } catch (error: any) {
      setPoolsError(error.message || "Une erreur est survenue");
    } finally {
      setPoolsLoading(false);
    }
  }, []);

  const fetchOwnerPools = useCallback(async (ownerId: string): Promise<Pool[]> => {
    try {
      const response = await fetch(`/api/pools?ownerId=${encodeURIComponent(ownerId)}`, {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des piscines du propriétaire");
      }
      const data = await response.json();
      return Array.isArray(data.pools) ? data.pools : [];
    } catch (error: any) {
      setPoolsError(error.message || "Une erreur est survenue");
      return [];
    }
  }, []);

  const getPoolById = useCallback(
    (id: string) => pools.find((pool) => pool.id === id),
    [pools]
  );

  const searchPools = useCallback(
    (query: string) => {
      if (!query) return pools;
      const lowerQuery = query.toLowerCase();
      return pools.filter(
        (pool) =>
          pool.title.toLowerCase().includes(lowerQuery) ||
          pool.description.toLowerCase().includes(lowerQuery) ||
          pool.address.toLowerCase().includes(lowerQuery)
      );
    },
    [pools]
  );

  const clearPoolsError = useCallback(() => setPoolsError(null), []);

  const value: PoolsContextType = {
    pools,
    poolsLoading,
    poolsError,
    fetchPools,
    fetchOwnerPools,
    getPoolById,
    searchPools,
    clearPoolsError,
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


