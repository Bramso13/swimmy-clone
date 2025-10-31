export interface FaqItem {
  slug: string;
  title: string;
  excerpt: string;
  // React nodes to allow lists/formatting
  content: React.ReactNode;
}

export const faqItems: FaqItem[] = [
  {
    slug: "age-minimum-inscription",
    title: "Quel est l'âge minimum pour s'inscrire sur Swimmy ?",
    excerpt:
      "Pour s'inscrire sur Swimmy, vous devez avoir plus de 18 ans.",
    content: (
      <div className="space-y-6">
        <p>
          Pour s'inscrire sur Swimmy, vous devez avoir plus de 18 ans.
        </p>
      </div>
    ),
  },
  {
    slug: "est-ce-gratuit-pour-les-enfants",
    title: "Est-ce gratuit pour les enfants ? Si oui jusqu'à quel âge ?",
    excerpt:
      "Gratuité pour les 0-3 ans, demi-tarif pour les 3-12 ans.",
    content: (
      <div className="space-y-6">
        <p>
          Chez Swimmy, les enfants de 0 à 3 ans sont gratuits. De 3 à 12 ans, un tarif réduit de 50% s'applique par enfant.
        </p>
      </div>
    ),
  },
  {
    slug: "joindre-equipe-swimmy",
    title: "Comment joindre / contacter / appeler une personne de l'équipe Swimmy ?",
    excerpt:
      "Support via messagerie, e‑mail et formulaire de contact.",
    content: (
      <div className="space-y-6">
        <p>
          Utilisez la messagerie depuis votre compte, ou la page contact pour nous écrire. Nous répondons généralement sous 24h ouvrées.
        </p>
      </div>
    ),
  },
  {
    slug: "comment-trouver-une-piscine",
    title: "Comment trouver une piscine ?",
    excerpt:
      "Recherche par ville, filtre par prix, date et nombre de personnes.",
    content: (
      <div className="space-y-6">
        <p>
          Rendez‑vous sur la page de recherche, entrez votre destination et vos filtres, puis contactez l'hôte depuis la fiche piscine.
        </p>
      </div>
    ),
  },
  {
    slug: "reserver-le-jour-meme",
    title: "Est‑il possible de réserver une piscine le jour même ?",
    excerpt:
      "Oui si l'hôte est disponible et accepte rapidement votre demande.",
    content: (
      <div className="space-y-6">
        <p>
          C'est possible chez certains hôtes. Plus vous précisez vos horaires et le nombre de personnes, plus la réponse sera rapide.
        </p>
      </div>
    ),
  },
  {
    slug: "delai-reponse-proprietaire",
    title: "Combien de temps le propriétaire a t'il pour me répondre ?",
    excerpt:
      "La plupart répondent sous 24h; au‑delà, votre demande expire.",
    content: (
      <div className="space-y-6">
        <p>
          La majorité des hôtes répondent en moins de 24h. Passé un certain délai, la demande peut expirer automatiquement.
        </p>
      </div>
    ),
  },
  {
    slug: "connaitre-disponibilites",
    title: "Comment connaître les disponibilités d’une piscine ?",
    excerpt:
      "Consultez le calendrier de l'annonce et envoyez un message à l'hôte.",
    content: (
      <div className="space-y-6">
        <p>
          Les disponibilités sont visibles sur la fiche de la piscine. Si un doute subsiste, utilisez le bouton « Envoyer un message ».
        </p>
      </div>
    ),
  },
  {
    slug: "delai-acceptation-reservation",
    title: "Jusqu’à quand le propriétaire peut‑il accepter ma réservation ?",
    excerpt:
      "L'acceptation est possible tant que la demande est active (calendrier ouvert).",
    content: (
      <div className="space-y-6">
        <p>
          L'hôte peut accepter tant que la demande n'a pas expiré et que le créneau reste disponible dans son calendrier.
        </p>
      </div>
    ),
  },
  {
    slug: "comment-ca-marche",
    title: "Swimmy : comment ça marche ?",
    excerpt:
      "Tout savoir sur le fonctionnement des locations. Les locations fonctionnent par heure et par personne…",
    content: (
      <div className="space-y-6">
        <p>
          Tout savoir sur le fonctionnement des locations. Dans cet article, nous vous expliquons tout le déroulement d'une
          location, de son début (l'inscription et la réservation) à sa fin (l'état des lieux de sortie).
        </p>
        <p>
          Les locations chez Swimmy <strong>fonctionnent par heure et par personne</strong>.
        </p>
        <p>Par exemple :</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Michel a une piscine, qu'il met en location au prix de 8€ / heure / personne
          </li>
          <li>
            Vous souhaitez réserver la piscine de Michel Samedi après‑midi, avec votre époux et vos deux enfants, pour une
            durée de deux heures » vous payerez 4 personnes × 8€ × 2 heures = 64€ avant application de nos frais de service.
          </li>
        </ul>
        <p>
          Pour rappel, Swimmy est gratuit pour les enfants de 0 à 3 ans, et le tarif est réduit de 50% pour les enfants de 3 à
          12 ans.
        </p>
      </div>
    ),
  },
  {
    slug: "contacter-un-proprietaire",
    title: "Comment contacter un propriétaire ?",
    excerpt:
      "Pour contacter un propriétaire, connectez‑vous sur votre compte Swimmy puis cliquez sur “Envoyer un message”…",
    content: (
      <div className="space-y-6">
        <p>
          Pour contacter un propriétaire, connectez‑vous sur votre compte Swimmy puis cliquez sur "Envoyer un message" en
          dessous du titre de l'annonce dans la rubrique “Votre hôte”.
        </p>
      </div>
    ),
  },
  {
    slug: "coronavirus-que-fait-on",
    title: "Et pour le coronavirus, que fait‑on ?",
    excerpt:
      "En synthèse : le virus ne semble pas survivre dans une eau correctement traitée au chlore…",
    content: (
      <div className="space-y-6">
        <div className="border-l-4 p-6" style={{ backgroundColor: "#e6f4ff", borderColor: "#0094EC" }}>
          <p className="font-semibold mb-3">En synthèse :</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Le virus ne semble pas pouvoir survivre dans une eau bien traitée au chlore (nota : le sel contient du chlore)
            </li>
            <li>
              Il peut en revanche toujours être transmis via des contacts humains directs, ou via des surfaces intermédiaires :
              les mesures d'hygiène (douche pour les locataires avant de se baigner), les mesures barrières toujours valables,
              et les mesures sanitaires (désinfection des surfaces) restent très importantes
            </li>
          </ul>
        </div>
        <p>
          La première chose à avoir en tête sur ce sujet, c’est que l’on sait aujourd’hui relativement peu de choses sur la
          survie et la propagation du coronavirus dans l’eau. Les premières études et articles de presse sur le sujet ont tardé
          à sortir. Nous avons cependant relevé quelques sources cohérentes, qui nous permettent de partager ces observations.
        </p>
      </div>
    ),
  },
  {
    slug: "acces-a-ma-maison",
    title: "Les locataires ont‑t‑ils accès à ma maison ?",
    excerpt:
      "En tant que propriétaire, vous pouvez décider si le locataire a accès à votre maison ou non…",
    content: (
      <div className="space-y-6">
        <p>
          En tant que propriétaire, vous pouvez décider si le locataire a accès à votre maison ou non. Cette question est
          importante, notamment pour l'accès aux toilettes.
        </p>
        <p>
          Certains de nos propriétaires donnent un accès restreint à leurs toilettes, en début et en fin de location par
          exemple.
        </p>
        <p>
          Vous pouvez préciser dans le formulaire de gestion de votre annonce si vous autorisez ou non vos locataires à accéder
          à vos toilettes.
        </p>
      </div>
    ),
  },
  {
    slug: "annuler-une-reservation",
    title: "Comment annuler une réservation ?",
    excerpt:
      "Vous pouvez très facilement annuler votre réservation (sans frais) jusqu'à 48h avant le début…",
    content: (
      <div className="space-y-6">
        <p>
          Vous pouvez très facilement annuler votre réservation (sans frais) jusqu'à 48h avant le début de cette réservation.
          Si vous désirez annuler une réservation, il vous suffit de :
        </p>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Vous rendre sur votre compte,</li>
          <li>Aller dans « mes réservations »</li>
          <li>Cliquer sur la demande que vous souhaitez annuler.</li>
          <li>
            Vous trouverez ensuite le bouton « annuler » en bas de la page.
          </li>
        </ol>
        <p>
          Cas exceptionnels (si vous souhaitez annuler moins de 48h avant le début de la réservation) : Swimmy apprécie à sa
          seule discrétion, sur la base des éléments à sa disposition, la légitimité des demandes de remboursement qu'elle
          reçoit.
        </p>
      </div>
    ),
  },
  {
    slug: "assurance-speciale",
    title: "Dois‑je souscrire à une assurance spéciale ?",
    excerpt:
      "L'assurance Swimmy vous protège en cas de casse/dégradation. Garantie Dommages à la piscine…",
    content: (
      <div className="space-y-6">
        <p>
          L'assurance Swimmy vous protège en cas de casse/dégradation.
        </p>
        <p>
          Swimmy propose pour les propriétaires une garantie "Dommages à la piscine et aux installations extérieures".
        </p>
        <p>
          Une franchise sera appliquée pour les éventuels dommages causés aux biens mobiliers des propriétaires et s'élèvera à
          150 €. Elle est imputable au locataire.
        </p>
        <p>
          Seront exclus les dommages que les utilisateurs locataires pourraient se causer entre eux, qu'ils soient matériels ou
          corporels.
        </p>
        <p>
          Nous vous recommandons cependant de prévenir votre assureur de votre activité sur Swimmy. Il est normal qu'il en soit
          informé.
        </p>
        <p>
          Pour en savoir plus, n'hésitez pas à consulter nos Conditions d'Utilisation: « https://www.swimmy.fr/terms-of-use »
          Rubrique XVI « Assurance ».
        </p>
      </div>
    ),
  },
];


