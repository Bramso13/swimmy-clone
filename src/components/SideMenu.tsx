"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function SideMenu({ isHeaderBlue = false }: { isHeaderBlue?: boolean }) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Vérifier le statut de connexion + récupérer le rôle depuis l'API utilisateur
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        const baseUser = session.data?.user || null;
        if (!baseUser) {
          setUser(null);
        } else {
          try {
            const res = await fetch(`/api/users/${baseUser.id}`);
            if (res.ok) {
              const data = await res.json();
              setUser(data.user);
            } else {
              setUser(baseUser);
            }
          } catch {
            setUser(baseUser);
          }
        }
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
      router.push("/register");
      return;
    }
    // Si l'utilisateur est connecté, laisser le lien normal fonctionner
  };

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await authClient.signOut();
      setUser(null);
      setOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  return (
    <>
      <button
        aria-label="Ouvrir le menu"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-3 rounded-full border px-4 py-2 text-sm font-medium bg-white hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring shadow-sm ${
          isHeaderBlue ? 'border-white/20' : ''
        }`}
      >
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-white uppercase" style={{ backgroundColor: '#08436A' }}>
          {(() => {
            if (!user) return '≡';
            const source = String(user?.name || user?.email || '').trim();
            if (!source) return '≡';
            const parts = source.split(/\s+/).filter(Boolean);
            const initials = (parts[0]?.[0] || '') + (parts[1]?.[0] || (source.includes('@') ? source[0] : ''));
            return initials.slice(0, 2).toUpperCase();
          })()}
        </span>
        <span className={isHeaderBlue ? 'text-black' : 'text-gray-800'}>Menu</span>
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
            {user && !loading && (
              <>
                {[
                  { label: "Dashboard", href: "/dashboard" },
                  { label: "Trouver ma piscine", href: "/search" },
                  { label: "Proposer ma piscine", href: "/dashboard/pools/new" },
                  { label: "Messages", href: "/dashboard/messages" },
                  { label: "Reservations", href: "/dashboard/reservations" },
                  { label: "Favoris", href: "/dashboard" },
                  { label: "Compte", href: "/profile" },
                  { label: "Aide", href: "/settings" },
                  { label: "Blog", href: "/" },
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
                {/* Bouton de déconnexion séparé */}
                <li>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-3 hover:bg-muted rounded-md"
                  >
                    Déconnexion
                  </button>
                </li>
                
                {/* Option supplémentaire pour les owners/admins */}
                {user.role === "owner" && (
                  <>
                    <li>
                      <Link
                        href="/dashboard/availability"
                        onClick={() => setOpen(false)}
                        className="block px-4 py-3 hover:bg-muted rounded-md bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500"
                      >
                        📅 Vérifier la disponibilité
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/dashboard/users"
                        onClick={() => setOpen(false)}
                        className="block px-4 py-3 hover:bg-muted rounded-md bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500"
                      >
                        👥 Utilisateurs
                      </Link>
                    </li>
                  </>
                )}

                {/* Vérifier les commandes (owners) */}
                {user.role === "owner" && (
                  <li>
                    <Link
                      href="/dashboard/transactions"
                      onClick={() => setOpen(false)}
                      className="block px-4 py-3 hover:bg-muted rounded-md bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500"
                    >
                      📦 Vérifier les commandes
                    </Link>
                  </li>
                )}

                {/* Messages reçus */}
                <li>
                  <Link
                    href="/dashboard/messages"
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 hover:bg-muted rounded-md"
                  >
                    ✉️ Messages
                  </Link>
                </li>
              </>
            )}

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


