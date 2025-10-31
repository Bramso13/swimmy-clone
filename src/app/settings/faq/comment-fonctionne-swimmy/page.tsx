"use client";
import Link from "next/link";
import { faqItems } from "../data";

export default function CommentFonctionneSwimmyPage() {
  // titres à afficher dans l'ordre de l'image
  const orderedSlugs: string[] = [
    "age-minimum-inscription",
    "comment-ca-marche",
    "contacter-un-proprietaire",
    "est-ce-gratuit-pour-les-enfants",
    "joindre-equipe-swimmy",
    "comment-trouver-une-piscine",
    "reserver-le-jour-meme",
    "delai-reponse-proprietaire",
    "connaitre-disponibilites",
    "delai-acceptation-reservation",
  ];

  const items = orderedSlugs
    .map((slug) => faqItems.find((f) => f.slug === slug))
    .filter(Boolean) as typeof faqItems;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">💬</span>
        <h1 className="text-3xl font-bold">Comment fonctionne Swimmy</h1>
      </div>
      <p className="text-gray-600 mb-8">
        Comment réserver une piscine ? Tout le détail du fonctionnement de Swimmy se trouve dans cette section.
      </p>

      <div className="divide-y border rounded-lg">
        {items.map((q) => (
          <Link
            key={q.slug}
            href={`/settings/faq/${q.slug}`}
            className="block px-4 py-4 hover:bg-gray-50"
          >
            <div className="flex items-center gap-2">
              <span className="text-blue-500">★</span>
              <span className="text-gray-900">{q.title}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}


