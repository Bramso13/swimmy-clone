"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { faqItems } from "./faq/data";

export default function SettingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Logique de recherche à implémenter
    console.log("Recherche:", searchQuery);
  };

  const handleLocataireClick = () => {
    // Redirection vers la page de recherche ou FAQ pour locataires
    router.push("/search");
  };

  const handleProprietaireClick = () => {
    // Redirection vers le dashboard ou FAQ pour propriétaires
    router.push("/dashboard/pools/new");
  };

  return (
    <div className="min-h-screen">
      {/* Header Section - Bleu */}
      <div className="py-16 px-4" style={{backgroundColor: '#0094EC'}}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Swimmy à la rescousse
          </h1>
          
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tapez ici votre question"
                className="w-full pl-16 pr-6 py-5 text-lg rounded-full border-0 focus:outline-none shadow-lg"
                style={{
                  backgroundColor: 'white',
                  fontSize: '18px',
                  fontWeight: '400'
                }}
              />
            </div>
          </form>
        </div>
      </div>

      {/* Content Section - Blanc */}
      <div className="bg-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Carte Locataire */}
            <div 
              onClick={handleLocataireClick}
              className="bg-white rounded-lg p-8 text-center cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 group"
              style={{border: '2px solid #0094EC'}}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#0078c4';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#0094EC';
              }}
            >
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                🏊‍♂️
              </div>
              <h2 className="text-2xl font-bold mb-4" style={{color: '#0094EC'}}>
                Je suis locataire
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Vous cherchez une piscine à louer près de chez vous ? Toutes les réponses à vos questions sont ici.
              </p>
            </div>

            {/* Carte Propriétaire */}
            <div 
              onClick={handleProprietaireClick}
              className="bg-white rounded-lg p-8 text-center cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 group"
              style={{border: '2px solid #0094EC'}}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#0078c4';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#0094EC';
              }}
            >
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                🦆
              </div>
              <h2 className="text-2xl font-bold mb-4" style={{color: '#0094EC'}}>
                Je suis propriétaire
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Vous souhaitez mettre votre piscine en location et vous avez des questions ? C'est par ici.
              </p>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-center mb-10">Quelques questions qui reviennent souvent</h2>
            <div className="grid md:grid-cols-3 gap-10">
              {faqItems.map((q) => (
                <div key={q.slug} className="space-y-2">
                  <Link href={`/settings/faq/${q.slug}`} className="block font-semibold hover:underline" style={{color: '#0094EC'}}>
                    {q.title}
                  </Link>
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                    {q.excerpt}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Thèmes d'aide */}
          <div className="mt-20">
            <h2 className="text-2xl font-bold text-center mb-10">Les autres thèmes pour vous aider à mieux comprendre Swimmy</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {/* Comment fonctionne Swimmy */}
              <div className="bg-white border-2 rounded-lg p-6 text-center cursor-pointer transition-all duration-300 hover:shadow-lg group"
                   style={{borderColor: '#E5E7EB'}}
                   onMouseEnter={(e) => {
                     e.currentTarget.style.borderColor = '#0094EC';
                     e.currentTarget.style.backgroundColor = '#F0F9FF';
                   }}
                   onMouseLeave={(e) => {
                     e.currentTarget.style.borderColor = '#E5E7EB';
                     e.currentTarget.style.backgroundColor = 'white';
                   }}>
                <div className="flex justify-center mb-3">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="font-medium" style={{color: '#0094EC'}}>Comment fonctionne Swimmy</p>
              </div>

              {/* Annulation d'une réservation */}
              <div className="bg-white border-2 rounded-lg p-6 text-center cursor-pointer transition-all duration-300 hover:shadow-lg group"
                   style={{borderColor: '#E5E7EB'}}
                   onMouseEnter={(e) => {
                     e.currentTarget.style.borderColor = '#0094EC';
                     e.currentTarget.style.backgroundColor = '#F0F9FF';
                   }}
                   onMouseLeave={(e) => {
                     e.currentTarget.style.borderColor = '#E5E7EB';
                     e.currentTarget.style.backgroundColor = 'white';
                   }}>
                <div className="flex justify-center mb-3">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 12H4m16 0l-4-4m4 4l-4 4" />
                  </svg>
                </div>
                <p className="font-medium" style={{color: '#0094EC'}}>Annulation d'une réservation</p>
              </div>

              {/* Paiements */}
              <div className="bg-white border-2 rounded-lg p-6 text-center cursor-pointer transition-all duration-300 hover:shadow-lg group"
                   style={{borderColor: '#E5E7EB'}}
                   onMouseEnter={(e) => {
                     e.currentTarget.style.borderColor = '#0094EC';
                     e.currentTarget.style.backgroundColor = '#F0F9FF';
                   }}
                   onMouseLeave={(e) => {
                     e.currentTarget.style.borderColor = '#E5E7EB';
                     e.currentTarget.style.backgroundColor = 'white';
                   }}>
                <div className="flex justify-center mb-3">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <p className="font-medium" style={{color: '#0094EC'}}>Paiements</p>
              </div>

              {/* Compte */}
              <div className="bg-white border-2 rounded-lg p-6 text-center cursor-pointer transition-all duration-300 hover:shadow-lg group"
                   style={{borderColor: '#E5E7EB'}}
                   onMouseEnter={(e) => {
                     e.currentTarget.style.borderColor = '#0094EC';
                     e.currentTarget.style.backgroundColor = '#F0F9FF';
                   }}
                   onMouseLeave={(e) => {
                     e.currentTarget.style.borderColor = '#E5E7EB';
                     e.currentTarget.style.backgroundColor = 'white';
                   }}>
                <div className="flex justify-center mb-3">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <p className="font-medium" style={{color: '#0094EC'}}>Compte</p>
              </div>

              {/* Gestion d'une location */}
              <div className="bg-white border-2 rounded-lg p-6 text-center cursor-pointer transition-all duration-300 hover:shadow-lg group"
                   style={{borderColor: '#E5E7EB'}}
                   onMouseEnter={(e) => {
                     e.currentTarget.style.borderColor = '#0094EC';
                     e.currentTarget.style.backgroundColor = '#F0F9FF';
                   }}
                   onMouseLeave={(e) => {
                     e.currentTarget.style.borderColor = '#E5E7EB';
                     e.currentTarget.style.backgroundColor = 'white';
                   }}>
                <div className="flex justify-center mb-3">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <p className="font-medium" style={{color: '#0094EC'}}>Gestion d'une location</p>
              </div>

              {/* Sinistre, litige, caution */}
              <div className="bg-white border-2 rounded-lg p-6 text-center cursor-pointer transition-all duration-300 hover:shadow-lg group"
                   style={{borderColor: '#E5E7EB'}}
                   onMouseEnter={(e) => {
                     e.currentTarget.style.borderColor = '#0094EC';
                     e.currentTarget.style.backgroundColor = '#F0F9FF';
                   }}
                   onMouseLeave={(e) => {
                     e.currentTarget.style.borderColor = '#E5E7EB';
                     e.currentTarget.style.backgroundColor = 'white';
                   }}>
                <div className="flex justify-center mb-3">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <p className="font-medium" style={{color: '#0094EC'}}>Sinistre, litige, caution</p>
              </div>

              {/* Assurance */}
              <div className="bg-white border-2 rounded-lg p-6 text-center cursor-pointer transition-all duration-300 hover:shadow-lg group"
                   style={{borderColor: '#E5E7EB'}}
                   onMouseEnter={(e) => {
                     e.currentTarget.style.borderColor = '#0094EC';
                     e.currentTarget.style.backgroundColor = '#F0F9FF';
                   }}
                   onMouseLeave={(e) => {
                     e.currentTarget.style.borderColor = '#E5E7EB';
                     e.currentTarget.style.backgroundColor = 'white';
                   }}>
                <div className="flex justify-center mb-3">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="font-medium" style={{color: '#0094EC'}}>Assurance</p>
              </div>

              {/* Evaluations et commentaires */}
              <div className="bg-white border-2 rounded-lg p-6 text-center cursor-pointer transition-all duration-300 hover:shadow-lg group"
                   style={{borderColor: '#E5E7EB'}}
                   onMouseEnter={(e) => {
                     e.currentTarget.style.borderColor = '#0094EC';
                     e.currentTarget.style.backgroundColor = '#F0F9FF';
                   }}
                   onMouseLeave={(e) => {
                     e.currentTarget.style.borderColor = '#E5E7EB';
                     e.currentTarget.style.backgroundColor = 'white';
                   }}>
                <div className="flex justify-center mb-3">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <p className="font-medium" style={{color: '#0094EC'}}>Evaluations et commentaires</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
