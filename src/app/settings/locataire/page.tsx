"use client";

import Link from "next/link";
import { faqItems } from "../faq/data";

export default function LocatairePage() {
  // Questions pour "Comment fonctionne Swimmy"
  const commentFonctionneSlugs = [
    "age-minimum-inscription",
    "comment-ca-marche",
    "contacter-un-proprietaire",
    "est-ce-gratuit-pour-les-enfants",
    "joindre-equipe-swimmy",
    "comment-trouver-une-piscine",
  ];

  // Questions pour "Annulation d'une réservation"
  const annulationSlugs = [
    "modifier-date-reservation",
    "plus-ou-moins-de-personnes",
    "annuler-une-reservation",
    "proprietaire-annule-demande",
    "intemperies-mauvais-temps",
  ];

  const commentFonctionneItems = commentFonctionneSlugs
    .map((slug) => faqItems.find((f) => f.slug === slug))
    .filter(Boolean);

  const annulationItems = annulationSlugs
    .map((slug) => faqItems.find((f) => f.slug === slug))
    .filter(Boolean);

  // Questions pour "Paiements"
  const paiementsSlugs = [
    "double-reservation-debite-deux-fois",
    "moyens-de-paiement-acceptes",
    "debite-sans-acceptation-proprietaire",
    "quand-serai-je-debite",
    "carte-de-credit-ne-fonctionne-pas",
  ];

  // Questions pour "Gestion d'une location"
  const gestionLocationSlugs = [
    "retard-que-se-passe-t-il",
    "demande-reservation-refusee",
    "serai-je-seul-pendant-reservation",
    "proprietaire-ne-repond-plus",
  ];

  // Questions pour "Compte"
  const compteSlugs = [
    "supprimer-mon-compte",
    "compte-bloque-ou-mdp-oublie",
    "impossible-de-se-connecter",
  ];

  // Questions pour "Sinistre, litige, caution"
  const sinistreSlugs = [
    "sinistre-que-faire",
  ];

  // Questions pour "Assurance"
  const assuranceSlugs = [
    "location-assuree-probleme",
    "que-faire-declarer-sinistre",
  ];

  // Questions pour "Evaluations et commentaires"
  const evaluationsSlugs = [
    "voir-evaluation-recue",
    "mauvais-commentaire-que-faire",
    "comment-evaluer-une-location",
    "commentaire-au-proprietaire-apres-reservation",
  ];

  const paiementsItems = paiementsSlugs
    .map((slug) => faqItems.find((f) => f.slug === slug))
    .filter(Boolean);

  const gestionLocationItems = gestionLocationSlugs
    .map((slug) => faqItems.find((f) => f.slug === slug))
    .filter(Boolean);

  const compteItems = compteSlugs
    .map((slug) => faqItems.find((f) => f.slug === slug))
    .filter(Boolean);

  const sinistreItems = sinistreSlugs
    .map((slug) => faqItems.find((f) => f.slug === slug))
    .filter(Boolean);

  const assuranceItems = assuranceSlugs
    .map((slug) => faqItems.find((f) => f.slug === slug))
    .filter(Boolean);

  const evaluationsItems = evaluationsSlugs
    .map((slug) => faqItems.find((f) => f.slug === slug))
    .filter(Boolean);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <div className="mb-8">
        <Link href="/settings" className="text-[#0094ec] hover:underline">
          La foire aux questions
        </Link>
        <span className="mx-2 text-gray-500">›</span>
        <span className="text-gray-800">Je suis locataire</span>
      </div>

      {/* Titre avec emoji */}
      <div className="mb-6">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          <span className="text-5xl">🏊‍♂️</span>
          Je suis locataire
        </h1>
        <p className="text-gray-600 text-lg">
          Vous cherchez une piscine à louer près de chez vous ? Toutes les réponses à vos questions sont ici.
        </p>
      </div>

      {/* Deux colonnes de questions */}
      <div className="grid md:grid-cols-2 gap-12 mt-12">
        {/* Colonne gauche - Comment fonctionne Swimmy */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Comment fonctionne Swimmy
          </h2>
          <div className="space-y-4">
            {commentFonctionneItems.map((item, index) => (
              <div key={item.slug} className="border-b border-gray-200 pb-4">
                <Link
                  href={`/settings/faq/${item.slug}`}
                  className="flex items-start gap-3 group hover:text-[#0094ec] transition-colors"
                >
                  <span className="text-[#0094ec] mt-1">★</span>
                  <span className="text-gray-900 group-hover:text-[#0094ec]">
                    {item.title}
                  </span>
                </Link>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Link
              href="/settings"
              className="text-[#0094ec] hover:underline text-sm"
            >
              Afficher les 10 articles →
            </Link>
          </div>
        </div>

        {/* Colonne droite - Annulation d'une réservation */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Annulation d'une réservation
          </h2>
          <div className="space-y-4">
            {annulationItems.map((item, index) => (
              <div key={item.slug} className="border-b border-gray-200 pb-4">
                <Link
                  href={`/settings/faq/${item.slug}`}
                  className="block text-gray-900 hover:text-[#0094ec] transition-colors"
                >
                  {item.title}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Nouvelles sections - Deux colonnes */}
      <div className="grid md:grid-cols-2 gap-12 mt-16">
        {/* Colonne gauche */}
        <div className="space-y-12">
          {/* Section Paiements */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Paiements
            </h2>
            <div className="space-y-4">
              {paiementsItems.map((item) => (
                <div key={item.slug} className="border-b border-gray-200 pb-4">
                  <Link
                    href={`/settings/faq/${item.slug}`}
                    className="block text-gray-900 hover:text-[#0094ec] transition-colors"
                  >
                    {item.title}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Section Gestion d'une location */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Gestion d'une location
            </h2>
            <div className="space-y-4">
              {gestionLocationItems.map((item) => (
                <div key={item.slug} className="border-b border-gray-200 pb-4">
                  <Link
                    href={`/settings/faq/${item.slug}`}
                    className="block text-gray-900 hover:text-[#0094ec] transition-colors"
                  >
                    {item.title}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Colonne droite */}
        <div className="space-y-12">
          {/* Section Compte */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Compte
            </h2>
            <div className="space-y-4">
              {compteItems.map((item) => (
                <div key={item.slug} className="border-b border-gray-200 pb-4">
                  <Link
                    href={`/settings/faq/${item.slug}`}
                    className="block text-gray-900 hover:text-[#0094ec] transition-colors"
                  >
                    {item.title}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Section Sinistre, litige, caution */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Sinistre, litige, caution
            </h2>
            <div className="space-y-4">
              {sinistreItems.map((item) => (
                <div key={item.slug} className="border-b border-gray-200 pb-4">
                  <Link
                    href={`/settings/faq/${item.slug}`}
                    className="block text-gray-900 hover:text-[#0094ec] transition-colors"
                  >
                    {item.title}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Nouvelles sections - Assurance et Evaluations */}
      <div className="grid md:grid-cols-2 gap-12 mt-16">
        {/* Colonne gauche - Assurance */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Assurance
          </h2>
          <div className="space-y-4">
            {assuranceItems.map((item) => (
              <div key={item.slug} className="border-b border-gray-200 pb-4">
                <Link
                  href={`/settings/faq/${item.slug}`}
                  className="block text-gray-900 hover:text-[#0094ec] transition-colors"
                >
                  {item.title}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Colonne droite - Evaluations et commentaires */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Evaluations et commentaires
          </h2>
          <div className="space-y-4">
            {evaluationsItems.map((item) => (
              <div key={item.slug} className="border-b border-gray-200 pb-4">
                <Link
                  href={`/settings/faq/${item.slug}`}
                  className="block text-gray-900 hover:text-[#0094ec] transition-colors"
                >
                  {item.title}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

