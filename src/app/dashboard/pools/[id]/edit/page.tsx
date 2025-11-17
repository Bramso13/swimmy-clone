"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const EQUIPMENT_OPTIONS: string[] = [
  "Barbecue",
  "Transats",
  "Wifi",
  "Parking",
  "Douche",
  "Serviettes",
  "Vestiaires",
  "WC",
  "Frigo",
  "Plancha",
  "Jacuzzi",
  "Spa",
  "Piscine chauffée",
  "Couverture",
  "Éclairage de nuit",
];

const RULE_OPTIONS: string[] = [
  "Convient aux enfants (0-12 ans)",
  "Pas d’alcool",
  "Pas de musique",
  "Pas d’animaux",
  "Événements autorisés",
  "Espace fumeur",
  "Non fumeur",
  "Naturisme non autorisé",
  "Musique autorisée / tolérée selon niveau",
  "Propriétaire présent pendant la location",
  "Restriction d’âge ou capacité selon enfants très jeunes / enfants ne sachant pas nager",
];

type EditablePool = {
  id: string;
  title: string;
  description: string | null;
  address: string | null;
  pricePerHour: number | null;
  isAvailable: boolean | null;
  location: "INDOOR" | "OUTDOOR" | null;
  rules?: string[] | null;
  extras?: any;
  equipments?: string[] | null;
};

export default function EditPoolPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pool, setPool] = useState<EditablePool | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadPool = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/pools/${id}`, { cache: "no-store" });
        if (!res.ok) {
          throw new Error(res.status === 404 ? "Piscine introuvable" : "Impossible de charger la piscine");
        }
        const data = await res.json();
        if (!cancelled) {
          const raw = data.pool || {};
          const extras = raw?.extras && typeof raw.extras === "object" ? raw.extras : {};
          const equipmentList = Array.isArray((extras as any)?.equipments)
            ? (extras as any).equipments.filter((e: any) => typeof e === "string" && e.trim().length > 0)
            : [];
          const rulesList = Array.isArray(raw?.rules)
            ? (raw.rules as any[]).filter((e) => typeof e === "string" && e.trim().length > 0)
            : [];
          const parsed: EditablePool = {
            id: raw.id,
            title: raw.title ?? "",
            description: raw.description ?? "",
            address: raw.address ?? "",
            pricePerHour: typeof raw.pricePerHour === "number" ? raw.pricePerHour : Number(raw.pricePerHour ?? 0),
            isAvailable: typeof raw.isAvailable === "boolean" ? raw.isAvailable : true,
            location: raw.location === "INDOOR" ? "INDOOR" : "OUTDOOR",
            rules: rulesList,
            extras: { ...(extras || {}) },
            equipments: equipmentList,
          };
          setPool(parsed);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e.message || "Erreur réseau");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    loadPool();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const updateField = <K extends keyof EditablePool>(key: K, value: EditablePool[K]) => {
    setPool((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const toggleEquipment = (label: string) => {
    setPool((prev) => {
      if (!prev) return prev;
      const current = Array.isArray(prev.equipments) ? prev.equipments : [];
      const exists = current.includes(label);
      const updated = exists ? current.filter((item) => item !== label) : [...current, label];
      return {
        ...prev,
        equipments: updated,
        extras: {
          ...(prev.extras || {}),
          equipments: updated,
        },
      };
    });
  };

  const toggleRule = (label: string) => {
    setPool((prev) => {
      if (!prev) return prev;
      const current = Array.isArray(prev.rules) ? prev.rules : [];
      const exists = current.includes(label);
      const updated = exists ? current.filter((item) => item !== label) : [...current, label];
      return {
        ...prev,
        rules: updated,
      };
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!pool) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/pools/${pool.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: pool.title,
          description: pool.description ?? "",
          address: pool.address ?? "",
          pricePerHour: typeof pool.pricePerHour === "number" ? pool.pricePerHour : undefined,
          isAvailable: typeof pool.isAvailable === "boolean" ? pool.isAvailable : undefined,
          location: pool.location,
          rules: Array.isArray(pool.rules) ? pool.rules : undefined,
          extras: pool.extras,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Impossible d'enregistrer les modifications");
      }
      setSuccess("Modifications enregistrées");
      setTimeout(() => {
        router.push("/dashboard/pools");
      }, 800);
    } catch (e: any) {
      setError(e.message || "Erreur réseau");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <div className="rounded border bg-white p-6 text-center text-gray-500">Chargement de la piscine...</div>
      </main>
    );
  }

  if (error && !pool) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <div className="rounded border bg-white p-6 text-center text-red-600">{error}</div>
      </main>
    );
  }

  if (!pool) {
    return null;
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Modifier la piscine</h1>
        <p className="text-sm text-gray-600">Mettez à jour les informations principales de votre annonce.</p>
      </div>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      {success && (
        <div className="rounded border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="title">Titre</label>
          <input
            id="title"
            value={pool.title}
            onChange={(e) => updateField("title", e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="description">Description</label>
          <textarea
            id="description"
            value={pool.description ?? ""}
            onChange={(e) => updateField("description", e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
            rows={5}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="address">Adresse</label>
          <input
            id="address"
            value={pool.address ?? ""}
            onChange={(e) => updateField("address", e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="price">Prix par heure (€)</label>
          <input
            id="price"
            type="number"
            min={0}
            value={pool.pricePerHour ?? 0}
            onChange={(e) => updateField("pricePerHour", Number(e.target.value))}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Disponibilité</label>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={pool.isAvailable ?? true}
                onChange={(e) => updateField("isAvailable", e.target.checked)}
              />
              Piscine disponible à la location
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Emplacement</label>
          <div className="flex gap-4 text-sm">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="location"
                value="OUTDOOR"
                checked={(pool.location ?? "OUTDOOR") === "OUTDOOR"}
                onChange={() => updateField("location", "OUTDOOR")}
              />
              Extérieur
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="location"
                value="INDOOR"
                checked={pool.location === "INDOOR"}
                onChange={() => updateField("location", "INDOOR")}
              />
              Intérieur
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Équipements</div>
          <div className="grid gap-2 sm:grid-cols-2">
            {EQUIPMENT_OPTIONS.map((opt) => {
              const active = Array.isArray(pool.equipments) ? pool.equipments.includes(opt) : false;
              return (
                <label key={opt} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${active ? 'border-blue-500 bg-blue-50' : ''}`}>
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleEquipment(opt)}
                  />
                  <span>{opt}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Règles</div>
          <div className="grid gap-2 sm:grid-cols-2">
            {RULE_OPTIONS.map((opt) => {
              const active = Array.isArray(pool.rules) ? pool.rules.includes(opt) : false;
              return (
                <label key={opt} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${active ? 'border-emerald-500 bg-emerald-50' : ''}`}>
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleRule(opt)}
                  />
                  <span>{opt}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-full border px-4 py-2 text-sm"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-full px-5 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: saving ? "#4D6A80" : "#08436A" }}
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </main>
  );
}

