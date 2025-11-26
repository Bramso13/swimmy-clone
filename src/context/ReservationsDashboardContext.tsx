"use client";

import React, { createContext, useCallback, useContext, useState, ReactNode } from "react";
import { useApi } from "./ApiContext";

type ReservationsDashboardContextType = {
  // Approvals (demandes d'annonce)
  approvals: any[];
  approvalsLoading: boolean;
  approvalsError: string | null;
  fetchMyApprovals: (userId?: string) => Promise<void>;
  
  approvalsToValidate: any[];
  approvalsToValidateLoading: boolean;
  fetchApprovalsToValidate: () => Promise<void>;
  
  updateApprovalStatus: (approvalId: string, status: 'approved' | 'rejected') => Promise<boolean>;
  
  // Réservations demandées (pour propriétaire)
  requestedReservations: any[];
  requestedReservationsLoading: boolean;
  requestedReservationsError: string | null;
  fetchRequestedReservations: (userId: string) => Promise<void>;
  
  // Availability Requests (mes demandes de réservation)
  myRequests: any[];
  myRequestsLoading: boolean;
  myRequestsError: string | null;
  fetchMyRequests: () => Promise<void>;
  
  // Comments
  commentsByPool: Record<string, any[]>;
  commentsLoading: Record<string, boolean>;
  fetchComments: (poolId: string) => Promise<void>;
  fetchCommentsForPools: (poolIds: string[]) => Promise<void>;
  
  submitComment: (
    poolId: string,
    reservationId: string | undefined,
    content: string,
    rating: number
  ) => Promise<{ success: boolean; comment?: any; error?: string }>;
  
  sendingCommentByPool: Record<string, boolean>;
  
  // Mettre à jour le statut d'une réservation
  updateReservationStatus: (reservationId: string, status: 'accepted' | 'rejected') => Promise<boolean>;
};

const ReservationsDashboardContext = createContext<ReservationsDashboardContextType | undefined>(undefined);

export const ReservationsDashboardProvider = ({ children }: { children: ReactNode }) => {
  const { request } = useApi();
  
  // État pour les approvals
  const [approvals, setApprovals] = useState<any[]>([]);
  const [approvalsLoading, setApprovalsLoading] = useState(false);
  const [approvalsError, setApprovalsError] = useState<string | null>(null);
  
  const [approvalsToValidate, setApprovalsToValidate] = useState<any[]>([]);
  const [approvalsToValidateLoading, setApprovalsToValidateLoading] = useState(false);
  
  // État pour les réservations demandées
  const [requestedReservations, setRequestedReservations] = useState<any[]>([]);
  const [requestedReservationsLoading, setRequestedReservationsLoading] = useState(false);
  const [requestedReservationsError, setRequestedReservationsError] = useState<string | null>(null);
  
  // État pour les availability requests
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [myRequestsLoading, setMyRequestsLoading] = useState(false);
  const [myRequestsError, setMyRequestsError] = useState<string | null>(null);
  
  // État pour les commentaires
  const [commentsByPool, setCommentsByPool] = useState<Record<string, any[]>>({});
  const [commentsLoading, setCommentsLoading] = useState<Record<string, boolean>>({});
  const [sendingCommentByPool, setSendingCommentByPool] = useState<Record<string, boolean>>({});

  // Charger mes approvals
  const fetchMyApprovals = useCallback(async (userId?: string) => {
    setApprovalsLoading(true);
    setApprovalsError(null);
    
    try {
      const res = await request('/api/pools/approvals', { cache: 'no-store' });
      const data = await res.json();
      
      const all = Array.isArray(data?.requests) ? data.requests : [];
      const mine = userId ? all.filter((r: any) => r?.requesterId === userId) : all;
      setApprovals(mine);
    } catch (error: any) {
      setApprovalsError(error.message || "Erreur lors du chargement des approvals");
    } finally {
      setApprovalsLoading(false);
    }
  }, [request]);

  // Charger les approvals à valider (pour owners)
  const fetchApprovalsToValidate = useCallback(async () => {
    setApprovalsToValidateLoading(true);
    
    try {
      const res = await request('/api/pools/approvals?scope=all&status=pending', { cache: 'no-store' });
      const data = await res.json();
      setApprovalsToValidate(Array.isArray(data?.requests) ? data.requests : []);
    } catch (error: any) {
      console.error("Erreur lors du chargement des approvals à valider:", error);
    } finally {
      setApprovalsToValidateLoading(false);
    }
  }, [request]);

  // Mettre à jour le statut d'un approval
  const updateApprovalStatus = useCallback(async (
    approvalId: string,
    status: 'approved' | 'rejected'
  ): Promise<boolean> => {
    try {
      const res = await request(`/api/pools/approvals/${approvalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      return res.ok;
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      return false;
    }
  }, [request]);

  // Charger les réservations demandées (pour propriétaire)
  const fetchRequestedReservations = useCallback(async (userId: string) => {
    if (!userId) return;
    
    setRequestedReservationsLoading(true);
    setRequestedReservationsError(null);
    
    try {
      const res = await request(`/api/pools?ownerId=${encodeURIComponent(userId)}&includeReservations=true`, {
        cache: 'no-store'
      });
      
      if (!res.ok) {
        throw new Error('Erreur lors du chargement');
      }
      
      const data = await res.json();
      const pools = Array.isArray(data?.pools) ? data.pools : [];
      const allReservations: any[] = [];
      
      pools.forEach((pool: any) => {
        if (Array.isArray(pool.reservations)) {
          pool.reservations.forEach((reservation: any) => {
            allReservations.push({ ...reservation, pool });
          });
        }
      });
      
      // Filtrer pour ne garder que les réservations en attente (pending)
      const pending = allReservations.filter((r: any) => r.status === 'pending');
      setRequestedReservations(pending);
    } catch (error: any) {
      setRequestedReservationsError(error.message || 'Erreur lors du chargement des réservations demandées');
    } finally {
      setRequestedReservationsLoading(false);
    }
  }, [request]);

  // Charger mes demandes de réservation (availability requests)
  const fetchMyRequests = useCallback(async () => {
    setMyRequestsLoading(true);
    setMyRequestsError(null);
    
    try {
      const res = await request('/api/availability/requests?mine=true', { cache: 'no-store' });
      const data = await res.json();
      setMyRequests(Array.isArray(data?.requests) ? data.requests : []);
    } catch (error: any) {
      setMyRequestsError(error.message || "Erreur lors du chargement des demandes");
    } finally {
      setMyRequestsLoading(false);
    }
  }, [request]);

  // Charger les commentaires d'une piscine
  const fetchComments = useCallback(async (poolId: string) => {
    setCommentsLoading((prev) => ({ ...prev, [poolId]: true }));
    
    try {
      const res = await request(`/api/comments?poolId=${encodeURIComponent(poolId)}`, {
        cache: 'no-store'
      });
      const data = await res.json();
      
      setCommentsByPool((prev) => ({
        ...prev,
        [poolId]: Array.isArray(data?.comments) ? data.comments : []
      }));
    } catch (error: any) {
      console.error("Erreur lors du chargement des commentaires:", error);
      setCommentsByPool((prev) => ({ ...prev, [poolId]: [] }));
    } finally {
      setCommentsLoading((prev) => ({ ...prev, [poolId]: false }));
    }
  }, [request]);

  // Charger les commentaires pour plusieurs piscines
  const fetchCommentsForPools = useCallback(async (poolIds: string[]) => {
    if (poolIds.length === 0) return;
    
    const entries = await Promise.all(
      poolIds.map(async (pid) => {
        try {
          const res = await request(`/api/comments?poolId=${encodeURIComponent(pid)}`, {
            cache: 'no-store'
          });
          const data = await res.json();
          return [pid, Array.isArray(data?.comments) ? data.comments : []] as const;
        } catch {
          return [pid, []] as const;
        }
      })
    );
    
    const map: Record<string, any[]> = {};
    for (const [pid, list] of entries) {
      map[pid] = list as any[];
    }
    
    setCommentsByPool((prev) => ({ ...prev, ...map }));
  }, [request]);

  // Publier un commentaire
  const submitComment = useCallback(async (
    poolId: string,
    reservationId: string | undefined,
    content: string,
    rating: number
  ): Promise<{ success: boolean; comment?: any; error?: string }> => {
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      return { success: false, error: "Le commentaire ne peut pas être vide" };
    }
    
    setSendingCommentByPool((prev) => ({ ...prev, [poolId]: true }));
    
    try {
      const res = await request('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poolId, reservationId, content: trimmedContent, rating })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        return { success: false, error: data?.error || 'Échec de l\'envoi' };
      }
      
      // Ajouter le nouveau commentaire à la liste
      setCommentsByPool((prev) => ({
        ...prev,
        [poolId]: [data.comment, ...(prev[poolId] || [])]
      }));
      
      return { success: true, comment: data.comment };
    } catch (error: any) {
      return { success: false, error: error.message || "Erreur lors de la publication" };
    } finally {
      setSendingCommentByPool((prev) => ({ ...prev, [poolId]: false }));
    }
  }, [request]);

  // Mettre à jour le statut d'une réservation
  const updateReservationStatus = useCallback(async (
    reservationId: string,
    status: 'accepted' | 'rejected'
  ): Promise<boolean> => {
    try {
      const res = await request('/api/reservations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reservationId, status })
      });
      
      return res.ok;
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour du statut de la réservation:", error);
      return false;
    }
  }, [request]);

  const value: ReservationsDashboardContextType = {
    approvals,
    approvalsLoading,
    approvalsError,
    fetchMyApprovals,
    approvalsToValidate,
    approvalsToValidateLoading,
    fetchApprovalsToValidate,
    updateApprovalStatus,
    requestedReservations,
    requestedReservationsLoading,
    requestedReservationsError,
    fetchRequestedReservations,
    myRequests,
    myRequestsLoading,
    myRequestsError,
    fetchMyRequests,
    commentsByPool,
    commentsLoading,
    fetchComments,
    fetchCommentsForPools,
    submitComment,
    sendingCommentByPool,
    updateReservationStatus,
  };

  return (
    <ReservationsDashboardContext.Provider value={value}>
      {children}
    </ReservationsDashboardContext.Provider>
  );
};

export const useReservationsDashboard = () => {
  const context = useContext(ReservationsDashboardContext);
  if (!context) {
    throw new Error(
      "useReservationsDashboard doit être utilisé dans un ReservationsDashboardProvider"
    );
  }
  return context;
};

