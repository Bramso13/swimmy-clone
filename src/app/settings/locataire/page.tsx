"use client";

import Link from "next/link";

const renterQuestions = [
  {
    title: "Comment fonctionne YoumPool ?",
    content: (
      <p>
        YoumPool vous permet de réserver une piscine privée pour une durée précise, dans votre région, à des prix abordables.
        Choisissez une piscine, une date, un créneau horaire et le nombre de personnes, puis payez en ligne pour valider.
      </p>
    ),
  },
  {
    title: "Quel est l’âge minimum pour réserver sur YoumPool ?",
    content: <p>Il faut avoir au moins 18 ans pour créer un compte et effectuer une réservation.</p>,
  },
  {
    title: "Est-ce gratuit pour les enfants ?",
    content: (
      <p>
        Chaque propriétaire fixe ses propres règles. Certains offrent l’entrée gratuite pour les enfants en bas âge
        (souvent moins de 3 ou 5 ans). Cette information est indiquée sur l’annonce.
      </p>
    ),
  },
  {
    title: "Est-ce que je peux annuler une réservation ?",
    content: (
      <div className="space-y-2">
        <p>Oui, selon la politique d’annulation du propriétaire affichée avant votre paiement.</p>
        <ul className="list-disc pl-5 text-gray-600">
          <li>Certaines piscines autorisent l’annulation gratuite jusqu’à 24h avant.</li>
          <li>En cas de météo défavorable, YoumPool peut proposer un report si le propriétaire accepte.</li>
        </ul>
      </div>
    ),
  },
  {
    title: "Comment contacter un propriétaire ?",
    content: (
      <p>
        Une fois votre réservation confirmée, vous avez accès à ses coordonnées (téléphone, WhatsApp ou messagerie YoumPool)
        pour discuter des détails pratiques.
      </p>
    ),
  },
  {
    title: "Et la sécurité ?",
    content: (
      <p>
        Les propriétaires s’engagent à respecter un minimum d’hygiène et à entretenir leur piscine. YoumPool vérifie chaque
        annonce avant publication et notre service client reste disponible pour vous assister en cas de problème.
      </p>
    ),
  },
  {
    title: "Dois-je souscrire à une assurance ?",
    content: (
      <p>
        Non, ce n’est pas obligatoire. Certaines piscines peuvent toutefois inclure une assurance ou une petite caution
        remboursable. C’est précisé sur chaque annonce.
      </p>
    ),
  },
];

const helpContact = {
  phone: "+216 XXXXXXXX",
  email: "contact@youmpool.com",
};

export default function LocatairePage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-8">
        <Link href="/settings" className="text-[var(--brand-blue)] hover:underline">
          Centre d’aide
        </Link>
        <span className="mx-2 text-gray-500">›</span>
        <span className="text-gray-800">Je suis locataire</span>
      </div>

      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          <span className="text-5xl">🏊‍♂️</span>
          Je suis locataire
        </h1>
        <p className="text-gray-600 text-lg">
          Trouvez ici toutes les réponses pour réserver une piscine privée en toute sérénité.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {renterQuestions.map((question) => (
          <article key={question.title} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-3">
            <h3 className="text-xl font-semibold text-gray-900">{question.title}</h3>
            <div className="text-gray-700 leading-relaxed text-sm">{question.content}</div>
          </article>
        ))}
      </div>

      <div className="mt-16 rounded-2xl border border-[var(--brand-blue)] bg-[var(--brand-blue)]/5 p-8 text-center space-y-3">
        <p className="text-lg font-semibold text-[var(--brand-blue)]">Besoin d’aide en direct ?</p>
        <p className="text-gray-700">
          Appelez-nous ou écrivez-nous sur WhatsApp au <span className="font-semibold">{helpContact.phone}</span>.
          Vous pouvez aussi nous contacter par mail :{" "}
          <a href="mailto:contact@youmpool.com" className="underline">
            {helpContact.email}
          </a>
          .
        </p>
      </div>
    </div>
  );
}
