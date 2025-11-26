"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import MenuSection, { MenuEntry } from "@/components/navigation/MenuSection";
import { useUsers } from "@/context/UsersContext";

export default function SideMenu({ isHeaderBlue = false }: { isHeaderBlue?: boolean }) {
  const [open, setOpen] = useState(false);
  const [fallbackUser, setFallbackUser] = useState<any>(null);
  const router = useRouter();
  const { user, userLoading, fetchUser } = useUsers();

  useEffect(() => {
    // Vérifier le statut de connexion + récupérer le rôle depuis l'API utilisateur
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        const baseUser = session.data?.user || null;
        if (!baseUser) {
          setFallbackUser(null);
          return;
        }
        setFallbackUser(baseUser); // Garder en fallback
        await fetchUser(baseUser.id);
      } catch (error) {
        // Erreur gérée par le contexte
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
  }, [open, fetchUser]);

  // Utiliser user du contexte s'il existe, sinon fallbackUser
  const displayUser = user || fallbackUser;

  const handleProposePool = (e: React.MouseEvent) => {
    if (!displayUser) {
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
      setOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  const closeMenu = () => setOpen(false);

  const guestMenu: MenuEntry[] = [
    { key: "search", label: "Trouver une piscine", href: "/search" },
    { key: "propose", label: "Proposer ma piscine", href: "/dashboard/pools/new", onClick: handleProposePool },
    { key: "register", label: "Inscription", href: "/register" },
    { key: "login", label: "Connexion", href: "/login" },
    { key: "help", label: "Aide", href: "/settings" },
    { key: "blog", label: "Blog", href: "/" },
  ];

  const authenticatedMenu: MenuEntry[] = [
    { key: "dashboard", label: "Dashboard", href: "/dashboard" },
    { key: "search", label: "Trouver ma piscine", href: "/search" },
    { key: "new-pool", label: "Proposer ma piscine", href: "/dashboard/pools/new" },
    { key: "messages", label: "Messages", href: "/dashboard/messages" },
    { key: "reservations", label: "Réservations", href: "/dashboard/reservations" },
    { key: "favorites", label: "Favoris", href: "/dashboard" },
    { key: "account", label: "Compte", href: "/profile" },
    { key: "help", label: "Aide", href: "/settings" },
    { key: "blog", label: "Blog", href: "/" },
  ];

  const ownerMenu: MenuEntry[] =
    displayUser?.role === "owner"
      ? [
          { key: "availability", label: "📅 Vérifier la disponibilité", href: "/dashboard/availability", variant: "blue" },
          { key: "users", label: "👥 Utilisateurs", href: "/dashboard/users", variant: "indigo" },
          { key: "transactions", label: "📦 Vérifier les commandes", href: "/dashboard/transactions", variant: "emerald" },
          { key: "accounting", label: "📊 Comptabilité", href: "/dashboard/comptabilite", variant: "purple" },
        ]
      : [];

  const extraMessageShortcut: MenuEntry[] = [
    { key: "inbox", label: "✉️ Messages", href: "/dashboard/messages" },
  ];

  const logoutItem: MenuEntry[] = [
    { key: "logout", label: "Déconnexion", type: "button", onClick: handleLogout },
  ];

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
            if (!displayUser) return '≡';
            const source = String(displayUser?.name || displayUser?.email || '').trim();
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
            {!displayUser && !userLoading && <MenuSection items={guestMenu} onNavigate={closeMenu} />}

            {/* Menu pour utilisateurs connectés */}
            {displayUser && !userLoading && (
              <>
                <MenuSection items={authenticatedMenu} onNavigate={closeMenu} />
                {displayUser.role === "owner" && <MenuSection items={ownerMenu} onNavigate={closeMenu} />}
                <MenuSection items={logoutItem} onNavigate={closeMenu} />
                <MenuSection items={extraMessageShortcut} onNavigate={closeMenu} />
              </>
            )}

            {/* Affichage de chargement */}
            {userLoading && (
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


