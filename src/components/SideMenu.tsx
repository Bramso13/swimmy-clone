"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";

export default function SideMenu() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier le statut de connexion
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

    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleProposePool = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      window.location.href = "/register";
      return;
    }
    // Si l'utilisateur est connecté, laisser le lien normal fonctionner
  };

  return (
    <>
      <button
        aria-label="Ouvrir le menu"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {/* simple hamburger */}
        <span className="relative block w-5 h-4">
          <span className="absolute inset-x-0 top-0 h-0.5 bg-current"></span>
          <span className="absolute inset-x-0 top-1/2 -mt-0.5 h-0.5 bg-current"></span>
          <span className="absolute inset-x-0 bottom-0 h-0.5 bg-current"></span>
        </span>
      </button>

      {/* overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 animate-in fade-in duration-200"
          onClick={() => setOpen(false)}
        />
      )}

      {/* drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 max-w-[85%] bg-white dark:bg-black border-r border-border shadow-xl transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="font-bold text-lg">Menu</div>
          <button
            aria-label="Fermer le menu"
            onClick={() => setOpen(false)}
            className="rounded-md p-2 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
          >
            ✕
          </button>
        </div>
        <nav className="p-2">
          <ul className="flex flex-col">
            {/* Menu pour utilisateurs non connectés */}
            {!user && !loading && [
              { label: "Trouver une piscine", href: "/search" },
              { 
                label: "Proposer ma piscine", 
                href: "/dashboard/pools/new",
                requiresAuth: true 
              },
              { label: "Inscription", href: "/register" },
              { label: "Connexion", href: "/login" },
              { label: "Aide", href: "/settings" },
              { label: "Blog", href: "/" },
            ].map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={(e) => {
                    setOpen(false);
                    if (item.requiresAuth) {
                      handleProposePool(e);
                    }
                  }}
                  className="block px-4 py-3 hover:bg-muted rounded-md"
                >
                  {item.label}
                </Link>
              </li>
            ))}

            {/* Menu pour utilisateurs connectés */}
            {user && !loading && [
              { label: "Trouver ma piscine", href: "/search" },
              { label: "Proposer ma piscine", href: "/dashboard/pools/new" },
              { label: "Messages", href: "/dashboard" },
              { label: "Reservations", href: "/dashboard/reservations" },
              { label: "Favoris", href: "/dashboard" },
              { label: "Compte", href: "/profile" },
              { label: "Aide", href: "/settings" },
              { label: "Blog", href: "/" },
              { label: "Déconnexion", href: "/login" },
            ].map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 hover:bg-muted rounded-md"
                >
                  {item.label}
                </Link>
              </li>
            ))}

            {/* Affichage de chargement */}
            {loading && (
              <li className="px-4 py-3 text-gray-500">
                Chargement...
              </li>
            )}
          </ul>
        </nav>
      </div>
    </>
  );
}


