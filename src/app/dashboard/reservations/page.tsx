"use client";

import React, { useState, useEffect } from "react";
import { useRenter } from "@/context/RenterContext";
import { useNotification } from "@/context/NotificationContext";
import { useReservationsDashboard } from "@/context/ReservationsDashboardContext";
import { authClient } from "@/lib/auth-client";

type ReservationStatus = "en-attente" | "acceptees" | "refusees" | "demandes" | "reservations-demandees";

const ReservationsPage = () => {
  const [activeTab, setActiveTab] = useState<ReservationStatus>("en-attente");
  const [user, setUser] = useState<any>(null);
  const { reservations, fetchReservations, loading, error } = useRenter();
  const { success, error: notifyError } = useNotification();
  const {
    approvals,
    fetchMyApprovals,
    approvalsToValidate,
    fetchApprovalsToValidate,
    updateApprovalStatus,
    requestedReservations,
    requestedReservationsLoading,
    fetchRequestedReservations,
    myRequests,
    fetchMyRequests,
    commentsByPool,
    fetchCommentsForPools,
    submitComment,
    sendingCommentByPool,
    updateReservationStatus,
  } = useReservationsDashboard();
  
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [feedbackByPool, setFeedbackByPool] = useState<Record<string, { type: 'success' | 'error'; text: string } | undefined>>({});
  const [ratingByPool, setRatingByPool] = useState<Record<string, number>>({});
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        const currentUser = session.data?.user || null;
        setUser(currentUser);
        
        if (currentUser) {
          fetchReservations(currentUser.id);
          await fetchMyApprovals(currentUser.id);
          await fetchRequestedReservations(currentUser.id);
          await fetchApprovalsToValidate();
          await fetchMyRequests();
        }
      } catch (error) {
        console.error("Erreur de vérification d'authentification:", error);
      }
    };

    checkAuth();
  }, [fetchReservations, fetchMyApprovals, fetchRequestedReservations, fetchApprovalsToValidate, fetchMyRequests]);

  // Rafraîchir automatiquement les demandes d'annonce quand l'onglet "demandes" est actif
  useEffect(() => {
    if (activeTab !== 'demandes' || !user?.id) return;
    let cancelled = false;

    const refresh = async () => {
      await fetchMyApprovals(user.id);
      await fetchApprovalsToValidate();
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
  }, [activeTab, fetchMyApprovals, fetchApprovalsToValidate, user?.id]);

  // Rafraîchir automatiquement les réservations demandées quand l'onglet correspondant est actif
  useEffect(() => {
    if (activeTab !== 'reservations-demandees' || !user?.id) return;
    let cancelled = false;

    const refresh = async () => {
      await fetchRequestedReservations(user.id);
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
  }, [activeTab, fetchRequestedReservations, user?.id]);

  // Charger les commentaires pour les piscines visibles dans l'onglet "Acceptées"
  useEffect(() => {
    if (activeTab !== 'acceptees') return;
    const accepted = myRequests.filter(r => r.status === 'approved' || r.status === 'accepted');
    const uniquePoolIds = Array.from(new Set(accepted.map((r) => r.pool?.id).filter(Boolean))) as string[];
    if (uniquePoolIds.length === 0) return;
    
    fetchCommentsForPools(uniquePoolIds);
  }, [activeTab, myRequests, fetchCommentsForPools]);

  const handleSubmitComment = async (poolId: string, reservationId?: string) => {
    const content = commentInputs[poolId] || '';
    const rating = ratingByPool[poolId] || 5;
    
    setFeedbackByPool((prev) => ({ ...prev, [poolId]: undefined }));
    
    const result = await submitComment(poolId, reservationId, content, rating);
    
    if (result.success) {
      setCommentInputs((prev) => ({ ...prev, [poolId]: '' }));
      setRatingByPool((prev) => ({ ...prev, [poolId]: 5 }));
      setFeedbackByPool((prev) => ({ ...prev, [poolId]: { type: 'success', text: 'Commentaire publié' } }));
      success("Commentaire publié", "Votre commentaire a été ajouté avec succès");
    } else {
      setFeedbackByPool((prev) => ({ ...prev, [poolId]: { type: 'error', text: result.error || 'Échec de l\'envoi' } }));
      notifyError("Erreur", result.error || "Impossible de publier le commentaire");
    }
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
    { key: "reservations-demandees", label: "Réservations demandées" },
    { key: "demandes", label: "Demandes d'annonce" },
  ];

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handle = () => setIsMobile(mq.matches);
    handle();
    mq.addEventListener("change", handle);
    return () => mq.removeEventListener("change", handle);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setShowSidebar(false);
    }
  }, [isMobile]);

  const SidebarContent = (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 leading-tight mb-8">
        <span className="block">Mes</span>
        <span className="block">réservations</span>
      </h1>
      <nav className="space-y-1">
        {sidebarItems.map((item) => (
          <button
            key={item.key}
            onClick={() => {
              setActiveTab(item.key as ReservationStatus);
              if (isMobile) setShowSidebar(false);
            }}
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
  );

  const filteredReservations = getFilteredReservations();
  const approvalsForTab = approvals.filter((r) => {
    if (activeTab !== 'demandes') return false;
    return true; // afficher toutes les demandes dans l'onglet dédié
  });
  const showApprovals = approvalsForTab.length > 0;

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      {!isMobile && (
        <div className="w-80 bg-gray-100 border-r border-gray-300">
          {SidebarContent}
        </div>
      )}

      {/* Contenu principal */}
      <div className="flex-1 bg-white p-4 sm:p-8">
        {isMobile && (
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowSidebar(true)}
              className="px-4 py-2 rounded-full border border-gray-300 bg-white"
            >
              ☰
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Mes réservations</h1>
          </div>
        )}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Chargement...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-red-500">Erreur: {error}</div>
          </div>
        ) : (activeTab as any) === 'reservations-demandees' ? (
          requestedReservationsLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Chargement...</div>
            </div>
          ) : requestedReservations.length === 0 ? (
            <div className="flex items-start justify-start pt-4">
              <p className="text-gray-500 text-lg">Aucune réservation demandée pour vos piscines.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Réservations demandées pour vos piscines</h2>
              {requestedReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="border border-gray-200 rounded-lg p-6 bg-yellow-50 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {reservation.pool?.title || "Piscine"}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        Demande de réservation du {new Date(reservation.startDate).toLocaleDateString('fr-FR')} au {new Date(reservation.endDate).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        {reservation.pool?.address}
                      </p>
                      <p className="text-gray-700 mt-2">
                        <span className="font-medium">Locataire:</span> {reservation.user?.name || reservation.user?.email || 'Non renseigné'}
                      </p>
                      <p className="text-gray-700 mt-1">
                        <span className="font-medium">Montant:</span> {reservation.amount}€
                      </p>
                      <p className="text-gray-500 text-xs mt-2">
                        Demandée le {new Date(reservation.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 mb-3">En attente</div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={async () => {
                        const success_update = await updateReservationStatus(reservation.id, 'accepted');
                        if (success_update) {
                          success("Réservation acceptée", "Un email de paiement a été envoyé au locataire");
                          await fetchRequestedReservations(user?.id);
                        } else {
                          notifyError("Erreur", "Impossible d'accepter la réservation");
                        }
                      }}
                      className="px-4 py-2 rounded bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      Accepter
                    </button>
                    <button
                      onClick={async () => {
                        const success_update = await updateReservationStatus(reservation.id, 'rejected');
                        if (success_update) {
                          success("Réservation refusée", "Le locataire a été notifié");
                          await fetchRequestedReservations(user?.id);
                        } else {
                          notifyError("Erreur", "Impossible de refuser la réservation");
                        }
                      }}
                      className="px-4 py-2 rounded bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
                    >
                      Refuser
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
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
                          {/* Sélecteur d'étoiles */}
                          <div className="flex items-center gap-1 pt-2">
                            {[1,2,3,4,5].map((n) => (
                              <button
                                key={n}
                                type="button"
                                onClick={() => setRatingByPool((prev) => ({ ...prev, [req.pool.id]: n }))}
                                className={`text-lg ${ (ratingByPool[req.pool.id] || 5) >= n ? 'text-yellow-500' : 'text-gray-300'}`}
                                aria-label={`${n} étoile${n>1?'s':''}`}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                          <button
                            onClick={() => handleSubmitComment(req.pool.id)}
                            disabled={!!sendingCommentByPool[req.pool.id]}
                            className="px-3 py-2 rounded bg-blue-600 text-white text-sm"
                          >
                            {sendingCommentByPool[req.pool.id] ? 'Envoi...' : 'Publier'}
                          </button>
                        </div>
                        {feedbackByPool[req.pool.id] && (
                          <div className={`text-xs mt-1 ${feedbackByPool[req.pool.id]?.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                            {feedbackByPool[req.pool.id]?.text}
                          </div>
                        )}
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
                          const success_update = await updateApprovalStatus(req.id, 'approved');
                          if (success_update) {
                            success("Annonce approuvée", "La piscine est maintenant visible sur le site");
                            await fetchApprovalsToValidate();
                            await fetchMyApprovals(user?.id);
                          } else {
                            notifyError("Erreur", "Impossible d'approuver l'annonce");
                          }
                        }} className="px-3 py-1 rounded bg-green-600 text-white text-sm">Approuver</button>
                        <button onClick={async () => {
                          const success_update = await updateApprovalStatus(req.id, 'rejected');
                          if (success_update) {
                            success("Annonce refusée", "Le créateur a été notifié");
                            await fetchApprovalsToValidate();
                            await fetchMyApprovals(user?.id);
                          } else {
                            notifyError("Erreur", "Impossible de refuser l'annonce");
                          }
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

      {isMobile && showSidebar && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowSidebar(false)} />
          <div className="absolute top-0 left-0 h-full w-4/5 max-w-sm bg-white border-r border-gray-300 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Navigation</h2>
              <button onClick={() => setShowSidebar(false)} className="text-2xl text-gray-500">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {SidebarContent}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationsPage;
