"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useUsers } from "@/context/UsersContext";

type LocalProfile = {
  about?: string;
  dob?: string; // YYYY-MM-DD
  image?: string;
};

type FullUser = {
  id: string;
  email: string;
  name?: string;
  role: string;
  image?: string;
  bio?: string | null;
  dateOfBirth?: string | Date | null;
  emailVerified: boolean;
};

const STORAGE_KEY = "profile.local";

const ProfilePage = () => {
  const { data: session } = authClient.useSession?.() ?? { data: undefined };
  const { user: fullUser, userLoading, fetchUser } = useUsers();
  const sessionUser = (session as any)?.user as
    | { emailVerified?: boolean; image?: string; name?: string; id?: string }
    | undefined;

  const [local, setLocal] = useState<LocalProfile>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLocal(JSON.parse(raw));
    } catch {}
  }, []);

  // Récupérer les informations complètes de l'utilisateur (rôle, image, bio, date)
  useEffect(() => {
    const loadUser = async () => {
      if (!sessionUser?.id) {
        return;
      }
      await fetchUser(sessionUser.id);
    };
    loadUser();
  }, [fetchUser, sessionUser?.id]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(local));
    } catch {}
  }, [local]);

  const requirements = useMemo(() => {
    const items: { key: string; label: string; href: string }[] = [];
    if (!fullUser?.emailVerified) {
      items.push({
        key: "email",
        label:
          "Votre email n'a pas été vérifié, sans faire cela, vous ne pourrez pas utiliser YoumPool",
        href: "#security",
      });
    }
    // Photo de profil (on privilégie la donnée serveur)
    if (!(fullUser?.image || sessionUser?.image || local.image)) {
      items.push({
        key: "photo",
        label: "Votre profil (Photo de profil, À propos de vous)",
        href: "#profile",
      });
    }
    // À propos (bio) depuis la BDD
    if (!fullUser?.bio) {
      items.push({
        key: "about",
        label: "Votre profil (À propos de vous)",
        href: "#profile",
      });
    }
    // Date de naissance depuis la BDD
    if (!fullUser?.dateOfBirth) {
      items.push({
        key: "dob",
        label: "Vos informations personnelles (Date de naissance)",
        href: "#personal",
      });
    }
    return items;
  }, [fullUser?.emailVerified, fullUser?.image, sessionUser?.image, local.image, fullUser?.bio, fullUser?.dateOfBirth]);

  const showAlert = requirements.length > 0;

  return (
    <main className="mx-auto max-w-5xl p-4 md:p-6">

    <section className="bg-blue-600 text-white p-6 rounded-xl flex-col items-center justify-between mb-6 w-full">
      <div className="flex flex-col items-center justify-between">
        <h2 className="text-5xl font-semibold mb-2">Mon compte</h2>
      </div>
      <div className="flex flex-col items-center justify-between">
        <p className="text-xl mb-3">{fullUser?.name ?? sessionUser?.name ?? "Utilisateur"}, {fullUser?.email ?? (sessionUser as { email?: string })?.email ?? "Utilisateur email"}</p>
        {!userLoading && fullUser && (
          <div className="flex items-center gap-2">
            <span className={`px-4 py-2 rounded-full font-semibold text-sm ${
              fullUser.role === "owner" 
                ? "bg-yellow-400 text-white" 
                : "bg-blue-400 text-white"
            }`}>
              {fullUser.role === "owner" ? "👑 Propriétaire (Owner)" : "🏊 Locataire (Tenant)"}
            </span>
          </div>
        )}
        {userLoading && (
          <div className="animate-pulse bg-blue-400 h-8 w-48 rounded-full"></div>
        )}
      </div>
    </section>

      {showAlert && (
        <div className="mb-6 rounded-xl border bg-amber-50 text-amber-900 border-amber-200 overflow-hidden">
          <div className="flex">
            <div className="bg-amber-100 px-4 py-4 flex items-start">
              <span className="text-xl">⚠️</span>
            </div>
            <div className="flex-1 p-4">
              <div className="font-semibold mb-2">
                Il manque des informations à votre compte, pensez à le compléter :
              </div>
              <ul className="list-disc pl-5 space-y-1">
                {requirements.map((r) => (
                  <li key={r.key}>
                    <a href={r.href} className="text-blue-700 hover:underline">
                      {r.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <Link href="/profile/mon-profil" className="rounded-xl border bg-card p-5 hover:shadow-sm transition block">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🛡️</div>
            <div>
              <h2 className="font-semibold">Mon profil <span>›</span></h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Dites-en un peu plus sur vous pour que les autres utilisateurs vous
                connaissent.
              </p>
            </div>
          </div>
        </Link>

        <Link href="/profile/informations-personnelles" className="rounded-xl border bg-card p-5 hover:shadow-sm transition block">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🧑‍💼</div>
            <div>
              <h2 className="font-semibold">Informations personnelles <span>›</span></h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Renseignez vos informations afin que l'on puisse vous contactez.
              </p>
            </div>
          </div>
        </Link>

        <Link href="/profile/paiements-versements" className="rounded-xl border bg-card p-5 hover:shadow-sm transition block">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💳</div>
            <div>
              <h2 className="font-semibold">Paiements et versements <span>›</span></h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Gérez vos moyens de paiements et vos informations de versements.
              </p>
            </div>
          </div>
        </Link>

        <Link href="/profile/securite" className="rounded-xl border bg-card p-5 hover:shadow-sm transition block">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🧰</div>
            <div>
              <h2 className="font-semibold">Sécurité <span>›</span></h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Modifiez votre mot de passe si nécessaire.
              </p>
            </div>
          </div>
        </Link>

        <section
          id="privacy"
          className="rounded-xl border bg-card p-5 hover:shadow-sm transition"
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl">🔍</div>
            <div>
              <h2 className="font-semibold">Vie privée <span>›</span></h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Modifiez votre consentement concernant nos cookies.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default ProfilePage;

