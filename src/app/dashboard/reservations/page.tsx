"use client";

import React, { useState, useEffect } from "react";
import { useRenter } from "@/context/RenterContext";
import { authClient } from "@/lib/auth-client";

type ReservationStatus = "en-attente" | "acceptees" | "refusees" | "demandes";

const ReservationsPage = () => {
  const [activeTab, setActiveTab] = useState<ReservationStatus>("en-attente");
  const [user, setUser] = useState<any>(null);
  const { reservations, fetchReservations, loading, error } = useRenter();
  const [approvals, setApprovals] = useState<any[]>([]);
  const [approvalsToValidate, setApprovalsToValidate] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [commentsByPool, setCommentsByPool] = useState<Record<string, any[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const fetchMyApprovals = async (currentUserId?: string) => {
    try {
      const res = await fetch('/api/pools/approvals', { cache: 'no-store' });
      const data = await res.json();
      const all = Array.isArray(data?.requests) ? data.requests : [];
      const mine = currentUserId ? all.filter((r: any) => r?.requesterId === currentUserId) : all;
      setApprovals(mine);
    } catch {}
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        const currentUser = session.data?.user || null;
        setUser(currentUser);
        
        if (currentUser) {
          fetchReservations(currentUser.id);
          await fetchMyApprovals(currentUser.id);
          // Si owner, charger aussi les demandes à valider
          try {
            const resAll = await fetch('/api/pools/approvals?scope=all&status=pending', { cache: 'no-store' });
            const dataAll = await resAll.json();
            setApprovalsToValidate(Array.isArray(dataAll?.requests) ? dataAll.requests : []);
          } catch {}

          // Charger mes demandes de réservation (availability requests)
          try {
            const resMine = await fetch('/api/availability/requests?mine=true', { cache: 'no-store' });
            const dataMine = await resMine.json();
            setMyRequests(Array.isArray(dataMine?.requests) ? dataMine.requests : []);
          } catch {}
        }
      } catch (error) {
        console.error("Erreur de vérification d'authentification:", error);
      }
    };

    checkAuth();
  }, [fetchReservations]);

  // Rafraîchir automatiquement les demandes d'annonce quand l'onglet "demandes" est actif
  useEffect(() => {
    if (activeTab !== 'demandes' || !user?.id) return;
    let cancelled = false;

    const refresh = async () => {
      await fetchMyApprovals(user.id);
      try {
        const resAll = await fetch('/api/pools/approvals?scope=all&status=pending', { cache: 'no-store' });
        const dataAll = await resAll.json();
        setApprovalsToValidate(Array.isArray(dataAll?.requests) ? dataAll.requests : []);
      } catch {}
    };

    // Premier chargement + polling léger
    refresh();
    const id = setInterval(refresh, 10000); // toutes les 10s

    // Rafraîchit au focus de la fenêtre
    const onFocus = () => { refresh(); };
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', onFocus);
    }

    return () => {
      if (cancelled) return;
      clearInterval(id);
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', onFocus);
      }
      cancelled = true;
    };
  }, [activeTab, user?.id]);

  // Charger les commentaires pour les piscines visibles dans l'onglet "Acceptées"
  useEffect(() => {
    if (activeTab !== 'acceptees') return;
    const accepted = myRequests.filter(r => r.status === 'approved' || r.status === 'accepted');
    const uniquePoolIds = Array.from(new Set(accepted.map((r) => r.pool?.id).filter(Boolean)));
    if (uniquePoolIds.length === 0) return;

    const load = async () => {
      const entries = await Promise.all(uniquePoolIds.map(async (pid) => {
        try {
          const res = await fetch(`/api/comments?poolId=${encodeURIComponent(pid as string)}`, { cache: 'no-store' });
          const data = await res.json();
          return [pid as string, Array.isArray(data?.comments) ? data.comments : []] as const;
        } catch {
          return [pid as string, []] as const;
        }
      }));
      const map: Record<string, any[]> = {};
      for (const [pid, list] of entries) map[pid] = list as any[];
      setCommentsByPool(map);
    };
    load();
  }, [activeTab, myRequests]);

  const submitComment = async (poolId: string, reservationId?: string) => {
    const content = (commentInputs[poolId] || '').trim();
    if (!content) return;
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poolId, reservationId, content })
      });
      if (!res.ok) return;
      const data = await res.json();
      setCommentsByPool((prev) => ({
        ...prev,
        [poolId]: [data.comment, ...(prev[poolId] || [])]
      }));
      setCommentInputs((prev) => ({ ...prev, [poolId]: '' }));
    } catch {}
  };

  const getFilteredReservations = () => {
    if (!user) return [];
    
    const now = new Date();
    return reservations.filter(reservation => {
      const startDate = new Date(reservation.startDate);
      const endDate = new Date(reservation.endDate);
      
      switch (activeTab) {
        case "en-attente":
          return reservation.status === "pending";
        case "acceptees":
          return reservation.status === "accepted";
        case "refusees":
          return reservation.status === "rejected" || reservation.status === "refused";
        default:
          return false;
      }
    });
  };

  const getEmptyStateMessage = () => {
    switch (activeTab) {
      case "en-attente":
        return "Vous n'avez pas de réservations en attente.";
      case "acceptees":
        return "Vous n'avez pas de réservations acceptées.";
      case "refusees":
        return "Vous n'avez pas de réservations refusées.";
      default:
        return "Aucune réservation trouvée.";
    }
  };

  const sidebarItems = [
    { key: "en-attente", label: "En attente" },
    { key: "acceptees", label: "Acceptées" },
    { key: "refusees", label: "Refusées" },
    { key: "demandes", label: "Demandes d'annonce" },
  ];

  const filteredReservations = getFilteredReservations();
  const approvalsForTab = approvals.filter((r) => {
    if (activeTab !== 'demandes') return false;
    return true; // afficher toutes les demandes dans l'onglet dédié
  });
  const showApprovals = approvalsForTab.length > 0;

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <div className="w-80 bg-gray-100 border-r border-gray-300">
        <div className="p-8">
          {/* Titre */}
          <h1 className="text-3xl font-bold text-gray-800 leading-tight mb-8">
            <span className="block">Mes</span>
            <span className="block">réservations</span>
          </h1>

          {/* Navigation */}
          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key as ReservationStatus)}
                className={`w-full text-left py-3 px-4 text-gray-700 hover:bg-gray-200 rounded-md transition-colors ${
                  activeTab === item.key 
                    ? "font-semibold text-gray-900 bg-gray-200" 
                    : "font-normal"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 bg-white p-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Chargement...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-red-500">Erreur: {error}</div>
          </div>
        ) : (activeTab as any) === 'demandes' ? (
          showApprovals ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Vos demandes d'annonce</h2>
              {approvalsForTab.map((req) => (
                <div
                  key={req.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {req.title || 'Annonce proposée'}
                      </h3>
                      {req.address && (
                        <p className="text-gray-600">{req.address}</p>
                      )}
                      <p className="text-gray-500 text-sm">
                        Soumise le {req.createdAt ? new Date(req.createdAt).toLocaleDateString('fr-FR') : '—'}
                      </p>
                    </div>
                    <div className="text-right">
                      {req.status === 'pending' && (
                        <div className="text-sm px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">En attente de validation</div>
                      )}
                      {req.status === 'approved' && (
                        <div className="text-sm px-2 py-1 rounded-full bg-green-100 text-green-800">Approuvée</div>
                      )}
                      {req.status === 'rejected' && (
                        <div className="text-sm px-2 py-1 rounded-full bg-red-100 text-red-800">Refusée</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-start justify-start pt-4">
              <p className="text-gray-500 text-lg">Vous n'avez pas de demandes d'annonce.</p>
            </div>
          )
        ) : (activeTab === 'en-attente' && myRequests.filter(r => r.status === 'pending').length === 0 && filteredReservations.length === 0) ? (
          <div className="flex items-start justify-start pt-4">
            <p className="text-gray-500 text-lg">
              {getEmptyStateMessage()}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTab === 'en-attente' && (
              <div className="space-y-3">
                {myRequests.filter(r => r.status === 'pending').map((req) => (
                  <div key={req.id} className="border border-gray-200 rounded-lg p-6 bg-yellow-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Demande de réservation</h3>
                        <p className="text-gray-600">{req.pool?.title}</p>
                        <p className="text-gray-500 text-sm">Soumise le {req.createdAt ? new Date(req.createdAt).toLocaleDateString('fr-FR') : '—'}</p>
                      </div>
                      <div className="text-sm px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">En attente</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'acceptees' && (
              <div className="space-y-3">
                {myRequests.filter(r => r.status === 'approved' || r.status === 'accepted').map((req) => (
                  <div key={req.id} className="border border-gray-200 rounded-lg p-6 bg-green-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Demande de réservation</h3>
                        <p className="text-gray-600">{req.pool?.title}</p>
                        <p className="text-gray-500 text-sm">Soumise le {req.createdAt ? new Date(req.createdAt).toLocaleDateString('fr-FR') : '—'}</p>
                      </div>
                      <div className="text-sm px-2 py-1 rounded-full bg-green-100 text-green-800">Acceptée</div>
                    </div>
                    {/* Liste des commentaires de la piscine */}
                    {req.pool?.id && (
                      <div className="mt-4 space-y-2">
                        <div className="text-sm font-semibold text-gray-800">Commentaires</div>
                        <div className="space-y-2">
                          {(commentsByPool[req.pool.id] || []).map((c) => (
                            <div key={c.id} className="text-sm text-gray-800 bg-white border border-gray-200 rounded p-2">
                              <div className="font-medium">{c.author?.name || c.author?.email || 'Utilisateur'}</div>
                              <div>{c.content}</div>
                              <div className="text-xs text-gray-500">{c.createdAt ? new Date(c.createdAt).toLocaleString('fr-FR') : ''}</div>
                            </div>
                          ))}
                          {(!commentsByPool[req.pool.id] || commentsByPool[req.pool.id].length === 0) && (
                            <div className="text-sm text-gray-500">Aucun commentaire pour cette piscine.</div>
                          )}
                        </div>
                        {/* Formulaire d'ajout */}
                        <div className="flex items-start gap-2 mt-2">
                          <textarea
                            className="flex-1 border border-gray-300 rounded p-2 text-sm"
                            placeholder="Ajouter un commentaire..."
                            value={commentInputs[req.pool.id] || ''}
                            onChange={(e) => setCommentInputs((prev) => ({ ...prev, [req.pool.id]: e.target.value }))}
                          />
                          <button
                            onClick={() => submitComment(req.pool.id, req.id)}
                            className="px-3 py-2 rounded bg-blue-600 text-white text-sm"
                          >
                            Publier
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'refusees' && (
              <div className="space-y-3">
                {myRequests.filter(r => r.status === 'rejected' || r.status === 'refused').map((req) => (
                  <div key={req.id} className="border border-gray-200 rounded-lg p-6 bg-red-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Demande de réservation</h3>
                        <p className="text-gray-600">{req.pool?.title}</p>
                        <p className="text-gray-500 text-sm">Soumise le {req.createdAt ? new Date(req.createdAt).toLocaleDateString('fr-FR') : '—'}</p>
                      </div>
                      <div className="text-sm px-2 py-1 rounded-full bg-red-100 text-red-800">Refusée</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'demandes' && approvalsToValidate.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">À valider (owners)</h3>
                {approvalsToValidate.map((req) => (
                  <div key={req.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">{req.title || 'Annonce proposée'}</div>
                        {req.address && <div className="text-gray-600 text-sm">{req.address}</div>}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={async () => {
                          await fetch(`/api/pools/approvals/${req.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'approved' }) });
                          // rafraîchir
                          const resAll = await fetch('/api/pools/approvals?scope=all&status=pending', { cache: 'no-store' });
                          const dataAll = await resAll.json();
                          setApprovalsToValidate(Array.isArray(dataAll?.requests) ? dataAll.requests : []);
                          await fetchMyApprovals(user?.id);
                        }} className="px-3 py-1 rounded bg-green-600 text-white text-sm">Approuver</button>
                        <button onClick={async () => {
                          await fetch(`/api/pools/approvals/${req.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'rejected' }) });
                          const resAll = await fetch('/api/pools/approvals?scope=all&status=pending', { cache: 'no-store' });
                          const dataAll = await resAll.json();
                          setApprovalsToValidate(Array.isArray(dataAll?.requests) ? dataAll.requests : []);
                          await fetchMyApprovals(user?.id);
                        }} className="px-3 py-1 rounded bg-red-600 text-white text-sm">Refuser</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {filteredReservations.map((reservation) => (
              <div
                key={reservation.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {reservation.pool?.title || "Piscine"}
                    </h3>
                    <p className="text-gray-600">
                      {new Date(reservation.startDate).toLocaleDateString('fr-FR')} - 
                      {new Date(reservation.endDate).toLocaleDateString('fr-FR')}
                    </p>
                    <p className="text-gray-500">
                      {reservation.pool?.address}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      {reservation.amount}€
                    </div>
                    <div className={`text-sm px-2 py-1 rounded-full ${
                      reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      reservation.status === 'paid' ? 'bg-green-100 text-green-800' :
                      reservation.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                      (reservation.status === 'rejected' || reservation.status === 'refused') ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {reservation.status === 'pending' ? 'En attente' :
                       reservation.status === 'paid' ? 'Confirmée' :
                       reservation.status === 'accepted' ? 'Acceptée' :
                       (reservation.status === 'rejected' || reservation.status === 'refused') ? 'Refusée' :
                       reservation.status}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationsPage;
