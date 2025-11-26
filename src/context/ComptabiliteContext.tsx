"use client";

import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { authClient } from "@/lib/auth-client";
import { useApi } from "./ApiContext";

export type RevenueSummary = {
  currentMonth: number;
  rolling90Days: number;
  yearToDate: number;
  totalPaid: number;
  pending: number;
  pendingCount: number;
  lastPayoutAt: string | null;
};

export type PendingRevenue = {
  total: number;
  count: number;
};

export type PoolRevenue = {
  id: string;
  title: string | null;
  totalRevenue: number;
};

type ComptabiliteContextType = {
  // Revenus généraux
  revenue: RevenueSummary | null;
  revenueLoading: boolean;
  revenueError: string | null;
  fetchRevenue: () => Promise<void>;
  
  // Revenus en attente
  pendingRevenue: PendingRevenue | null;
  pendingLoading: boolean;
  pendingError: string | null;
  fetchPendingRevenue: () => Promise<void>;
  
  // Revenus par piscine
  poolsRevenue: PoolRevenue[];
  poolRevenueLoading: boolean;
  poolRevenueError: string | null;
  fetchPoolRevenue: () => Promise<void>;
};

const ComptabiliteContext = createContext<ComptabiliteContextType | undefined>(undefined);

export const ComptabiliteProvider = ({ children }: { children: ReactNode }) => {
  const { request } = useApi();
  
  // État pour les revenus généraux
  const [revenue, setRevenue] = useState<RevenueSummary | null>(null);
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [revenueError, setRevenueError] = useState<string | null>(null);
  
  // État pour les revenus en attente
  const [pendingRevenue, setPendingRevenue] = useState<PendingRevenue | null>(null);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [pendingError, setPendingError] = useState<string | null>(null);
  
  // État pour les revenus par piscine
  const [poolsRevenue, setPoolsRevenue] = useState<PoolRevenue[]>([]);
  const [poolRevenueLoading, setPoolRevenueLoading] = useState(false);
  const [poolRevenueError, setPoolRevenueError] = useState<string | null>(null);

  // Fonction pour vérifier si une réservation est payée
  const isPaidReservation = useCallback((reservation: any) => {
    if (!reservation) return false;
    const reservationStatus = reservation.status;
    const transactionStatus = reservation.transaction?.status;
    return (
      reservationStatus === "paid" ||
      transactionStatus === "succeeded" ||
      transactionStatus === "paid" ||
      transactionStatus === "completed"
    );
  }, []);

  // Charger les revenus généraux
  const fetchRevenue = useCallback(async () => {
    setRevenueLoading(true);
    setRevenueError(null);
    
    try {
      const res = await request("/api/dashboard/revenue", { cache: "no-store" });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data?.error || "Impossible de récupérer les revenus Stripe.");
      }
      
      if (process.env.NODE_ENV !== "production") {
        console.log("[Comptabilité] Revenue API response", data);
      }
      setRevenue(data.revenue);
    } catch (error: any) {
      setRevenue(null);
      setRevenueError(error.message || "Erreur de récupération des revenus.");
    } finally {
      setRevenueLoading(false);
    }
  }, [request]);

  // Charger les revenus en attente
  const fetchPendingRevenue = useCallback(async () => {
    setPendingLoading(true);
    setPendingError(null);
    
    try {
      const res = await request("/api/dashboard/revenue/pending", { cache: "no-store" });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data?.error || "Impossible de récupérer les revenus en attente.");
      }
      
      setPendingRevenue({
        total: typeof data?.pending === "number" ? data.pending : 0,
        count: typeof data?.count === "number" ? data.count : 0,
      });
    } catch (error: any) {
      setPendingRevenue(null);
      setPendingError(error.message || "Erreur lors du calcul des revenus en attente.");
    } finally {
      setPendingLoading(false);
    }
  }, [request]);

  // Charger les revenus par piscine
  const fetchPoolRevenue = useCallback(async () => {
    try {
      setPoolRevenueLoading(true);
      setPoolRevenueError(null);
      
      const session = await authClient.getSession();
      if (!session.data?.user?.id) {
        throw new Error("Utilisateur non authentifié");
      }
      
      const res = await request(`/api/pools?includeReservations=true`, { cache: "no-store" });
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Impossible de récupérer les revenus par piscine");
      }
      
      const data = await res.json();
      const poolsData = Array.isArray(data?.pools) ? data.pools : [];
      
      const formatted = poolsData.map((pool: any) => {
        const paidReservations = Array.isArray(pool?.reservations)
          ? pool.reservations.filter(isPaidReservation)
          : [];

        const totalRevenue = paidReservations.reduce(
          (sum: number, reservation: any) => sum + Number(reservation?.amount || 0),
          0
        );

        return {
          id: pool.id,
          title: pool.title,
          totalRevenue,
        };
      });
      
      setPoolsRevenue(formatted);
    } catch (err: any) {
      setPoolRevenueError(err.message || "Erreur lors du chargement des revenus par piscine");
    } finally {
      setPoolRevenueLoading(false);
    }
  }, [request, isPaidReservation]);

  // Charger automatiquement les revenus au montage
  useEffect(() => {
    fetchRevenue();
  }, [fetchRevenue]);

  useEffect(() => {
    fetchPendingRevenue();
  }, [fetchPendingRevenue]);

  const value: ComptabiliteContextType = {
    revenue,
    revenueLoading,
    revenueError,
    fetchRevenue,
    pendingRevenue,
    pendingLoading,
    pendingError,
    fetchPendingRevenue,
    poolsRevenue,
    poolRevenueLoading,
    poolRevenueError,
    fetchPoolRevenue,
  };

  return <ComptabiliteContext.Provider value={value}>{children}</ComptabiliteContext.Provider>;
};

export const useComptabilite = () => {
  const context = useContext(ComptabiliteContext);
  if (!context) {
    throw new Error("useComptabilite doit être utilisé dans un ComptabiliteProvider");
  }
  return context;
};

