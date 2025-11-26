"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useUsers } from "@/context/UsersContext";

export default function NavBar({ isHeaderBlue = false }: { isHeaderBlue?: boolean }) {
  const router = useRouter();
  const [fallbackUser, setFallbackUser] = useState<any>(null);
  const { userLoading, fetchUser } = useUsers();

  useEffect(() => {
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
  }, [fetchUser]);

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      router.push("/");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  if (userLoading) {
    return (
      <div className="flex gap-4 items-center">
        <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <Link href="/" className="flex items-center gap-2" aria-label="Accueil YoumPool">
        <Image
          src="/yoompool-logo.svg"
          alt="Logo YoumPool"
          width={150}
          height={54}
          priority
          style={{ height: "auto" }}
        />
      </Link>
    </div>
  );
}

