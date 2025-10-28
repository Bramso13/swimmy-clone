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
  const [myRequests, setMyRequests] = useState<any[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        const currentUser = session.data?.user || null;
        setUser(currentUser);
        
        if (currentUser) {
          fetchReservations(currentUser.id);
          try {
            const res = await fetch('/api/pools/approvals', { cache: 'no-store' });
            const data = await res.json();
            const all = Array.isArray(data?.requests) ? data.requests : [];
            const mine = all.filter((r: any) => r?.requesterId === currentUser.id);
            setApprovals(mine);
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
        ) : activeTab === 'demandes' ? (
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
