"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function NavBar({ isHeaderBlue = false }: { isHeaderBlue?: boolean }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
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
  }, []);

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
      <Link
        href="/"
        className="font-bold text-2xl tracking-tight"
        style={{
          color: isHeaderBlue ? '#ffffff' : '#08436A',
          fontFamily: 'cursive'
        }}
      >
        YoumPool
      </Link>
    </div>
  );
}

