"use client";
import Image from "next/image";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import PoolCard from "@/components/PoolCard";
import SideMenu from "@/components/SideMenu";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function Home() {
  const [openCard, setOpenCard] = useState<"share" | "swim" | null>(null);
  const [openFaq, setOpenFaq] = useState<"children" | "contact" | "clean" | null>(null);
  const [pools, setPools] = useState<Array<{
    id: string;
    title: string;
    address: string;
    photos: string[];
    pricePerHour: number;
    approved?: boolean;
  }>>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showStickySearch, setShowStickySearch] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/pools", { cache: "no-store" });
        const data = await res.json();
        const all = Array.isArray(data?.pools) ? data.pools : [];
        const approvedOnly = all.filter((p: any) => p?.approved !== false);
        const top3 = approvedOnly.slice(0, 3);
        if (!cancelled) setPools(top3);
      } catch (e) {
        // ignore, laisser vide si erreur
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        setIsAuthenticated(!!session.data?.user);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // Afficher la barre de recherche sticky après 150px de scroll
      setShowStickySearch(window.scrollY > 150);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const toggleFaq = (faq: "children" | "contact" | "clean") => {
    setOpenFaq((prev) => (prev === faq ? null : faq));
  };

  const handleCreatePoolClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    try {
      const session = await authClient.getSession();
      
      if (session.data?.user) {
        // Utilisateur connecté, rediriger vers la création de piscine
        window.location.href = "/dashboard/pools/new";
      } else {
        // Utilisateur non connecté, rediriger vers la page de connexion
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de l'authentification:", error);
      // En cas d'erreur, rediriger vers la page de connexion par sécurité
      window.location.href = "/login";
    }
  };

  return (
    <div className="flex flex-col gap-16 bg-gray-100 min-h-screen">
      {/* SearchBar sticky */}
      {showStickySearch && (
        <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 py-4 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Menu à gauche */}
            <div className="flex-shrink-0">
              <SideMenu />
            </div>
            
            {/* SearchBar au centre */}
            <div className="absolute left-1/2 transform -translate-x-1/2 max-w-2xl">
              <SearchBar />
            </div>
            
            {/* Logo Swimmy à droite */}
            <div className="flex-shrink-0">
              <Link href="/">
                <h2 className="text-2xl font-bold" style={{color: '#0094ec', fontFamily: 'cursive'}}>
                  Swimmy
                </h2>
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {/* Hero Section */}
      <section className="overflow-hidden text-white py-12 w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]" style={{background: 'linear-gradient(to right, #0094ec, #4db8ff)'}}>
        <div className="flex flex-col gap-6 px-6 md:px-10 items-center">
          <div className="flex items-center justify-center w-full max-w-4xl">
            <SearchBar />
          </div>
          <div className="flex flex-col gap-6 items-center text-center w-full">
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
              Le bonheur
              <br />
              se partage
            </h1>
            <p className="text-white/90 max-w-xl text-lg">
              Ici, vous pouvez louer une piscine privée partout en France
            </p>
          </div>
        </div>
      </section>

      {/* Swimmy Section */}
      <section className="py-16 bg-gray-100 w-full -mx-4 px-4">
        <div className="grid md:grid-cols-2 gap-12 w-full items-center max-w-6xl mx-auto">
          {/* Colonne gauche : Titre */}
          <div className="text-left">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              Swimmy, c'est deux façons de faire{" "}
              <span style={{color: '#0094ec'}}>des heureux !</span>
            </h2>
          </div>

          {/* Colonne droite : Cartes */}
          <div className="flex flex-col gap-6">
            {/* Carte : Je partage ma piscine */}
            <div
              onClick={() => toggleCard("share")}
              className="bg-white rounded-lg p-6 w-full cursor-pointer hover:bg-gray-50 transition duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold">Je partage ma piscine</h3>
                </div>
                <span className="text-xl">{openCard === "share" ? "▲" : "▼"}</span>
              </div>
              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  openCard === "share" ? "max-h-[1000px] opacity-100 mt-4" : "max-h-0 opacity-0"
                }`}
              >
                <div className="text-gray-700 text-sm whitespace-pre-line mb-4">
                  Simple, flexible, sécurisé.
                  {"\n"}Fixez vous-même le prix et le nombre de personnes accueillies.
                  {"\n"}Précisez les règles à respecter.
                  {"\n"}Modifiez vos disponibilités comme vous le souhaitez.
                  {"\n\n"}Ce n'est pas tout : nous avons prévu une assurance en cas de pépin.
                  {"\n"}Un contrat pour éviter les mauvaises surprises.
                  {"\n"}Et une équipe support hautement disponible.
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={handleCreatePoolClick}
                    className="inline-flex items-center gap-2 text-white font-medium px-6 py-3 rounded-full shadow-md transition-colors duration-200"
                    style={{backgroundColor: '#0094ec'}}
                    onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#0078c4'}
                    onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#0094ec'}
                  >
                    Louez votre piscine facilement
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Carte : Je vais me baigner */}
            <div
              onClick={() => toggleCard("swim")}
              className="bg-white rounded-lg p-6 w-full cursor-pointer hover:bg-gray-50 transition duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold">Je vais me baigner</h3>
                </div>
                <span className="text-xl">{openCard === "swim" ? "▲" : "▼"}</span>
              </div>
              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  openCard === "swim" ? "max-h-[1000px] opacity-100 mt-4" : "max-h-0 opacity-0"
                }`}
              >
                <div className="text-gray-700 text-sm whitespace-pre-line mb-4">
                  Simple, abordable et très très sympa
                  {"\n"}Passez un bon moment avec ceux que vous aimez. C'est à la carte, selon vos envies et vos humeurs, dans des lieux vérifiés, chez des hôtes sérieux et heureux de vous accueillir.
                  {"\n"}Notre équipe est là pour vous accompagner à chaque étape.
                </div>
                <div className="flex justify-center">
                  <Link
                    href="/search"
                    className="inline-flex items-center gap-2 text-white font-medium px-6 py-3 rounded-full shadow-md transition-colors duration-200"
                    style={{backgroundColor: '#0094ec'}}
                    onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#0078c4'}
                    onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#0094ec'}
                  >
                    Vous aussi profitez de Swimmy
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Carrousel de piscines */}
      <section className="w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-gray-900">Vos piscines</span>
            <br />
            <span style={{color: '#0094ec'}}>près de chez vous !</span>
          </h2>
          <p className="text-gray-700 mt-4">
            Rien de plus simple pour passer un bon moment. Laquelle préférez-vous ?
          </p>
        </div>
        {pools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pb-2">
            {pools.map((p) => (
              <PoolCard
                key={p.id}
                pool={{
                  id: p.id,
                  title: p.title,
                  photos: p.photos || [],
                  pricePerHour: p.pricePerHour,
                  address: p.address,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-6 pb-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="min-w-[300px] bg-white border rounded-lg shadow-lg p-4 flex flex-col gap-2 opacity-70">
                <div className="w-[340px] h-[160px] bg-gray-200 rounded-lg" />
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
                <div className="h-5 bg-gray-200 rounded w-1/4" />
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="flex justify-center">
        <Link
          href="/search"
          className="inline-flex items-center justify-center gap-2 text-white font-medium px-8 py-4 rounded-full shadow-md transition-colors duration-200"
          style={{backgroundColor: '#0094ec'}}
          onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#0078c4'}
          onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#0094ec'}
        >
          Trouver une piscine près de chez vous
          <svg className="w-24 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
        
        <section
          className="py-16 w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]"
          style={{backgroundColor: '#0094ec'}}
        >
          <div className="max-w-4xl mx-auto">

            {/* Grille des événements */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">


              <div className="text-white rounded-lg p-6 flex flex-col items-start text-left hover:shadow-lg transition-shadow w-64 h-64">
                <h2 className="text-4xl font-bold mb-4">Un évenement à fêter ?</h2>
                <p className="text-white text-xl ">À chaque occasion sa piscine idéale</p>
              </div>

              {/* Pool Party */}
              <Link href="/search?events=1&music=1" className="bg-white rounded-lg p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow w-64 h-64">
                <h3 className="text-lg font-semibold text-black mb-2">Pool Party</h3>
                <div className="text-black text-xl mb-4">→</div>
                <div className="text-6xl">🏊‍♂️</div>
              </Link>

              {/* Team Building */}
              <Link href="/search?events=1" className="bg-white rounded-lg p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow w-64 h-64">
                <h3 className="text-lg font-semibold text-black mb-2">Team Building</h3>
                <div className="text-black text-xl mb-4">→</div>
                <div className="text-6xl">👨‍💼</div>
              </Link>

              {/* EVJF et EVG */}
              <Link href="/search?events=1" className="bg-white rounded-lg p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow w-64 h-64">
                <h3 className="text-lg font-semibold text-black mb-2">EVJF et EVG</h3>
                <div className="text-black text-xl mb-4">→</div>
                <div className="text-6xl">👑</div>
              </Link>

              {/* Anniversaire */}
              <Link href="/search?events=1&music=1" className="bg-white rounded-lg p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow w-64 h-64">
                <h3 className="text-lg font-semibold text-black mb-2">Anniversaire</h3>
                <div className="text-black text-xl mb-4">→</div>
                <div className="text-6xl">🎂</div>
              </Link>

              {/* Baby Shower */}
              <Link href="/search?events=1" className="bg-white rounded-lg p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow w-64 h-64">
                <h3 className="text-lg font-semibold text-black mb-2">Baby Shower</h3>
                <div className="text-black text-xl mb-4">→</div>
                <div className="text-6xl">👶</div>
              </Link>

            </div>

            {/* Texte et bouton */}
            <div className="text-center">
              <p className="text-white text-xl mb-8">
                Toutes les excuses sont bonnes pour piquer une tête.
              </p>
              <Link
                href="/search"
                className=" translate-y-8/5 inline-flex items-center gap-2 text-white font-medium px-8 py-4 rounded-full shadow-lg transition-colors duration-200"
                style={{backgroundColor: '#0067b9'}}
            onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#0078c4'}
            onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#0067b9'}
              >
                Une piscine pour le plaisir
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      
      {/* Section FAQ et Contact */}
      <section id="faq" className="py-12 w-full -mx-4 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            
            {/* Colonne gauche - FAQ */}
            <div className="rounded-lg p-8">
              <h2 className="text-3xl text-center font-bold text-black mb-2">
                Des questions ?
              </h2>
              <h3 className="text-4xl text-center font-bold mb-8" style={{color: '#0094ec'}}>
                Swimmy a tout prévu
              </h3>

              <div className="space-y-4">
                {/* FAQ : Est-ce gratuit pour les enfants ? */}
                <div
                  onClick={() => toggleFaq("children")}
                  className="bg-gray-100 rounded-lg p-4 cursor-pointer hover:bg-gray-200 transition duration-300"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-black">Est-ce gratuit pour les enfants ?</h4>
                    <span className="text-lg">{openFaq === "children" ? "▲" : "▼"}</span>
                  </div>
                  <div
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${
                      openFaq === "children" ? "max-h-[1000px] opacity-100 mt-3" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="text-gray-700 text-xs">
                      Oui pour les enfants de moins de 3 ans.
                    </div>
                  </div>
                </div>

                {/* FAQ : Comment contacter un propriétaire ? */}
                <div
                  onClick={() => toggleFaq("contact")}
                  className="bg-gray-100 rounded-lg p-4 cursor-pointer hover:bg-gray-200 transition duration-300"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-black">Comment contacter un propriétaire ?</h4>
                    <span className="text-lg">{openFaq === "contact" ? "▲" : "▼"}</span>
                  </div>
                  <div
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${
                      openFaq === "contact" ? "max-h-[1000px] opacity-100 mt-3" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="text-gray-700 text-xs whitespace-pre-line">
                      Pour contacter un propriétaire, connectez-vous sur votre compte Swimmy et cliquez sur le bouton "Contacter le propriétaire" sur la page de la piscine.
                      {"\n"}puis cliquez sur "Contacter l'hôte" sur la page de l'annonce qui vous
                      {"\n"}intéresse.
                    </div>
                  </div>
                </div>

                {/* FAQ : Accepter des inconnus dans sa piscine, est-ce bien propre ? */}
                <div
                  onClick={() => toggleFaq("clean")}
                  className="bg-gray-100 rounded-lg p-4 cursor-pointer hover:bg-gray-200 transition duration-300"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-black">Accepter des inconnus dans sa piscine, est-ce bien propre ?</h4>
                    <span className="text-lg">{openFaq === "clean" ? "▲" : "▼"}</span>
                  </div>
                  <div
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${
                      openFaq === "clean" ? "max-h-[1000px] opacity-100 mt-3" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="text-gray-700 text-xs">
                      Oui, en tout cas chez Swimmy : nos propriétaires entretiennent leurs piscines principalement au chlore, ce qui se manifeste par une eau claire et saine. Ce traitement permet de détruire toute bactérie présente dans l'eau de la piscine, sans pour autant être nocif pour votre santé. Par ailleurs, le premier facteur de dégradation de la qualité de l'eau d'une piscine (après le manque d'entretien) c'est sa fréquentation : concrètement, les piscines presentes sur Swimmy sont beaucoup moins fréquentées que les piscines publiques. Nos propriétaires mettent dans la plupart des cas une douche à votre disposition avant de plonger dans la piscine.
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <Link
                  href="/settings"
                  className="text-white px-6 py-3 rounded-full text-sm font-medium transition"
                  style={{backgroundColor: '#0094ec'}}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#0078c4'}
                  onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#0094ec'}
                >
                  Toutes les réponses à vos questions →
                </Link>
              </div>
            </div>

            {/* Colonne droite - Contact */}
            <div className="bg-blue-500 rounded-lg p-8 relative overflow-hidden flex flex-col items-center justify-center" style={{backgroundColor: '#0094ec'}}>
              <h2 className="text-2xl font-bold text-white text-center mb-8">
                Plus simple en direct ?
              </h2>
              
              <Link
                href="/contact"
                className="bg-white text-blue-500 px-8 py-4 rounded-full font-medium transition hover:bg-gray-100 border border-blue-200 inline-block"
              >
                Contactez-nous →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Louez votre piscine avec Swimmy */}
      <section className="py-20 w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]" style={{backgroundColor: '#0094ec'}}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            {/* Texte à gauche */}
            <div className="text-white text-left w-1/3">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                Louez votre piscine avec Swimmy
              </h2>
              <p className="text-lg text-white/90">
                Faites des heureux, tout en faisant de votre piscine un revenu.
              </p>
            </div>
            
            {/* Bouton */}
            <button
              onClick={handleCreatePoolClick}
              className="bg-white text-blue-600 px-8 py-4 rounded-full font-medium transition hover:bg-gray-100 inline-flex items-center gap-2 shadow-lg text-lg"
            >
              Louer votre piscine
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Avantages Section */}
      <section className="grid md:grid-cols-3 gap-8 py-12 w-full">
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
      {!isAuthenticated && (
        <section className="flex flex-col items-center gap-4 py-8 rounded-lg shadow-inner" style={{backgroundColor: '#f0f8ff'}}>
          <h2 className="text-2xl font-bold" style={{color: '#0094ec'}}>Prêt à plonger ?</h2>
          <p className="text-muted-foreground">
            Inscrivez-vous gratuitement et profitez de l'été dès maintenant.
          </p>
          <Link
            href="/register"
            className="text-white px-6 py-2 rounded font-semibold transition"
            style={{backgroundColor: '#0094ec'}}
              onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#0078c4'}
              onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#0094ec'}
          >
            Créer mon compte
          </Link>
        </section>
      )}
    </div>
  );
}
