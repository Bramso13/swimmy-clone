"use client";

import Link from "next/link";
import { faqItems } from "../faq/data";

export default function ProprietairePage() {
  // Questions pour "Gérer les demandes de location"
  const gererDemandesSlugs = [
    "joindre-equipe-swimmy",
    "comment-ca-marche",
    "delai-reponse-proprietaire",
    "delai-acceptation-reservation",
    "proprietaire-ne-repond-plus",
  ];

  // Titres personnalisés pour certaines questions
  const titrePersonnalise: { [key: string]: string } = {
    "comment-ca-marche": "Qu'est-ce qu'une demande de location ?",
    "delai-reponse-proprietaire": "Comment suis-je averti d'une demande de location ?",
    "delai-acceptation-reservation": "Combien de temps ai-je pour répondre au locataire ?",
    "proprietaire-ne-repond-plus": "Le locataire ne me répond pas",
  };

  // Questions pour "Gestion d'une location"
  const gestionLocationSlugs = [
    "coronavirus-que-fait-on",
    "acces-a-ma-maison",
    "retard-que-se-passe-t-il",
  ];

  // Questions supplémentaires pour la colonne droite
  const questionsGestionLocation = [
    { slug: "coronavirus-que-fait-on", titre: "Et pour le coronavirus, que fait-on ?", hasStar: true },
    { slug: "acces-a-ma-maison", titre: "Les locataires ont-ils accès à ma maison ?", hasStar: true },
    { slug: "menage-avant-apres", titre: "Dois-je faire le ménage avant / après la location ?", hasStar: false, isPlaceholder: true },
    { slug: "retard-que-se-passe-t-il", titre: "Que se passe-t-il si le locataire ne se présente pas ou est en retard ?", hasStar: false },
  ];

  const gererDemandesItems = gererDemandesSlugs
    .map((slug) => faqItems.find((f) => f.slug === slug))
    .filter(Boolean);

  const gestionLocationItems = gestionLocationSlugs
    .map((slug) => faqItems.find((f) => f.slug === slug))
    .filter(Boolean);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <div className="mb-8">
        <Link href="/settings" className="text-[var(--brand-blue)] hover:underline">
          La foire aux questions
        </Link>
        <span className="mx-2 text-gray-500">›</span>
        <span className="text-gray-800">Je suis propriétaire</span>
      </div>

      {/* Titre avec emoji */}
      <div className="mb-6">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          <span className="text-5xl">🦆</span>
          Je suis propriétaire
        </h1>
        <p className="text-gray-600 text-lg">
          Vous souhaitez mettre votre piscine en location et vous avez des questions ? C'est par ici.
        </p>
      </div>

      {/* Deux colonnes de questions */}
      <div className="grid md:grid-cols-2 gap-12 mt-12">
        {/* Colonne gauche - Gérer les demandes de location */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Gérer les demandes de location
          </h2>
          <div className="space-y-4">
            {gererDemandesItems.map((item, index) => {
              const titre = titrePersonnalise[item.slug] || item.title;
              return (
                <div key={item.slug} className="border-b border-gray-200 pb-4">
                  <Link
                    href={`/settings/faq/${item.slug}`}
                    className="block text-gray-900 hover:text-[var(--brand-blue)] transition-colors"
                  >
                    {titre}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Colonne droite - Gestion d'une location */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Gestion d'une location
          </h2>
          <div className="space-y-4">
            {questionsGestionLocation.map((q) => {
              const item = faqItems.find((f) => f.slug === q.slug);
              if (q.isPlaceholder) {
                return (
                  <div key={q.slug} className="border-b border-gray-200 pb-4">
                    <span className="text-gray-900">
                      {q.titre}
                    </span>
                  </div>
                );
              }
              if (!item) return null;
              return (
                <div key={q.slug} className="border-b border-gray-200 pb-4">
                  <Link
                    href={`/settings/faq/${q.slug}`}
                    className="flex items-start gap-3 group hover:text-[var(--brand-blue)] transition-colors"
                  >
                    {q.hasStar && <span className="text-[var(--brand-blue)] mt-1">★</span>}
                    <span className="text-gray-900 group-hover:text-[var(--brand-blue)]">
                      {q.titre}
                    </span>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Nouvelles sections - Deux colonnes */}
      <div className="grid md:grid-cols-2 gap-12 mt-16">
        {/* Colonne gauche */}
        <div className="space-y-12">
          {/* Section Utilisation des boosters */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Utilisation des boosters
            </h2>
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <span className="text-gray-900">
                  Pourquoi ma piscine n'est pas en première position alors que j'ai acheté des boosters ?
                </span>
              </div>
            </div>
          </div>

          {/* Section Paiements et fiscalité */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Paiements et fiscalité
            </h2>
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <span className="text-gray-900">
                  Que dois-je déclarer aux impôts ?
                </span>
              </div>
              <div className="border-b border-gray-200 pb-4">
                <span className="text-gray-900">
                  Quand suis-je crédité ?
                </span>
              </div>
              <div className="border-b border-gray-200 pb-4">
                <span className="text-gray-900">
                  Quelle est la commission de Swimmy ?
                </span>
              </div>
              <div className="border-b border-gray-200 pb-4">
                <span className="text-gray-900">
                  Est-ce qu'un locataire peut me régler en liquide ?
                </span>
              </div>
              <div className="border-b border-gray-200 pb-4">
                <span className="text-gray-900">
                  Ma location est terminée et je n'ai toujours pas reçu le paiement, est-ce normal ?
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne droite */}
        <div className="space-y-12">
          {/* Section Annulation d'une réservation */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Annulation d'une réservation
            </h2>
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <Link
                  href="/settings/faq/annuler-une-reservation"
                  className="flex items-start gap-3 group hover:text-[var(--brand-blue)] transition-colors"
                >
                  <span className="text-[var(--brand-blue)] mt-1">★</span>
                  <span className="text-gray-900 group-hover:text-[var(--brand-blue)]">
                    Comment annuler une réservation ?
                  </span>
                </Link>
              </div>
              <div className="border-b border-gray-200 pb-4">
                <Link
                  href="/settings/faq/intemperies-mauvais-temps"
                  className="block text-gray-900 hover:text-[var(--brand-blue)] transition-colors"
                >
                  Que faire si la météo est mauvaise ?
                </Link>
              </div>
            </div>
          </div>

          {/* Section Compte */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Compte
            </h2>
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <span className="text-gray-900">
                  Comment fermer ou mettre en pause mon annonce ?
                </span>
              </div>
              <div className="border-b border-gray-200 pb-4">
                <Link
                  href="/settings/faq/compte-bloque-ou-mdp-oublie"
                  className="block text-gray-900 hover:text-[var(--brand-blue)] transition-colors"
                >
                  Mon compte est bloqué / j'ai oublié mon mot de passe
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dernières sections - Deux colonnes */}
      <div className="grid md:grid-cols-2 gap-12 mt-16">
        {/* Colonne gauche */}
        <div className="space-y-12">
          {/* Section Assurance */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Assurance
            </h2>
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <Link
                  href="/settings/faq/assurance-speciale"
                  className="flex items-start gap-3 group hover:text-[var(--brand-blue)] transition-colors"
                >
                  <span className="text-[var(--brand-blue)] mt-1">★</span>
                  <span className="text-gray-900 group-hover:text-[var(--brand-blue)]">
                    Dois-je souscrire à une assurance spéciale ?
                  </span>
                </Link>
              </div>
              <div className="border-b border-gray-200 pb-4">
                <span className="text-gray-900">
                  Quelles normes dois-je respecter afin de pouvoir louer ma piscine sur Swimmy ?
                </span>
              </div>
            </div>
          </div>

          {/* Section Conciergerie et pool manager */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Conciergerie et pool manager
            </h2>
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <span className="text-gray-900">
                  Je suis absent: comment louer ma piscine ?
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne droite */}
        <div className="space-y-12">
          {/* Section Sinistre, litige, caution */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Sinistre, litige, caution
            </h2>
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <span className="text-gray-900">
                  Que se passe-t-il en cas de casse / dégradation ?
                </span>
              </div>
            </div>
          </div>

          {/* Section Evaluations et commentaires */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Evaluations et commentaires
            </h2>
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <Link
                  href="/settings/faq/voir-evaluation-recue"
                  className="block text-gray-900 hover:text-[var(--brand-blue)] transition-colors"
                >
                  Comment voir l'évaluation que j'ai reçue ?
                </Link>
              </div>
              <div className="border-b border-gray-200 pb-4">
                <Link
                  href="/settings/faq/mauvais-commentaire-que-faire"
                  className="block text-gray-900 hover:text-[var(--brand-blue)] transition-colors"
                >
                  Que faire en cas de mauvais commentaire ?
                </Link>
              </div>
              <div className="border-b border-gray-200 pb-4">
                <span className="text-gray-900">
                  Comment laisser un commentaire à un locataire après une réservation ?
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

