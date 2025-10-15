"use client";
import Image from "next/image";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import { useState } from "react";

export default function Home() {
  const [openCard, setOpenCard] = useState<"share" | "swim" | null>(null);

  const handleTest = async () => {
    const res = await fetch("/api/test", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    console.log(data);
  };

  const toggleCard = (card: "share" | "swim") => {
    setOpenCard((prev) => (prev === card ? null : card));
  };

  return (
    <div className="flex flex-col gap-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-blue-400 text-white">
        <div className="grid md:grid-cols-2 items-center gap-6 px-6 md:px-10 py-12">
          <div className="flex flex-col gap-6 items-start">
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
              Le bonheur
              <br />
              se partage
            </h1>
            <p className="text-white/90 max-w-xl text-lg">
              Ici, vous pouvez louer une piscine privée partout en France
            </p>
          </div>
          <div className="flex items-start justify-center md:justify-end">
            <div className="w-full md:max-w-xl">
              <SearchBar />
            </div>
          </div>
        </div>
      </section>

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

      {/* Carrousel de piscines */}
      <section className="w-full">
        <h2 className="text-2xl font-bold mb-4 text-blue-700">
          Vos piscines près de chez vous !
        </h2>
        <div className="flex gap-6 overflow-x-auto pb-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="min-w-[300px] bg-white border rounded-lg shadow-lg p-4 flex flex-col gap-2"
            >
              <Image
                src={`/images/piscine${i}.jpg`} // Replace with your actual image paths
                alt={`Piscine populaire ${i}`}
                width={340}
                height={180}
                className="rounded-lg"
              />
              <div className="font-semibold text-lg">
                Belle piscine, terrasse et jardin avec vue mer, à Toulon
              </div>
              <div className="text-sm text-gray-500">
                {i === 1 ? 'Mikar - Toulon' : i === 2 ? 'La Villa Les Glycines - 20 min de Paris' : 'Sud Gironde'}
              </div>
              <div className="text-blue-600 font-bold">
                {i === 1 ? '10 €/heure' : i === 2 ? '20 €/heure' : '12 €/heure'}
              </div>
              <Link
                href={`/pool/${i}`}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm text-center mt-2 hover:bg-blue-700 transition"
              >
                Voir
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Swimmy Section */}
      <section className="py-12 bg-white rounded-lg shadow flex flex-row items-center">
        <h2 className="text-2xl font-bold text-center mb-8">
          Swimmy, c’est deux façons de faire{" "}
          <span className="text-blue-600">des heureux !</span>
        </h2>

        <div className="flex flex-col gap-6 w-full justify-center items-stretch max-w-4xl">
          {/* Carte : Je partage ma piscine */}
          <div
            onClick={() => toggleCard("share")}
            className="bg-gray-100 rounded-lg p-6 w-full cursor-pointer hover:bg-gray-200 transition duration-300"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image
                  src="/icons/flippers.png"
                  alt="Partager piscine"
                  width={32}
                  height={32}
                />
                <h3 className="text-lg font-semibold">Je partage ma piscine</h3>
              </div>
              <span className="text-xl">{openCard === "share" ? "▲" : "▼"}</span>
            </div>
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                openCard === "share" ? "max-h-[1000px] opacity-100 mt-4" : "max-h-0 opacity-0"
              }`}
            >
              <div className="text-gray-700 text-sm whitespace-pre-line">
                Simple, flexible, sécurisé.
                {"\n"}Fixez vous-même le prix et le nombre de personnes accueillies.
                {"\n"}Précisez les règles à respecter.
                {"\n"}Modifiez vos disponibilités comme vous le souhaitez.
                {"\n\n"}Ce n’est pas tout : nous avons prévu une assurance en cas de pépin.
                {"\n"}Un contrat pour éviter les mauvaises surprises.
                {"\n"}Et une équipe support hautement disponible.
              </div>
            </div>
          </div>

          {/* Carte : Je vais me baigner */}
          <div
            onClick={() => toggleCard("swim")}
            className="bg-gray-100 rounded-lg p-6 w-full cursor-pointer hover:bg-gray-200 transition duration-300"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image
                  src="/icons/buoy.png"
                  alt="Je vais me baigner"
                  width={32}
                  height={32}
                />
                <h3 className="text-lg font-semibold">Je vais me baigner</h3>
              </div>
              <span className="text-xl">{openCard === "swim" ? "▲" : "▼"}</span>
            </div>
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                openCard === "swim" ? "max-h-[1000px] opacity-100 mt-4" : "max-h-0 opacity-0"
              }`}
            >
              <div className="text-gray-700 text-sm whitespace-pre-line">
                Simple, abordable et très très sympa
                {"\n"}Passez un bon moment avec ceux que vous aimez. C'est à la carte, selon vos envies et vos humeurs, dans des lieux vérifiés, chez des hôtes sérieux et heureux de vous accueillir.
                {"\n"}Notre équipe est là pour vous accompagner à chaque étape.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Avantages Section */}
      <section className="grid md:grid-cols-3 gap-8 py-12">
        <div className="flex flex-col items-center text-center gap-2">
          <span className="text-3xl">💧</span>
          <h3 className="font-bold text-lg">Réservation instantanée</h3>
          <p className="text-muted-foreground">
            Trouvez une piscine disponible et réservez en quelques clics, sans prise de tête.
          </p>
        </div>
        <div className="flex flex-col items-center text-center gap-2">
          <span className="text-3xl">🔒</span>
          <h3 className="font-bold text-lg">Paiement sécurisé</h3>
          <p className="text-muted-foreground">
            Vos transactions sont protégées grâce à MangoPay et notre système de vérification.
          </p>
        </div>
        <div className="flex flex-col items-center text-center gap-2">
          <span className="text-3xl">🌞</span>
          <h3 className="font-bold text-lg">Expérience premium</h3>
          <p className="text-muted-foreground">
            Des piscines vérifiées, des hôtes réactifs, et un support à votre écoute.
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
