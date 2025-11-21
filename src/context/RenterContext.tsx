"use client";

import React, { createContext, useContext, ReactNode, useMemo } from "react";
import { PoolsProvider, usePools } from "./PoolsContext";
import { ReservationsProvider, useReservations } from "./ReservationsContext";
import { PaymentsProvider, usePayments } from "./PaymentsContext";
import { CreateReservationData, InitiatePaymentData, Pool, Reservation, Transaction } from "./types";

interface RenterContextType {
  // État
  pools: Pool[];
  reservations: Reservation[];
  loading: boolean;
  error: string | null;

  // Fonctions pour les piscines
  fetchPools: () => Promise<void>;
  getPoolById: (id: string) => Pool | undefined;
  searchPools: (query: string) => Pool[];

  // Fonctions pour les réservations
  fetchReservations: (userId?: string) => Promise<void>;
  createReservation: (data: CreateReservationData) => Promise<Reservation | null>;
  updateReservationStatus: (id: string, status: string) => Promise<Reservation | null>;
  getReservationById: (id: string) => Reservation | undefined;
  getUserReservations: (userId: string) => Reservation[];

  // Fonctions pour les paiements
  initiatePayment: (data: InitiatePaymentData) => Promise<Transaction | null>;

  // Fonction de réinitialisation
  clearError: () => void;
}

const RenterContext = createContext<RenterContextType | undefined>(undefined);

const RenterBridgeProvider = ({ children }: { children: ReactNode }) => {
  const poolsCtx = usePools();
  const reservationsCtx = useReservations();
  const paymentsCtx = usePayments();

  const value = useMemo<RenterContextType>(() => {
    const loading = poolsCtx.poolsLoading || reservationsCtx.reservationsLoading || paymentsCtx.paymentLoading;
    const error = poolsCtx.poolsError || reservationsCtx.reservationsError || paymentsCtx.paymentError;

    return {
      pools: poolsCtx.pools,
      reservations: reservationsCtx.reservations,
      loading,
      error,
      fetchPools: poolsCtx.fetchPools,
      getPoolById: poolsCtx.getPoolById,
      searchPools: poolsCtx.searchPools,
      fetchReservations: reservationsCtx.fetchReservations,
      createReservation: reservationsCtx.createReservation,
      updateReservationStatus: reservationsCtx.updateReservationStatus,
      getReservationById: reservationsCtx.getReservationById,
      getUserReservations: reservationsCtx.getUserReservations,
      initiatePayment: paymentsCtx.initiatePayment,
      clearError: () => {
        poolsCtx.clearPoolsError();
        reservationsCtx.clearReservationsError();
        paymentsCtx.clearPaymentError();
      },
    };
  }, [poolsCtx, reservationsCtx, paymentsCtx]);

  return <RenterContext.Provider value={value}>{children}</RenterContext.Provider>;
};

interface RenterProviderProps {
  children: ReactNode;
}

export const RenterProvider: React.FC<RenterProviderProps> = ({ children }) => {
  return (
    <PoolsProvider>
      <ReservationsProvider>
        <PaymentsProvider>
          <RenterBridgeProvider>{children}</RenterBridgeProvider>
        </PaymentsProvider>
      </ReservationsProvider>
    </PoolsProvider>
  );
};

export const useRenter = () => {
  const context = useContext(RenterContext);
  if (!context) {
    throw new Error("useRenter doit être utilisé à l'intérieur d'un RenterProvider");
  }
  return context;
};
