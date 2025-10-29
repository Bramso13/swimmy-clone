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
        </div>
      </div>
    </div>
  );
}
