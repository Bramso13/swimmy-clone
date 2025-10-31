"use client";
import Link from "next/link";
import { faqItems } from "../data";

export default function AnnulationReservationPage() {
  const orderedSlugs: string[] = [
    "modifier-date-reservation",
    "plus-ou-moins-de-personnes",
    "annuler-une-reservation",
    "proprietaire-annule-demande",
    "intemperies-mauvais-temps",
  ];

  const items = orderedSlugs
    .map((slug) => faqItems.find((f) => f.slug === slug))
    .filter(Boolean) as typeof faqItems;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">🧾</span>
        <h1 className="text-3xl font-bold">Annulation d'une réservation</h1>
      </div>
      <div className="divide-y border rounded-lg">
        {items.map((q) => (
          <Link key={q.slug} href={`/settings/faq/${q.slug}`} className="block px-4 py-4 hover:bg-gray-50">
            <span className="text-gray-900">{q.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}


