"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useApi } from "@/context/ApiContext";

export default function NavBar({ isHeaderBlue = false }: { isHeaderBlue?: boolean }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { request } = useApi();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        const baseUser = session.data?.user || null;
        if (!baseUser) {
          setUser(null);
        } else {
          try {
            const res = await request(`/api/users/${baseUser.id}`);
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
  }, [request]);

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      setUser(null);
      router.push("/");
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

