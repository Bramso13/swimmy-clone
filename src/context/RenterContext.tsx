"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

// Types
interface Pool {
  id: string;
  title: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  photos: string[];
  pricePerHour: number;
  availability: any;
  rules?: string[];
  extras?: any;
  additional?: any;
  owner?: {
    id: string;
    name: string | null;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Reservation {
  id: string;
  poolId: string;
  userId: string;
  startDate: string;
  endDate: string;
  amount: number;
  status: string;
  pool?: Pool;
  transaction?: Transaction;
  createdAt: string;
  updatedAt: string;
}

interface Transaction {
  id: string;
  reservationId: string;
  userId: string;
  mangopayId: string | null;
  status: string;
  amount: number;
  createdAt: string;
}

interface CreateReservationData {
  poolId: string;
  userId: string;
  startDate: string;
  endDate: string;
  amount: number;
}

interface InitiatePaymentData {
  reservationId: string;
  userId: string;
  amount: number;
}

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

interface RenterProviderProps {
  children: ReactNode;
}

export const RenterProvider: React.FC<RenterProviderProps> = ({ children }) => {
  const [pools, setPools] = useState<Pool[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour récupérer toutes les piscines
  const fetchPools = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/pools");
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des piscines");
      }
      const data = await response.json();
      setPools(data.pools || []);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction pour obtenir une piscine par ID
  const getPoolById = useCallback(
    (id: string) => {
      return pools.find((pool) => pool.id === id);
    },
    [pools]
  );

  // Fonction pour rechercher des piscines
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

  // Fonction pour récupérer les réservations
  const fetchReservations = useCallback(async (userId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = userId ? `/api/reservations?userId=${userId}` : "/api/reservations";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des réservations");
      }
      const data = await response.json();
      setReservations(data.reservations || []);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction pour créer une réservation
  const createReservation = useCallback(async (data: CreateReservationData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la création de la réservation");
      }
      const result = await response.json();
      const newReservation = result.reservation;
      setReservations((prev) => [...prev, newReservation]);
      return newReservation;
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction pour mettre à jour le statut d'une réservation
  const updateReservationStatus = useCallback(async (id: string, status: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/reservations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la mise à jour");
      }
      const result = await response.json();
      const updated = result.reservation as Reservation;
      setReservations((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      return updated;
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction pour obtenir une réservation par ID
  const getReservationById = useCallback(
    (id: string) => {
      return reservations.find((reservation) => reservation.id === id);
    },
    [reservations]
  );

  // Fonction pour obtenir les réservations d'un utilisateur
  const getUserReservations = useCallback(
    (userId: string) => {
      return reservations.filter((reservation) => reservation.userId === userId);
    },
    [reservations]
  );

  // Fonction pour initier un paiement
  const initiatePayment = useCallback(async (data: InitiatePaymentData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de l'initiation du paiement");
      }
      const result = await response.json();
      const transaction = result.transaction;
      
      // Mettre à jour la réservation locale avec la transaction
      setReservations((prev) =>
        prev.map((res) =>
          res.id === data.reservationId
            ? { ...res, transaction }
            : res
        )
      );
      
      return transaction;
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction pour effacer les erreurs
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: RenterContextType = {
    pools,
    reservations,
    loading,
    error,
    fetchPools,
    getPoolById,
    searchPools,
    fetchReservations,
    createReservation,
    updateReservationStatus,
    getReservationById,
    getUserReservations,
    initiatePayment,
    clearError,
  };

  return <RenterContext.Provider value={value}>{children}</RenterContext.Provider>;
};

// Hook personnalisé pour utiliser le contexte
export const useRenter = () => {
  const context = useContext(RenterContext);
  if (context === undefined) {
    throw new Error("useRenter doit être utilisé à l'intérieur d'un RenterProvider");
  }
  return context;
};
