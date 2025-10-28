"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

interface Pool {
  id: string;
  title: string;
  address: string;
  pricePerHour: number;
  reservations: Reservation[];
}

interface Reservation {
  id: string;
  startDate: string;
  endDate: string;
  status: string;
  amount: number;
  user: {
    name?: string;
    email: string;
  };
}

export default function AvailabilityPage() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [poolApprovals, setPoolApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Vérifier l'authentification
        const session = await authClient.getSession();
        const authUser = session.data?.user;
        
        if (!authUser) {
          window.location.href = "/login";
          return;
        }

        // Récupérer les informations complètes de l'utilisateur avec le rôle
        const userResponse = await fetch(`/api/users/${authUser.id}`);
        if (!userResponse.ok) {
          throw new Error("Impossible de récupérer les informations utilisateur");
        }
        
        const userData = await userResponse.json();
        setUser(userData.user);

        // Vérifier si l'utilisateur est owner
        if (userData.user.role !== "owner") {
          setError("Accès non autorisé. Cette page est réservée aux propriétaires.");
          setLoading(false);
          return;
        }

        // Récupérer les piscines du propriétaire avec leurs réservations
        const response = await fetch(
          `/api/pools?includeReservations=true&ownerId=${userData.user.id}`
        );
        if (!response.ok) {
          throw new Error("Erreur lors du chargement des données");
        }

        const data = await response.json();
        setPools(data.pools || []);

        // Charger les demandes de disponibilité pour cet owner
        const reqRes = await fetch(`/api/availability/requests?ownerId=${userData.user.id}`);
        if (reqRes.ok) {
          const reqJson = await reqRes.json();
          setRequests(reqJson.requests || []);
        }

        // Charger les demandes d'approbation de piscines (toutes les pending pour owner)
        const apprRes = await fetch(`/api/pools/approvals?scope=all&status=pending`);
        if (apprRes.ok) {
          const apprJson = await apprRes.json();
          setPoolApprovals(apprJson.requests || []);
        }
      } catch (err: any) {
        setError(err.message || "Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "paid":
        return "Payée";
      case "pending":
        return "En attente";
      case "cancelled":
        return "Annulée";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-800 dark:text-red-400 mb-2">
              Erreur
            </h2>
            <p className="text-red-700 dark:text-red-300">{error}</p>
            <Link
              href="/dashboard"
              className="inline-block mt-4 text-red-600 dark:text-red-400 hover:underline"
            >
              ← Retour au tableau de bord
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block"
          >
            ← Retour au tableau de bord
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            📅 Vérifier la disponibilité
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gérez les demandes de disponibilité envoyées par les utilisateurs
          </p>
        </div>

        {/* Bloc demandes d'approbation de piscines */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Demandes d'approbation d'annonces</h2>
          {poolApprovals.length === 0 ? (
            <div className="text-gray-600 dark:text-gray-400">Aucune demande pour le moment.</div>
          ) : (
            <div className="space-y-3">
              {poolApprovals.map((p) => (
                <div key={p.id} className="border rounded-lg p-4 bg-white dark:bg-gray-800 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="font-semibold">{p.title || "Annonce sans titre"}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{p.address}</div>
                    <div className="text-xs text-gray-500">{p.pricePerHour ?? 0}€ / heure</div>
                    <div className="text-xs">Statut: <span className="font-medium">{p.status}</span></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        await fetch(`/api/pools/approvals/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "approved" }) });
                        setPoolApprovals((prev) => prev.filter((x) => x.id !== p.id));
                      }}
                      className="px-3 py-2 rounded bg-emerald-600 text-white text-sm"
                    >
                      Accepter
                    </button>
                    <button
                      onClick={async () => {
                        await fetch(`/api/pools/approvals/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "rejected" }) });
                        setPoolApprovals((prev) => prev.filter((x) => x.id !== p.id));
                      }}
                      className="px-3 py-2 rounded bg-red-600 text-white text-sm"
                    >
                      Refuser
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bloc demandes de disponibilité */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Demandes de disponibilité</h2>
          {requests.length === 0 ? (
            <div className="text-gray-600 dark:text-gray-400">Aucune demande pour le moment.</div>
          ) : (
            <div className="space-y-3">
              {requests.map((r) => (
                <div key={r.id} className="border rounded-lg p-4 bg-white dark:bg-gray-800 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="font-semibold">{r.pool?.title}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(r.date).toLocaleDateString("fr-FR")} • {r.startTime} → {r.endTime}
                    </div>
                    <div className="text-xs text-gray-500">
                      {r.adults} adultes • {r.children} enfants • {r.babies} bébés
                    </div>
                    <div className="text-xs">Statut: <span className="font-medium">{r.status}</span></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Message à envoyer…"
                      onChange={(e) => ((r as any).__msg = e.target.value)}
                      className="border rounded-md px-2 py-1 text-sm"
                    />
                    <button
                      onClick={async () => {
                        await fetch(`/api/availability/requests/${r.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "approved", message: (r as any).__msg }) });
                        setRequests((prev) => prev.filter((x) => x.id !== r.id));
                      }}
                      className="px-3 py-2 rounded bg-emerald-600 text-white text-sm"
                    >
                      Oui, disponible
                    </button>
                    <button
                      onClick={async () => {
                        await fetch(`/api/availability/requests/${r.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "rejected", message: (r as any).__msg }) });
                        setRequests((prev) => prev.filter((x) => x.id !== r.id));
                      }}
                      className="px-3 py-2 rounded bg-red-600 text-white text-sm"
                    >
                      Non, indisponible
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* On masque la liste des piscines et réservations pour ne garder que les demandes */}
      </div>
    </div>
  );
}

