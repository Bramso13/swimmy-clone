"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

type PersonalInfo = {
  firstName?: string;
  lastName?: string;
  dob?: string;
  phone?: string;
  phoneCountry?: string;
  howDidYouKnow?: string;
  language?: string;
};

const STORAGE_KEY = "profile.personal";

export default function InformationsPersonnellesPage() {
  const { data: session } = authClient.useSession?.() ?? { data: undefined };
  const user = (session as any)?.user as
    | { emailVerified?: boolean; email?: string; name?: string; id?: string }
    | undefined;

  const [info, setInfo] = useState<PersonalInfo>({
    phoneCountry: "FR",
    language: "fr-FR",
  });
  const [saving, setSaving] = useState(false);
  const [serverLoaded, setServerLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setInfo({
          phoneCountry: "FR",
          language: "fr-FR",
          ...parsed,
        });
      } else {
        // Séparer le nom si disponible
        if (user?.name) {
          const parts = user.name.split(" ");
          setInfo({
            phoneCountry: "FR",
            language: "fr-FR",
            firstName: parts[0] || "",
            lastName: parts.slice(1).join(" ") || "",
          });
        }
      }
    } catch {}
  }, [user?.name]);

  // Charger dateOfBirth et name depuis le serveur
  useEffect(() => {
    (async () => {
      try {
        const userId = user?.id as string | undefined;
        if (!userId) return;
        const res = await fetch(`/api/users/${userId}`);
        if (res.ok) {
          const j = await res.json();
          const u = j.user || {};
          setInfo((p) => ({
            ...p,
            dob: u.dateOfBirth ? String(u.dateOfBirth).slice(0,10) : p.dob,
            firstName: p.firstName ?? (u.name ? String(u.name).split(" ")[0] : undefined),
            lastName: p.lastName ?? (u.name ? String(u.name).split(" ").slice(1).join(" ") : undefined),
          }));
        }
      } finally {
        setServerLoaded(true);
      }
    })();
  }, [user?.id]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
    } catch {}
  }, [info]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const userId = user?.id as string | undefined;
      if (!userId) {
        alert("Vous devez être connecté");
        return;
      }
      const payload: any = {};
      if (info.dob) payload.dateOfBirth = info.dob;
      if (info.firstName || info.lastName) payload.name = `${info.firstName ?? ''} ${info.lastName ?? ''}`.trim();
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Enregistrement impossible');
      }
      alert('Informations enregistrées');
    } catch (e: any) {
      alert(e.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const handleResendVerification = () => {
    // TODO: Implémenter l'envoi d'email de vérification
    alert("Email de vérification envoyé");
  };

  return (
    <main className="mx-auto max-w-5xl">
      {/* Header bleu */}
      <div className="py-8 px-6" style={{ backgroundColor: "var(--brand-blue)" }}>
        <div className="max-w-5xl mx-auto text-white">
          <div className="text-sm opacity-90 mb-2">
            <Link href="/profile" className="underline">Mon compte</Link> <span className="mx-1">›</span> Informations personnelles
          </div>
          <h1 className="text-4xl font-bold">Informations personnelles</h1>
        </div>
      </div>

      <div className="px-6 py-10 grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
        <div className="md:col-span-2 space-y-6">
          {/* Prénom et Nom */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Prénom</label>
              <input
                type="text"
                className="w-full border rounded-lg px-4 py-3"
                value={info.firstName ?? ""}
                onChange={(e) => setInfo((p) => ({ ...p, firstName: e.target.value }))}
                placeholder="Prénom"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Nom</label>
              <input
                type="text"
                className="w-full border rounded-lg px-4 py-3"
                value={info.lastName ?? ""}
                onChange={(e) => setInfo((p) => ({ ...p, lastName: e.target.value }))}
                placeholder="Nom"
              />
            </div>
          </div>

          {/* Date de naissance */}
          <div>
            <label className="block text-sm font-medium mb-2">Date de naissance</label>
            <div className="relative">
              <input
                type="date"
                className="w-full border rounded-lg px-4 py-3 pr-10"
                value={info.dob ?? ""}
                onChange={(e) => setInfo((p) => ({ ...p, dob: e.target.value }))}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">📅</span>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              className="w-full border rounded-lg px-4 py-3"
              value={user?.email ?? ""}
              disabled
            />
            {!user?.emailVerified && (
              <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                <span>✓</span>
                <span>
                  Vous n'avez pas encore vérifié votre adresse email.{" "}
                  <button
                    onClick={handleResendVerification}
                    className="underline hover:no-underline"
                  >
                    Envoyer de nouveau l'email de vérification.
                  </button>
                </span>
              </div>
            )}
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-sm font-medium mb-2">Numéro de téléphone portable</label>
            <div className="flex gap-2">
              <select
                className="border rounded-lg px-4 py-3"
                value={info.phoneCountry ?? "FR"}
                onChange={(e) => setInfo((p) => ({ ...p, phoneCountry: e.target.value }))}
              >
                <option value="FR">FR</option>
                <option value="BE">BE</option>
                <option value="CH">CH</option>
                <option value="CA">CA</option>
              </select>
              <input
                type="tel"
                className="flex-1 border rounded-lg px-4 py-3"
                value={info.phone ?? ""}
                onChange={(e) => setInfo((p) => ({ ...p, phone: e.target.value }))}
                placeholder="+33 7 80 76 37 33"
              />
            </div>
          </div>

          {/* Comment avez-vous connu Swimmy */}
          <div>
            <label className="block text-sm font-medium mb-2">Comment avez-vous connu Swimmy ?</label>
            <select
              className="w-full border rounded-lg px-4 py-3"
              value={info.howDidYouKnow ?? ""}
              onChange={(e) => setInfo((p) => ({ ...p, howDidYouKnow: e.target.value }))}
            >
              <option value="">Choisissez...</option>
              <option value="recherche">Recherche sur internet</option>
              <option value="reseau">Réseaux sociaux</option>
              <option value="ami">Un ami / connaissance</option>
              <option value="presse">Presse / média</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          {/* Langue/Région */}
          <div>
            <label className="block text-sm font-medium mb-2">Quelle langue/région préférez-vous ?</label>
            <select
              className="w-full border rounded-lg px-4 py-3"
              value={info.language ?? "fr-FR"}
              onChange={(e) => setInfo((p) => ({ ...p, language: e.target.value }))}
            >
              <option value="fr-FR">Français - France</option>
              <option value="fr-BE">Français - Belgique</option>
              <option value="fr-CH">Français - Suisse</option>
              <option value="en-US">English - United States</option>
              <option value="en-GB">English - United Kingdom</option>
            </select>
            <p className="mt-2 text-xs text-gray-500">
              La langue que vous sélectionnez sera utilisée pour la communication par mail. Ce choix ne change pas la langue du site sur lequel vous vous trouvez actuellement.
            </p>
          </div>

          {/* Bouton Enregistrer */}
          <div className="flex justify-center mt-8">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-3 rounded-lg text-white disabled:opacity-60 bg-gray-400"
            >
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </div>

        {/* Carte d'information à droite */}
        <aside className="bg-white rounded-xl border p-6 h-fit">
          <div className="font-semibold mb-2">Vos infos sont privées</div>
          <p className="text-gray-600 text-sm">
            Vos coordonnées ne seront communiquées qu'après l'acceptation des demandes de réservation de la part des propriétaires.
          </p>
        </aside>
      </div>
    </main>
  );
}

