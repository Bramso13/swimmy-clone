"use client";

import Link from "next/link";

const ownerQuestions = [
  {
    title: "Comment mettre ma piscine en ligne ?",
    content: (
      <p>
        Rendez-vous sur youmpool.com/proposer-ma-piscine, créez un compte, ajoutez vos photos, votre description, vos
        conditions… et c’est tout ! Vous serez contacté dès qu’une réservation arrive.
      </p>
    ),
  },
  {
    title: "Qui peut louer ma piscine ?",
    content: (
      <div className="space-y-2">
        <p>Des familles, des couples ou de petits groupes. Vous définissez :</p>
        <ul className="list-disc pl-5 text-gray-600 text-sm">
          <li>Le nombre maximum de personnes.</li>
          <li>Les horaires disponibles.</li>
          <li>Les règles d’usage (musique, repas, etc.).</li>
        </ul>
      </div>
    ),
  },
  {
    title: "Est-ce que les locataires ont accès à ma maison ?",
    content: (
      <p>
        Non. Vous choisissez les zones accessibles (jardin, toilettes extérieures, cuisine d’été…). Tout est précisé
        dans votre annonce.
      </p>
    ),
  },
  {
    title: "Est-ce sécurisé ?",
    content: (
      <p>
        Oui. Seuls les utilisateurs inscrits peuvent réserver. YoumPool vérifie chaque réservation et vous permet de
        refuser un locataire si vous avez un doute.
      </p>
    ),
  },
  {
    title: "Comment suis-je payé ?",
    content: (
      <p>
        Vous recevez le paiement par virement bancaire ou mobile money, 24 à 48h après la fin de la location. YoumPool
        prélève une petite commission pour gérer la plateforme.
      </p>
    ),
  },
  {
    title: "Puis-je annuler une réservation ?",
    content: (
      <p>
        Oui. En cas d’imprévu, vous pouvez annuler depuis votre tableau de bord. Essayez toutefois de prévenir au moins
        24h à l’avance pour éviter de décevoir vos locataires.
      </p>
    ),
  },
  {
    title: "Que se passe-t-il en cas de casse ou dégradation ?",
    content: (
      <p>
        YoumPool propose une caution optionnelle lors de la réservation. En cas de problème, nous intervenons pour gérer
        le litige et faire appliquer les conditions prévues.
      </p>
    ),
  },
];

const helpContact = {
  phone: "+216 XXXXXXXX",
  email: "contact@youmpool.com",
};

export default function ProprietairePage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-8">
        <Link href="/settings" className="text-[var(--brand-blue)] hover:underline">
          Centre d’aide
        </Link>
        <span className="mx-2 text-gray-500">›</span>
        <span className="text-gray-800">Je suis propriétaire</span>
      </div>

      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          <span className="text-5xl">🏠</span>
          Je suis propriétaire
        </h1>
        <p className="text-gray-600 text-lg">
          Vous souhaitez rentabiliser votre piscine ? Voici l’essentiel pour accueillir vos locataires sereinement.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {ownerQuestions.map((question) => (
          <article key={question.title} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-3">
            <h3 className="text-xl font-semibold text-gray-900">{question.title}</h3>
            <div className="text-gray-700 leading-relaxed text-sm">{question.content}</div>
          </article>
        ))}
      </div>

      <div className="mt-16 rounded-2xl border border-[var(--brand-blue)] bg-[var(--brand-blue)]/5 p-8 text-center space-y-3">
        <p className="text-lg font-semibold text-[var(--brand-blue)]">Une question urgente ?</p>
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
