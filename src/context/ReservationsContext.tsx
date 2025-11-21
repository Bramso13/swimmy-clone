"use client";

import React, { createContext, useCallback, useContext, useState, ReactNode } from "react";
import { CreateReservationData, Reservation } from "./types";

type ReservationsContextType = {
  reservations: Reservation[];
  reservationsLoading: boolean;
  reservationsError: string | null;
  fetchReservations: (userId?: string) => Promise<void>;
  createReservation: (data: CreateReservationData) => Promise<Reservation | null>;
  updateReservationStatus: (id: string, status: string) => Promise<Reservation | null>;
  getReservationById: (id: string) => Reservation | undefined;
  getUserReservations: (userId: string) => Reservation[];
  clearReservationsError: () => void;
};

const ReservationsContext = createContext<ReservationsContextType | undefined>(undefined);

export const ReservationsProvider = ({ children }: { children: ReactNode }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reservationsLoading, setReservationsLoading] = useState(false);
  const [reservationsError, setReservationsError] = useState<string | null>(null);

  const fetchReservations = useCallback(async (userId?: string) => {
    setReservationsLoading(true);
    setReservationsError(null);
    try {
      const url = userId ? `/api/reservations?userId=${userId}` : "/api/reservations";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des réservations");
      }
      const data = await response.json();
      setReservations(Array.isArray(data.reservations) ? data.reservations : []);
    } catch (error: any) {
      setReservationsError(error.message || "Une erreur est survenue");
    } finally {
      setReservationsLoading(false);
    }
  }, []);

  const createReservation = useCallback(async (data: CreateReservationData) => {
    setReservationsLoading(true);
    setReservationsError(null);
    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Erreur lors de la création de la réservation");
      }
      const result = await response.json();
      setReservations((prev) => [...prev, result.reservation]);
      return result.reservation as Reservation;
    } catch (error: any) {
      setReservationsError(error.message || "Une erreur est survenue");
      return null;
    } finally {
      setReservationsLoading(false);
    }
  }, []);

  const updateReservationStatus = useCallback(async (id: string, status: string) => {
    setReservationsLoading(true);
    setReservationsError(null);
    try {
      const response = await fetch("/api/reservations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Erreur lors de la mise à jour");
      }
      const result = await response.json();
      setReservations((prev) => prev.map((reservation) => (reservation.id === result.reservation.id ? result.reservation : reservation)));
      return result.reservation as Reservation;
    } catch (error: any) {
      setReservationsError(error.message || "Une erreur est survenue");
      return null;
    } finally {
      setReservationsLoading(false);
    }
  }, []);

  const getReservationById = useCallback(
    (id: string) => reservations.find((reservation) => reservation.id === id),
    [reservations]
  );

  const getUserReservations = useCallback(
    (userId: string) => reservations.filter((reservation) => reservation.userId === userId),
    [reservations]
  );

  const clearReservationsError = useCallback(() => setReservationsError(null), []);

  const value: ReservationsContextType = {
    reservations,
    reservationsLoading,
    reservationsError,
    fetchReservations,
    createReservation,
    updateReservationStatus,
    getReservationById,
    getUserReservations,
    clearReservationsError,
  };

  return <ReservationsContext.Provider value={value}>{children}</ReservationsContext.Provider>;
};

export const useReservations = () => {
  const context = useContext(ReservationsContext);
  if (!context) {
    throw new Error("useReservations doit être utilisé dans un ReservationsProvider");
  }
  return context;
};


