"use client";
import React, { useMemo, useState } from "react";
import Image from "next/image";

type Swimmers = { adults: number; children: number; babies: number };

export default function PoolDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;

  // Mock de données d'une piscine; à remplacer par un fetch/Prisma
  const pool = {
    id,
    title: "Belle piscine, terrasse et jardin avec vue mer",
    location: "Piscine à Toulon",
    maxSwimmers: 15,
    minHours: 3,
    images: [
      "/window.svg",
      "/next.svg",
      "/vercel.svg",
    ],
    description:
      "Situé sur les hauteurs de Toulon avec une magnifique vue mer, sur la rade et le Faron",
    equipment: [
      "Douche",
      "Toilette",
      "Jardin",
      "Transats",
      "Table et chaises",
      "Barbecue",
      "Bouées gonflables",
      "Terrain de pétanque",
    ],
    rules: [
      "Convient aux enfants (0 - 12 ans)",
      "Pas de musique",
      "Baignade en burkini non autorisée",
      "Pas d'animaux",
      "Événements autorisés",
      "Alcool autorisé",
      "Espace fumeur",
      "Naturisme autorisé",
    ],
    extras: [
      { title: "Barbecue", desc: "BBQ à gaz (à nettoyer après utilisation)", price: "20 €" },
      { title: "Serviettes", desc: "", price: "5 € /pers." },
      { title: "terrain de pétanque avec jeux de boules", desc: "", price: "10 €" },
      { title: "four à pizza", desc: "four à gaz", price: "10 €" },
    ],
    additional: {
      ownerPresent: false,
      privacy: "Vis à vis léger",
      product: "Chlore",
      safety: ["Alarme de sécurité"],
    },
  };

  const [date, setDate] = useState("");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("12:00");
  const [swimmers, setSwimmers] = useState<Swimmers>({ adults: 1, children: 0, babies: 0 });

  const totalSwimmers = swimmers.adults + swimmers.children + swimmers.babies;

  const increment = (k: keyof Swimmers) =>
    setSwimmers((s) => ({ ...s, [k]: Math.max(0, s[k] + 1) }));
  const decrement = (k: keyof Swimmers) =>
    setSwimmers((s) => ({ ...s, [k]: Math.max(0, s[k] - 1) }));

  const imagesCount = pool.images.length;

  return (
    <main className="mx-auto max-w-6xl p-4 md:p-6">
      {/* Title + actions */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">
            {pool.title}
          </h1>
          <div className="mt-2 text-sm text-muted-foreground flex items-center gap-3">
            <span>⭐ 4.89 (90)</span>
            <span>•</span>
            <span>Superhôte</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <button className="inline-flex items-center gap-2 border px-3 py-1.5 rounded-full hover:bg-muted">Partager</button>
          <button className="inline-flex items-center gap-2 border px-3 py-1.5 rounded-full hover:bg-muted">Enregistrer</button>
        </div>
      </div>

      {/* Gallery */}
      <div className="relative rounded-xl overflow-hidden border">
        <div className="absolute left-3 top-3 z-10 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
          1/{imagesCount}
        </div>
        <div className="grid md:grid-cols-2 gap-1">
          <div className="relative h-[340px] md:h-[460px]">
            <Image src={pool.images[0]} alt="pool" fill className="object-cover" />
          </div>
          <div className="grid grid-cols-2 gap-1">
            {pool.images.slice(1).map((src, i) => (
              <div key={i} className="relative h-[170px] md:h-[230px]">
                <Image src={src} alt="pool" fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content + booking card */}
      <div className="mt-8 grid lg:grid-cols-[1fr_360px] gap-8">
        <section>
          <h2 className="text-xl font-semibold mb-2">{pool.location}</h2>
          <div className="text-sm text-muted-foreground mb-6">
            {pool.maxSwimmers} baigneurs • {pool.minHours} heures minimum
          </div>
          <p className="mb-6">{pool.description}</p>

          <h3 className="text-lg font-semibold mt-8 mb-3">Équipements</h3>
          <ul className="grid sm:grid-cols-2 gap-2">
            {pool.equipment.map((e) => (
              <li key={e} className="flex items-center gap-2">✓ {e}</li>
            ))}
          </ul>

          <h3 className="text-lg font-semibold mt-10 mb-3">Règlement intérieur</h3>
          <ul className="grid sm:grid-cols-2 gap-2">
            {pool.rules.map((e) => (
              <li key={e} className="flex items-center gap-2">{e}</li>
            ))}
          </ul>
        </section>

        <aside className="h-max rounded-2xl border shadow-sm p-4 sticky top-20">
          <div className="font-semibold mb-3">Ajoutez une date et un créneau pour voir le prix</div>

          <div className="space-y-3">
            <div>
              <label className="text-sm">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full border rounded-md px-3 py-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm">Heure de début</label>
                <input
                  type="time"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="mt-1 w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm">Heure de fin</label>
                <input
                  type="time"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="mt-1 w-full border rounded-md px-3 py-2"
                />
              </div>
            </div>

            <div className="space-y-3">
              {[
                { key: "adults", label: "Adultes", sub: "13 ans et plus" },
                { key: "children", label: "Enfants", sub: "de 3 à 12 ans" },
                { key: "babies", label: "Bébés", sub: "Moins de 3 ans" },
              ].map((row) => (
                <div key={row.key} className="flex items-center justify-between border rounded-md px-3 py-2">
                  <div>
                    <div className="font-medium text-sm">{row.label}</div>
                    <div className="text-xs text-muted-foreground">{row.sub}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => decrement(row.key as keyof Swimmers)}
                      className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-muted"
                    >
                      −
                    </button>
                    <span className="w-6 text-center">{(swimmers as any)[row.key]}</span>
                    <button
                      type="button"
                      onClick={() => increment(row.key as keyof Swimmers)}
                      className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-muted"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-2 bg-blue-600 text-white px-4 py-3 rounded-md font-semibold hover:bg-blue-700">
              Vérifier la disponibilité
            </button>
          </div>
        </aside>
      </div>

      {/* Extras supplémentaires */}
      <section className="mt-12">
        <h3 className="text-xl font-semibold mb-2">Extras supplémentaires</h3>
        <div className="text-sm text-muted-foreground mb-4">
          Ces extras sont proposés par l'hôte.
        </div>
        <div className="space-y-3">
          {pool.extras.map((x) => (
            <div key={x.title} className="rounded-2xl border p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{x.title}</div>
                {x.desc && <div className="text-sm text-muted-foreground">{x.desc}</div>}
              </div>
              <div className="font-semibold">{x.price}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Informations supplémentaires */}
      <section className="mt-12">
        <h3 className="text-xl font-semibold mb-4">Informations supplémentaires</h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <span>🧑‍✈️</span>
            <span>
              Propriétaire présent pendant la location : {pool.additional.ownerPresent ? "Oui" : "Non"}
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span>👀</span>
            <span>Vis à vis léger</span>
          </li>
          <li className="flex items-start gap-3">
            <span>💧</span>
            <span>Produit d'entretien : {pool.additional.product}</span>
          </li>
          <li className="flex items-start gap-3">
            <span>🏊</span>
            <span>
              Équipement(s) de sécurité :
              <ul className="list-disc pl-5">
                {pool.additional.safety.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </span>
          </li>
        </ul>
      </section>
    </main>
  );
}
