"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

type OwnerAvailTab = "disponibilite" | "piscines";

export default function AvailabilityPage() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [poolApprovals, setPoolApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<OwnerAvailTab>("disponibilite");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Vérifier l'authentification
        const session = await authClient.getSession();
        const authUser = session.data?.user;
        
        if (!authUser) {
          router.replace("/login");
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
    <div className="flex min-h-screen bg-white">
      {/* Sidebar à gauche */}
      <div className="w-80 bg-gray-100 border-r border-gray-300">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-800 leading-tight mb-8">
            <span className="block">Ma</span>
            <span className="block">disponibilité</span>
          </h1>
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("disponibilite")}
              className={`w-full text-left py-3 px-4 text-gray-700 hover:bg-gray-200 rounded-md transition-colors ${
                activeTab === "disponibilite" ? "font-semibold text-gray-900 bg-gray-200" : "font-normal"
              }`}
            >
              Disponibilité
            </button>
            <button
              onClick={() => setActiveTab("piscines")}
              className={`w-full text-left py-3 px-4 text-gray-700 hover:bg-gray-200 rounded-md transition-colors ${
                activeTab === "piscines" ? "font-semibold text-gray-900 bg-gray-200" : "font-normal"
              }`}
            >
              Mes piscines
            </button>
            <Link href="/dashboard" className="inline-block text-blue-600 mt-6 hover:underline">
              ← Retour au tableau de bord
            </Link>
          </nav>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 p-8">
        {activeTab === "disponibilite" ? (
          <div className="space-y-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Demandes d'approbation d'annonces</h2>
              {poolApprovals.length === 0 ? (
                <div className="text-gray-600">Aucune demande pour le moment.</div>
              ) : (
                <div className="space-y-3">
                  {poolApprovals.map((p) => (
                    <div key={p.id} className="border rounded-lg p-4 bg-white flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="font-semibold">{p.title || "Annonce sans titre"}</div>
                        <div className="text-sm text-gray-600">{p.address}</div>
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

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Demandes de disponibilité</h2>
              {requests.length === 0 ? (
                <div className="text-gray-600">Aucune demande pour le moment.</div>
              ) : (
                <div className="space-y-3">
                  {requests.map((r) => (
                    <div key={r.id} className="border rounded-lg p-4 bg-white flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="font-semibold">{r.pool?.title}</div>
                        <div className="text-sm text-gray-600">
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
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Mes piscines</h2>
            {pools.length === 0 ? (
              <div className="text-gray-600">Vous n'avez pas encore de piscine.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pools.map((pool) => (
                  <div key={pool.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-semibold text-gray-900">{pool.title}</div>
                        <div className="text-sm text-gray-600">{pool.address}</div>
                        <div className="text-xs text-gray-500 mb-3">{pool.pricePerHour}€ / heure</div>
                        <Link href={`/pool/${pool.id}`} className="text-blue-600 hover:underline text-sm">Voir l'annonce</Link>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700">Disponible</span>
                        <input
                          type="checkbox"
                          defaultChecked={(pool as any).isAvailable ?? true}
                          onChange={async (e) => {
                            const next = e.target.checked;
                            // Optimistic update
                            setPools((prev) => prev.map((p) => p.id === pool.id ? ({ ...p, isAvailable: next } as any) : p));
                            await fetch(`/api/pools/${pool.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isAvailable: next }) });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

