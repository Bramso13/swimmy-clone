"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

type LocalProfile = {
  about?: string;
  dob?: string;
  image?: string;
};

const STORAGE_KEY = "profile.local";

export default function MonProfilPage() {
  const [local, setLocal] = useState<LocalProfile>({});
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverLoaded, setServerLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLocal(JSON.parse(raw));
    } catch {}
  }, []);

  // Charger depuis le serveur (source de vérité)
  useEffect(() => {
    (async () => {
      try {
        const session = await authClient.getSession();
        const userId = session.data?.user?.id as string | undefined;
        if (!userId) return;
        const res = await fetch(`/api/users/${userId}`);
        if (res.ok) {
          const j = await res.json();
          const u = j.user || {};
          setLocal((p) => ({
            ...p,
            image: u.image ?? p.image,
            about: u.bio ?? p.about,
            dob: u.dateOfBirth ? String(u.dateOfBirth).slice(0, 10) : p.dob,
          }));
        }
      } finally {
        setServerLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(local));
    } catch {}
  }, [local]);

  const onChooseFile = async (file: File | null) => {
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    setUploading(true);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const j = await res.json();
      if (res.ok && j.url) {
        setLocal((p) => ({ ...p, image: j.url }));
      } else {
        alert(j.error || "Upload échoué");
      }
    } finally {
      setUploading(false);
    }
  };

  const onSave = async () => {
    try {
      setSaving(true);
      const session = await authClient.getSession();
      const userId = session.data?.user?.id as string | undefined;
      if (!userId) {
        alert("Vous devez être connecté pour enregistrer votre profil.");
        return;
      }
      const payload: any = {};
      if (local.image) payload.image = local.image;
      if (local.about !== undefined) payload.bio = local.about;
      if (local.dob !== undefined) payload.dateOfBirth = local.dob;
      if (Object.keys(payload).length === 0) {
        alert("Aucun changement à enregistrer.");
        return;
      }
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Enregistrement impossible");
      }
      alert("Profil enregistré avec succès.");
    } catch (e: any) {
      alert(e.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto max-w-5xl">
      {/* Header bleu avec fil d’Ariane */}
      <div className="py-8 px-6" style={{ backgroundColor: "var(--brand-blue)" }}>
        <div className="max-w-5xl mx-auto text-white">
          <div className="text-sm opacity-90 mb-2">
            <Link href="/profile" className="underline">Mon compte</Link> <span className="mx-1">›</span> Mon profil
          </div>
          <h1 className="text-4xl font-bold">Mon profil</h1>
        </div>
      </div>

      <div className="px-6 py-10 grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
        {/* Zone d’upload ronde */}
        <div className="md:col-span-2">
          <p className="mb-6 text-gray-700">
            Swimmy est une grande communauté. Aidez les autres à mieux vous connaître !
          </p>

          <div className="flex items-center gap-10">
            <label 
              className="relative flex items-center justify-center border-2 border-dashed cursor-pointer bg-gray-50 overflow-hidden rounded-full"
              style={{ 
                width: '256px', 
                height: '256px'
              }}
            >
              {local.image ? (
                <img 
                  src={local.image} 
                  alt="Profil" 
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="text-center text-gray-600 text-sm">
                  <div className="mb-2">+ Ajouter ma photo de profil…</div>
                  <div>.JPG, .GIF ou .PNG.</div>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => onChooseFile(e.target.files?.[0] || null)}
              />
            </label>

            <div className="text-sm text-gray-600">
              <div className="font-semibold mb-2">Faites vous connaître</div>
              <p>
                Un profil avec photo a plus de chances de voir ses demandes de réservations acceptées. Et si votre visage est bien visible, c'est encore mieux !
              </p>
            </div>
          </div>

          <div className="mt-10">
            <label className="block text-sm font-medium mb-2">À propos de vous</label>
            <input
              type="text"
              placeholder="Présentez vous en quelques mots…"
              className="w-full border rounded-lg px-4 py-3"
              value={local.about ?? ""}
              onChange={(e) => setLocal((p) => ({ ...p, about: e.target.value }))}
            />
          </div>

          <div className="mt-6">
            <button
              disabled={uploading || saving}
              onClick={onSave}
              className="px-8 py-3 rounded-full text-white disabled:opacity-60"
              style={{ backgroundColor: "var(--brand-blue)" }}
            >
              {uploading || saving ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </div>

        {/* Carte d’aide */}
        <aside className="bg-white rounded-xl border p-6">
          <div className="font-semibold mb-2">Faites vous connaître</div>
          <p className="text-gray-600 text-sm">
            Un profil avec photo a 70% plus de chances de voir ses demandes de réservations acceptées. Et si votre visage est bien visible, c'est encore mieux !
          </p>
        </aside>
      </div>
    </main>
  );
}


