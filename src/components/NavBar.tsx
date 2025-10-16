"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";

export default function NavBar() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        setUser(session.data?.user || null);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      setUser(null);
      window.location.href = "/";
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex gap-4 items-center">
        <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 items-center">
      <Link href="/search" className="hover:underline">
        Rechercher
      </Link>
      
      {user ? (
        // Menu pour utilisateurs connectés
        <>
          <Link href="/dashboard" className="hover:underline">
            Dashboard
          </Link>
          {user.role === "owner" && (
            <Link href="/dashboard/availability" className="hover:underline text-blue-600 font-semibold">
              Disponibilité
            </Link>
          )}
          <Link href="/profile" className="hover:underline">
            Profil
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-1.5 rounded hover:bg-red-700 transition"
          >
            Déconnexion
          </button>
        </>
      ) : (
        // Menu pour utilisateurs non connectés
        <>
          <Link href="/register" className="hover:underline">
            Inscription
          </Link>
          <Link
            href="/login"
            className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700 transition"
          >
            Connexion
          </Link>
        </>
      )}
    </div>
  );
}
