"use client";
import React, { useEffect, useMemo, useState } from "react";
import { authClient } from "@/lib/auth-client";

type LocalProfile = {
  about?: string;
  dob?: string; // YYYY-MM-DD
  image?: string;
};

const STORAGE_KEY = "profile.local";

const ProfilePage = () => {
  const { data: session } = authClient.useSession?.() ?? { data: undefined };
  const user = (session as any)?.user as
    | { emailVerified?: boolean; image?: string; name?: string }
    | undefined;

  const [local, setLocal] = useState<LocalProfile>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLocal(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(local));
    } catch {}
  }, [local]);

  const requirements = useMemo(() => {
    const items: { key: string; label: string; href: string }[] = [];
    if (!user?.emailVerified) {
      items.push({
        key: "email",
        label:
          "Votre email n'a pas été vérifié, sans faire cela, vous ne pourrez pas utiliser Swimmy",
        href: "#security",
      });
    }
    if (!(user?.image || local.image)) {
      items.push({
        key: "photo",
        label: "Votre profil (Photo de profil, À propos de vous)",
        href: "#profile",
      });
    }
    if (!local.about) {
      items.push({
        key: "about",
        label: "Votre profil (À propos de vous)",
        href: "#profile",
      });
    }
    if (!local.dob) {
      items.push({
        key: "dob",
        label: "Vos informations personnelles (Date de naissance)",
        href: "#personal",
      });
    }
    return items;
  }, [user?.emailVerified, user?.image, local.about, local.dob, local.image]);

  const showAlert = requirements.length > 0;

  return (
    <main className="mx-auto max-w-5xl p-4 md:p-6">

    <section className="bg-blue-600 text-white p-6 rounded-xl flex-col items-center justify-between mb-6 w-full">
      <div className="flex flex-col items-center justify-between">
        <h2 className="text-5xl font-semibold mb-2">Mon compte</h2>
      </div>
      <div className="flex flex-col items-center justify-between">
        <p className="text-xl">{user?.name ?? "Utilisateur"}, {(user as { email?: string })?.email ?? "Utilisateur email"}</p>
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

      <div className="grid md:grid-cols-3 gap-4">
        <section
          id="profile"
          className="rounded-xl border bg-card p-5 hover:shadow-sm transition"
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl">🛡️</div>
            <div>
              <h2 className="font-semibold">Mon profil</h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Dites-en un peu plus sur vous pour que les autres utilisateurs vous
                connaissent.
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <div>
              <label className="text-sm font-medium">Photo de profil (URL)</label>
              <input
                type="url"
                placeholder="https://…"
                value={local.image ?? ""}
                onChange={(e) => setLocal((p) => ({ ...p, image: e.target.value }))}
                className="mt-1 w-full border rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">À propos de moi</label>
              <textarea
                placeholder="Votre présentation"
                value={local.about ?? ""}
                onChange={(e) => setLocal((p) => ({ ...p, about: e.target.value }))}
                className="mt-1 w-full border rounded-md px-3 py-2"
                rows={3}
              />
            </div>
          </div>
        </section>

        <section
          id="personal"
          className="rounded-xl border bg-card p-5 hover:shadow-sm transition"
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl">🧑‍💼</div>
            <div>
              <h2 className="font-semibold">Informations personnelles</h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Renseignez vos informations afin que l'on puisse vous contactez.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <label className="text-sm font-medium">Date de naissance</label>
            <input
              type="date"
              value={local.dob ?? ""}
              onChange={(e) => setLocal((p) => ({ ...p, dob: e.target.value }))}
              className="mt-1 w-full border rounded-md px-3 py-2"
            />
          </div>
        </section>

        <section
          id="payments"
          className="rounded-xl border bg-card p-5 hover:shadow-sm transition"
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl">💳</div>
            <div>
              <h2 className="font-semibold">Paiements et versements</h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Gérez vos moyens de paiements et vos informations de versements.
              </p>
            </div>
          </div>
        </section>

        <section
          id="security"
          className="rounded-xl border bg-card p-5 hover:shadow-sm transition"
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl">🧰</div>
            <div>
              <h2 className="font-semibold">Sécurité</h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Modifiez votre mot de passe si nécessaire.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <button
              className="border px-3 py-2 rounded-md text-sm hover:bg-muted"
              onClick={() => alert("Flux de vérification email à brancher")}
            >
              Vérifier mon email
            </button>
          </div>
        </section>

        <section
          id="privacy"
          className="rounded-xl border bg-card p-5 hover:shadow-sm transition"
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl">🔍</div>
            <div>
              <h2 className="font-semibold">Vie privée</h2>
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
