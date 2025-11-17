"use client";
import Image from "next/image";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import PoolCard from "@/components/PoolCard";
import SideMenu from "@/components/SideMenu";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import React from "react";
import { useRouter } from "next/navigation";

const BRAND_BLUE = "#08436A";
const BRAND_BLUE_HOVER = "#06324B";
const BRAND_BLUE_GRADIENT = "#0A5B87";
const BRAND_BLUE_SOFT = "#E3ECF2";

export default function Home() {
  const router = useRouter();
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

  // Carrousel très simple pour afficher un avis à la fois
  function TestimonialCarousel() {
    const [items, setItems] = React.useState<Array<{ author: string; date: string; rating: number; content: string; poolTitle?: string }>>([]);
    const [index, setIndex] = React.useState(0);

    React.useEffect(() => {
      let cancelled = false;
      (async () => {
        try {
          const res = await fetch('/api/comments/recent?limit=10', { cache: 'no-store' });
          const data = await res.json();
          const list = Array.isArray(data?.comments) ? data.comments : [];
          const mapped = list.map((c: any) => ({
            author: c?.author?.name || c?.author?.email || 'Utilisateur',
            date: c?.createdAt ? new Date(c.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' }) : '',
            rating: Math.min(5, Math.max(1, Number(c?.rating || 5))),
            content: String(c?.content || ''),
            poolTitle: c?.pool?.title,
          }));
          if (!cancelled) setItems(mapped);
        } catch {}
      })();
      return () => { cancelled = true; };
    }, []);

    const hasItems = items.length > 0;
    const goPrev = () => setIndex((i) => (i - 1 + (items.length || 1)) % (items.length || 1));
    const goNext = () => setIndex((i) => (i + 1) % (items.length || 1));
    const t = hasItems ? items[index] : { author: '—', date: '', rating: 5, content: "Pas encore d'avis" };

    return (
      <div className="relative">
        <div className="mx-auto bg-white rounded-2xl shadow p-6 md:p-10 max-w-3xl">
          <p className="text-lg md:text-xl mb-6">“{t.content}”</p>
          <div className="flex items-center justify-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gray-200" />
            <div className="text-left">
              <div className="font-semibold">{t.author}</div>
              <div className="text-xs text-gray-500">{t.date}</div>
              {t.poolTitle && (<div className="text-xs text-gray-500">sur « {t.poolTitle} »</div>)}
              <div className="text-yellow-500 text-sm">{"★".repeat(t.rating)}{"☆".repeat(5 - t.rating)}</div>
            </div>
          </div>
        </div>
        <button
          aria-label="Précédent"
          onClick={goPrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-white rounded-full w-10 h-10 shadow flex items-center justify-center"
        >
          ◀
        </button>
        <button
          aria-label="Suivant"
          onClick={goNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full w-10 h-10 shadow flex items-center justify-center"
        >
          ▶
        </button>
      </div>
    );
  }

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
        router.push("/dashboard/pools/new");
      } else {
        // Utilisateur non connecté, rediriger vers la page de connexion
        router.push("/login");
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de l'authentification:", error);
      // En cas d'erreur, rediriger vers la page de connexion par sécurité
      router.push("/login");
    }
  };

  return (
    <div className="flex flex-col gap-16 bg-gray-100 min-h-screen">
      {/* SearchBar sticky */}
      <div 
        className={`fixed top-0 left-0 right-0 bg-white shadow-md z-50 py-4 px-4 transition-all duration-300 ease-in-out ${
          showStickySearch 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 -translate-y-full pointer-events-none'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Menu à gauche */}
            <div className="flex-shrink-0">
              <SideMenu />
            </div>
            
            {/* SearchBar au centre */}
            <div className="absolute left-1/2 transform -translate-x-1/2 max-w-2xl">
              <SearchBar />
            </div>
            
            {/* Logo YoumPool à droite */}
            <div className="flex-shrink-0">
              <Link href="/">
                <h2 className="text-2xl font-bold" style={{ color: BRAND_BLUE, fontFamily: 'cursive' }}>
                  YoumPool
                </h2>
              </Link>
            </div>
          </div>
        </div>
      
      {/* Hero Section */}
      <section
        className="overflow-hidden text-white py-16 w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]"
        style={{ background: `linear-gradient(to right, ${BRAND_BLUE}, ${BRAND_BLUE_GRADIENT})` }}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-10 flex flex-col items-center text-center gap-8">
          <p className="text-sm uppercase tracking-[0.4em] text-white/70">YoumPool · Tunisie</p>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            🏖 YoumPool — La piscine privée, enfin accessible à tous en Tunisie 🇹🇳
          </h1>
          <p className="text-white/90 text-lg max-w-3xl">
            Le bonheur se partage… et se savoure les pieds dans l’eau ! Réservez une piscine privée à l’heure, pour vos enfants, vos proches ou simplement pour souffler loin des hôtels hors de prix.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-full bg-white text-[var(--brand-blue)] font-semibold px-6 py-3 shadow-lg"
            >
              🔍 Je réserve ma piscine
            </Link>
            <button
              onClick={handleCreatePoolClick}
              className="inline-flex items-center gap-2 rounded-full border border-white/40 text-white font-semibold px-6 py-3 hover:bg-white/10"
            >
              🏠 Proposer ma piscine
            </button>
          </div>
          <div className="w-full max-w-3xl">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Pourquoi YoumPool */}
      <section className="py-16 bg-white w-full -mx-4 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Marre de chercher une piscine l’été ?<br /> YoumPool change la donne.
            </h2>
            <p className="text-gray-700 text-lg">
              Finies les chambres d’hôtel hors de prix pour simplement piquer une tête. Réservez une piscine privée près de chez vous,
              à l’heure, pour faire plaisir à vos enfants, à vos proches ou juste pour souffler.
            </p>
            <ul className="space-y-3 text-gray-700">
              <li>• Localisation facile via votre ville ou quartier.</li>
              <li>• Créneaux disponibles en temps réel.</li>
              <li>• Tarifs transparents, sans mauvaise surprise.</li>
            </ul>
            <p className="text-gray-700">
              YoumPool est la première plateforme de location de piscines privées en Tunisie. Simple pour les familles, rentable pour les propriétaires.
            </p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-8 space-y-6 shadow-sm">
            <div>
              <p className="text-sm font-semibold uppercase text-gray-500">Deux façons de faire des heureux</p>
              <h3 className="text-2xl font-bold mt-2">Choisissez votre camp</h3>
            </div>
            <div className="space-y-4">
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-semibold">🧺 Je veux me baigner</h4>
                  <Link href="/search" className="text-[var(--brand-blue)] text-sm font-semibold">Voir les piscines →</Link>
                </div>
                <p className="text-gray-600 mt-2">
                  Cherchez, réservez et plongez dans la piscine de vos rêves, pour un moment inoubliable en famille.
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-semibold">🏠 Je veux louer ma piscine</h4>
                  <button onClick={handleCreatePoolClick} className="text-[var(--brand-blue)] text-sm font-semibold">Je propose →</button>
                </div>
                <p className="text-gray-600 mt-2">
                  Rentabilisez votre piscine privée pendant l’été et accueillez des familles en quête de fraîcheur.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vos prochaines baignades */}
      <section className="py-16 bg-gray-50 w-full -mx-4 px-4">
        <div className="max-w-6xl mx-auto text-center space-y-10">
          <div className="space-y-4">
            <p className="text-sm font-semibold tracking-[0.3em] text-gray-500 uppercase">Vos prochaines baignades</p>
            <h2 className="text-3xl md:text-4xl font-bold">💧 Tout est pensé pour réserver sans stress</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Localisation instantanée, créneaux mis à jour et tarifs transparents : choisissez, réservez, profitez.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Localisation facile", desc: "Cherchez par ville, quartier ou spot préféré. Les piscines autour de vous s’affichent immédiatement." },
              { title: "Créneaux en temps réel", desc: "Consultez les disponibilités heure par heure et bloquez votre plage privée en quelques clics." },
              { title: "Tarifs transparents", desc: "Pas de surprise : vous connaissez le prix avant même de poser votre serviette." },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl p-6 text-left shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold mb-2 text-[var(--brand-blue)]">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Carrousel de piscines */}
      <section className="w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-gray-900">Vos piscines</span>
            <br />
            <span style={{ color: BRAND_BLUE }}>près de chez vous !</span>
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
          style={{ backgroundColor: BRAND_BLUE }}
          onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = BRAND_BLUE_HOVER}
          onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = BRAND_BLUE}
        >
          Trouver une piscine près de chez vous
          <svg className="w-24 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
        
        <section
          className="py-16 w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]"
          style={{ backgroundColor: BRAND_BLUE }}
        >
          <div className="max-w-5xl mx-auto text-white space-y-10 px-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">🎉 Toutes les occasions sont bonnes pour piquer une tête</h2>
              <p className="text-white/80">
                Choisissez un créneau, prévenez vos amis, on s’occupe du reste.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: "🎂 Anniversaire d’enfant", href: "/search?events=1&kids=1" },
                { label: "👰 EVJF / EVG", href: "/search?events=1" },
                { label: "🏖 Sortie en famille", href: "/search?family=1" },
                { label: "🤽‍♀ Team Building", href: "/search?events=1&teams=1" },
                { label: "👶 Baby Shower", href: "/search?events=1&baby=1" },
                { label: "🔥 Juste pour faire plaisir", href: "/search" },
              ].map((item) => (
                <Link key={item.label} href={item.href} className="bg-white/15 hover:bg-white/25 rounded-2xl px-5 py-6 text-center text-white font-semibold transition">
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="text-center">
              <Link
                href="/search"
                className="inline-flex items-center gap-2 text-white font-medium px-8 py-4 rounded-full shadow-lg transition-colors duration-200"
                style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
              >
                Je trouve ma piscine idéale →
              </Link>
            </div>
          </div>
        </section>
      
      {/* Sécurité */}
      <section className="py-16 bg-gray-100 w-full -mx-4 px-4">
        <div className="max-w-5xl mx-auto space-y-8 text-center">
          <div>
            <p className="text-sm font-semibold tracking-[0.3em] text-gray-500 uppercase">Sécurité & sérénité</p>
            <h2 className="text-3xl md:text-4xl font-bold mt-3">🧼 On a tout prévu pour que vous plongiez sereinement</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4 text-left">
            {[
              { title: "Propriétaires vérifiés", desc: "Chaque hôte est vérifié avant de publier sa piscine." },
              { title: "Conditions d’hygiène claires", desc: "L’eau et les équipements répondent à un niveau d’exigence précis." },
              { title: "Politique d’annulation transparente", desc: "Annulez sans stress en respectant les conditions de l’hôte." },
              { title: "Assistance 7J/7", desc: "Une équipe disponible par téléphone ou WhatsApp pour vous aider." },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold text-[var(--brand-blue)]">{item.title}</h3>
                <p className="text-gray-600 mt-2">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Témoignages (carrousel simple) */}
      <section className="w-full py-16">
        <div className="max-w-5xl mx-auto text-center px-4 space-y-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">💬 Ils en parlent mieux que nous</h2>
            <p className="text-gray-600">Des familles, des propriétaires, la même envie de profiter de l’été.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div className="border rounded-2xl p-6 shadow-sm">
              <p className="text-lg italic text-gray-800">
                « Enfin un moyen simple de profiter d’une piscine à Hammamet sans devoir payer un hôtel ! Mes enfants ont adoré. »
              </p>
              <p className="mt-4 font-semibold text-[var(--brand-blue)]">— Leïla, Tunis</p>
            </div>
            <div className="border rounded-2xl p-6 shadow-sm">
              <p className="text-lg italic text-gray-800">
                « J’ai loué ma piscine via YoumPool tout l’été. C’est fluide, sécurisé, et ça m’a permis de rencontrer des familles adorables. »
              </p>
              <p className="mt-4 font-semibold text-[var(--brand-blue)]">— Nabil, propriétaire à La Marsa</p>
            </div>
          </div>
        </div>
      </section>

      {/* Offre spéciale */}
      <section className="py-16 bg-white w-full -mx-4 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <p className="text-sm font-semibold tracking-[0.3em] text-gray-500 uppercase">Offre spéciale lancement</p>
          <h2 className="text-3xl md:text-4xl font-bold">🔥 -20% sur votre première réservation</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Utilisez le code <span className="font-semibold text-[var(--brand-blue)]">YOUMPOOL20</span> lors de votre prochaine réservation.
            Nombre de piscines limité pendant l’été, ne laissez pas passer les meilleurs spots !
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/search" className="px-6 py-3 rounded-full bg-[var(--brand-blue)] text-white font-semibold shadow">
              🔵 Je réserve ma piscine
            </Link>
            <button onClick={handleCreatePoolClick} className="px-6 py-3 rounded-full border border-[var(--brand-blue)] text-[var(--brand-blue)] font-semibold">
              🔵 Proposer ma piscine
            </button>
            <Link href="/register" className="px-6 py-3 rounded-full bg-gray-100 text-gray-900 font-semibold">
              🔵 Créer mon compte gratuitement
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
              <h3 className="text-4xl text-center font-bold mb-8" style={{ color: BRAND_BLUE }}>
                YoumPool a tout prévu
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
                    <div className="text-gray-700 text-sm">
                      Chaque piscine fixe ses règles, mais beaucoup offrent l’entrée gratuite pour les tout-petits. Vérifiez la fiche avant de réserver.
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
                    <div className="text-gray-700 text-sm whitespace-pre-line">
                      Une fois votre réservation confirmée, vous recevez ses coordonnées (appel, WhatsApp, e-mail) pour organiser votre arrivée ou poser vos questions.
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
                    <div className="text-gray-700 text-sm">
                      Oui. Nos propriétaires suivent un cahier des charges hygiène et nous restons disponibles 7J/7. En cas de souci, contactez-nous et nous intervenons rapidement.
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <Link
                  href="/settings"
                  className="text-white px-6 py-3 rounded-full text-sm font-medium transition"
                  style={{ backgroundColor: BRAND_BLUE }}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = BRAND_BLUE_HOVER}
                  onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = BRAND_BLUE}
                >
                  Toutes les réponses à vos questions →
                </Link>
              </div>
            </div>

            {/* Colonne droite - Contact */}
            <div className="bg-blue-500 rounded-lg p-8 relative overflow-hidden flex flex-col items-center justify-center" style={{ backgroundColor: BRAND_BLUE }}>
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

      {/* Louez votre piscine avec YoumPool */}
      <section className="py-20 w-screen relative mb-12 left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]" style={{ backgroundColor: BRAND_BLUE }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            {/* Texte à gauche */}
            <div className="text-white text-left w-1/3">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                Louez votre piscine avec YoumPool
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

      {/* Call to action */}
      {!isAuthenticated && (
        <section className="flex flex-col items-center gap-4 py-8 rounded-lg shadow-inner" style={{ backgroundColor: BRAND_BLUE_SOFT }}>
          <h2 className="text-2xl font-bold" style={{ color: BRAND_BLUE }}>Prêt à plonger ?</h2>
          <p className="text-muted-foreground">
            Inscrivez-vous gratuitement et profitez de l'été dès maintenant.
          </p>
          <Link
            href="/register"
            className="text-white px-6 py-2 rounded font-semibold transition"
            style={{ backgroundColor: BRAND_BLUE }}
            onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = BRAND_BLUE_HOVER}
            onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = BRAND_BLUE}
          >
            Créer mon compte
          </Link>
        </section>
      )}
    </div>
  );
}
