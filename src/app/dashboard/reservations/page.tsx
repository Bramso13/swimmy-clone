"use client";

import React, { useState, useEffect } from "react";
import { useRenter } from "@/context/RenterContext";
import { authClient } from "@/lib/auth-client";

type ReservationStatus = "en-attente" | "a-venir" | "passees" | "autres";

const ReservationsPage = () => {
  const [activeTab, setActiveTab] = useState<ReservationStatus>("en-attente");
  const [user, setUser] = useState<any>(null);
  const { reservations, fetchReservations, loading, error } = useRenter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        const currentUser = session.data?.user || null;
        setUser(currentUser);
        
        if (currentUser) {
          fetchReservations(currentUser.id);
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
        case "a-venir":
          return reservation.status === "paid" && startDate > now;
        case "passees":
          return endDate < now;
        case "autres":
          return !["pending", "paid"].includes(reservation.status);
        default:
          return false;
      }
    });
  };

  const getEmptyStateMessage = () => {
    switch (activeTab) {
      case "en-attente":
        return "Vous n'avez pas de réservations en attente.";
      case "a-venir":
        return "Vous n'avez pas de réservations à venir.";
      case "passees":
        return "Vous n'avez pas de réservations passées.";
      case "autres":
        return "Vous n'avez pas d'autres réservations.";
      default:
        return "Aucune réservation trouvée.";
    }
  };

  const sidebarItems = [
    { key: "en-attente", label: "En attente" },
    { key: "a-venir", label: "À venir" },
    { key: "passees", label: "Passées" },
    { key: "autres", label: "Autres" },
  ];

  const filteredReservations = getFilteredReservations();

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
        ) : filteredReservations.length === 0 ? (
          <div className="flex items-start justify-start pt-4">
            <p className="text-gray-500 text-lg">
              {getEmptyStateMessage()}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
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
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {reservation.status === 'pending' ? 'En attente' :
                       reservation.status === 'paid' ? 'Confirmée' :
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
