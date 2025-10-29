"use client";
import React, { useState } from "react";
import PoolCard from "@/components/PoolCard";

async function getPools() {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  const res = await fetch(`${base}/api/pools`, { cache: "no-store" });
  const j = await res.json();
  return j.pools ?? [];
}

export default function SearchPage() {
  const [pools, setPools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    sortBy: 'closest', // 'closest', 'top', 'instant'
    topSelection: false,
    instant: false,
    indoor: false,
    jacuzzi: false,
    showMap: false
  });

  React.useEffect(() => {
    const loadPools = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_BASE_URL || 
          (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
        const res = await fetch(`${base}/api/pools`, { cache: "no-store" });
        const data = await res.json();
        setPools(data.pools ?? []);
      } catch (error) {
        console.error('Erreur lors du chargement des piscines:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPools();
  }, []);

  const handleSortChange = (sortType: string) => {
    setFilters(prev => ({ ...prev, sortBy: sortType }));
  };

  const handleFilterChange = (filterName: string) => {
    setFilters(prev => ({ ...prev, [filterName]: !prev[filterName as keyof typeof prev] }));
  };

  const handleMapToggle = () => {
    setFilters(prev => ({ ...prev, showMap: !prev.showMap }));
  };

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto p-4">
        <div className="text-center">Chargement...</div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">Toutes les piscines</h1>
      <p className="text-gray-600 mb-4">{pools.length} résultat{pools.length > 1 ? 's' : ''}</p>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => handleSortChange('closest')}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 ${
              filters.sortBy === 'closest' 
                ? 'bg-blue-50 text-blue-700 border-blue-200' 
                : 'text-gray-700'
            }`}
          >
            <span>🌍</span>
            <span>Au Plus Proche</span>
            {filters.sortBy === 'closest' && (
              <span className="ml-1 inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-600 text-white text-xs">✓</span>
            )}
          </button>

          <button 
            onClick={() => handleSortChange('top')}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 ${
              filters.sortBy === 'top' 
                ? 'bg-blue-50 text-blue-700 border-blue-200' 
                : 'text-gray-700'
            }`}
          >
            <span>⭐</span>
            <span>Top Sélection</span>
            {filters.sortBy === 'top' && (
              <span className="ml-1 inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-600 text-white text-xs">✓</span>
            )}
          </button>

          <button 
            onClick={() => handleSortChange('instant')}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 ${
              filters.sortBy === 'instant' 
                ? 'bg-blue-50 text-blue-700 border-blue-200' 
                : 'text-gray-700'
            }`}
          >
            <span>⚡</span>
            <span>Instantanée</span>
            {filters.sortBy === 'instant' && (
              <span className="ml-1 inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-600 text-white text-xs">✓</span>
            )}
          </button>

          <button 
            onClick={() => handleFilterChange('indoor')}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 ${
              filters.indoor 
                ? 'bg-blue-50 text-blue-700 border-blue-200' 
                : 'text-gray-700'
            }`}
          >
            <span>🏡</span>
            <span>Piscine intérieure / couverte</span>
            <input 
              type="checkbox" 
              checked={filters.indoor}
              onChange={() => handleFilterChange('indoor')}
              className="ml-2 h-5 w-5 rounded border" 
            />
          </button>

          <button 
            onClick={() => handleFilterChange('jacuzzi')}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 ${
              filters.jacuzzi 
                ? 'bg-blue-50 text-blue-700 border-blue-200' 
                : 'text-gray-700'
            }`}
          >
            <span>🛁</span>
            <span>Jacuzzi / Spa</span>
            <input 
              type="checkbox" 
              checked={filters.jacuzzi}
              onChange={() => handleFilterChange('jacuzzi')}
              className="ml-2 h-5 w-5 rounded border" 
            />
          </button>

          <button className="rounded-full border px-4 py-2">Prix</button>
          <button className="rounded-full border px-4 py-2">Plus de filtres</button>
        </div>

        <label className="flex items-center gap-3 text-gray-700">
          <span>Afficher la carte</span>
          <span className="relative inline-flex items-center">
            <input 
              type="checkbox" 
              checked={filters.showMap}
              onChange={handleMapToggle}
              className="sr-only peer" 
            />
            <div className={`w-12 h-6 rounded-full transition-colors ${
              filters.showMap ? 'bg-blue-600' : 'bg-gray-400'
            }`}></div>
            <div className={`absolute left-0.5 top-0.5 h-5 w-5 bg-white rounded-full transition-transform ${
              filters.showMap ? 'translate-x-6' : ''
            }`}></div>
          </span>
        </label>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {pools.map((p: any) => (
          <PoolCard key={p.id} pool={p} />
        ))}
      </div>
    </main>
  );
}


