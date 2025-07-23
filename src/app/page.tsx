import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col gap-16">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between gap-8 py-12">
        <div className="flex-1 flex flex-col gap-6 items-start">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-blue-700">
            Louez une piscine{" "}
            <span className="text-blue-400">près de chez vous</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            Swimmy Clone vous permet de trouver, réserver ou proposer une
            piscine en toute simplicité. Profitez d’un moment de détente, où que
            vous soyez, en toute sécurité.
          </p>
          <form className="flex gap-2 w-full max-w-md mt-2">
            <input
              type="text"
              placeholder="Ville, code postal..."
              className="flex-1 border rounded px-3 py-2"
            />
            <input type="date" className="border rounded px-3 py-2" />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition"
            >
              Rechercher
            </button>
          </form>
          <div className="flex gap-4 mt-4">
            <Link
              href="/dashboard/pools/new"
              className="underline text-blue-600 hover:text-blue-800"
            >
              Proposer ma piscine
            </Link>
            <Link
              href="/search"
              className="underline text-blue-600 hover:text-blue-800"
            >
              Voir toutes les piscines
            </Link>
          </div>
        </div>
        <div className="flex-1 flex justify-center">
          <Image
            src="/vercel.svg"
            alt="Piscine"
            width={320}
            height={220}
            className="rounded-lg shadow-lg border"
          />
        </div>
      </section>

      {/* Carrousel de piscines */}
      <section className="w-full">
        <h2 className="text-2xl font-bold mb-4 text-blue-700">
          Piscines populaires
        </h2>
        <div className="flex gap-6 overflow-x-auto pb-2">
          {/* Exemple de cartes, à remplacer par un map sur les vraies données */}
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="min-w-[260px] bg-white border rounded-lg shadow p-4 flex flex-col gap-2"
            >
              <Image
                src="/next.svg"
                alt="Piscine populaire"
                width={220}
                height={120}
                className="rounded"
              />
              <div className="font-semibold text-lg">
                Piscine d’exception #{i}
              </div>
              <div className="text-sm text-muted-foreground">Paris, 15ème</div>
              <div className="text-blue-600 font-bold">45 €/heure</div>
              <Link
                href="/pool/1"
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm text-center mt-2 hover:bg-blue-700 transition"
              >
                Voir
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Avantages */}
      <section className="grid md:grid-cols-3 gap-8 py-12">
        <div className="flex flex-col items-center text-center gap-2">
          <span className="text-3xl">💧</span>
          <h3 className="font-bold text-lg">Réservation instantanée</h3>
          <p className="text-muted-foreground">
            Trouvez une piscine disponible et réservez en quelques clics, sans
            prise de tête.
          </p>
        </div>
        <div className="flex flex-col items-center text-center gap-2">
          <span className="text-3xl">🔒</span>
          <h3 className="font-bold text-lg">Paiement sécurisé</h3>
          <p className="text-muted-foreground">
            Vos transactions sont protégées grâce à MangoPay et notre système de
            vérification.
          </p>
        </div>
        <div className="flex flex-col items-center text-center gap-2">
          <span className="text-3xl">🌞</span>
          <h3 className="font-bold text-lg">Expérience premium</h3>
          <p className="text-muted-foreground">
            Des piscines vérifiées, des hôtes réactifs, et un support à votre
            écoute.
          </p>
        </div>
      </section>

      {/* Call to action */}
      <section className="flex flex-col items-center gap-4 py-8 bg-blue-50 rounded-lg shadow-inner">
        <h2 className="text-2xl font-bold text-blue-700">Prêt à plonger ?</h2>
        <p className="text-muted-foreground">
          Inscrivez-vous gratuitement et profitez de l’été dès maintenant.
        </p>
        <Link
          href="/register"
          className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition"
        >
          Créer mon compte
        </Link>
      </section>
    </div>
  );
}
