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
    location: 'ALL' as 'ALL' | 'INDOOR' | 'OUTDOOR',
    jacuzzi: false,
    showMap: false
  });
  const [showPrice, setShowPrice] = useState(false);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

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

  const setLocationFilter = (loc: 'ALL' | 'INDOOR' | 'OUTDOOR') => {
    setFilters(prev => ({ ...prev, location: loc }));
  };

  const handleMapToggle = () => {
    setFilters(prev => ({ ...prev, showMap: !prev.showMap }));
  };

  const togglePricePanel = () => setShowPrice((s) => !s);

  const parsedMin = Number(minPrice);
  const parsedMax = Number(maxPrice);
  const hasMin = !Number.isNaN(parsedMin) && minPrice !== "";
  const hasMax = !Number.isNaN(parsedMax) && maxPrice !== "";

  const displayedPools = pools
    .filter((p: any) => {
      const price: number = Number(p?.pricePerHour ?? 0);
      if (hasMin && price < parsedMin) return false;
      if (hasMax && price > parsedMax) return false;
      if (filters.location !== 'ALL') {
        const loc = (p?.location === 'INDOOR' || p?.location === 'OUTDOOR') ? p.location : 'OUTDOOR';
        if (loc !== filters.location) return false;
      }
      if (filters.jacuzzi) {
        const equipments: string[] = Array.isArray(p?.extras?.equipments) ? p.extras.equipments : [];
        const normalized = equipments.map((e) => String(e).toLowerCase());
        const hasJacuzzi = normalized.includes('jacuzzi') || normalized.includes('spa');
        if (!hasJacuzzi) return false;
      }
      return true;
    });

  if (loading) {
    return (
      <main className="w-full p-0">
        <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen px-3 sm:px-4 md:px-6">
          <div className="text-center">Chargement...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full p-0">
      <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen px-3 sm:px-4 md:px-6">
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

          

          <div className="flex items-center gap-2 rounded-full border px-2 py-2">
            <span className="ml-1 mr-2 text-gray-700">Type</span>
            <button
              onClick={() => setLocationFilter('ALL')}
              className={`rounded-full px-3 py-1 text-sm ${filters.location === 'ALL' ? 'bg-blue-600 text-white' : 'text-gray-700'}`}
            >
              Tous
            </button>
            <button
              onClick={() => setLocationFilter('OUTDOOR')}
              className={`rounded-full px-3 py-1 text-sm ${filters.location === 'OUTDOOR' ? 'bg-blue-600 text-white' : 'text-gray-700'}`}
            >
              🌤️ Extérieur
            </button>
            <button
              onClick={() => setLocationFilter('INDOOR')}
              className={`rounded-full px-3 py-1 text-sm ${filters.location === 'INDOOR' ? 'bg-blue-600 text-white' : 'text-gray-700'}`}
            >
              🏡 Intérieur
            </button>
          </div>

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

          <div className="relative">
            <button 
              onClick={togglePricePanel}
              className={`rounded-full border px-4 py-2 ${showPrice ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}`}
            >
              Prix
            </button>
            {showPrice && (
              <div className="absolute z-10 mt-2 w-64 rounded-lg border bg-white p-3 shadow">
                <div className="text-sm text-gray-700 mb-2">Prix par heure (€)</div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-1/2 rounded border px-2 py-1 text-sm"
                    min={0}
                  />
                  <span className="text-gray-400">—</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-1/2 rounded border px-2 py-1 text-sm"
                    min={0}
                  />
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    className="text-xs text-gray-600 underline"
                    onClick={() => { setMinPrice(""); setMaxPrice(""); }}
                  >
                    Réinitialiser
                  </button>
                  <button
                    className="rounded bg-blue-600 px-3 py-1 text-xs text-white"
                    onClick={() => setShowPrice(false)}
                  >
                    Appliquer
                  </button>
                </div>
              </div>
            )}
          </div>
          
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
      
      {/* Liste + Carte (optionnelle) */}
      {filters.showMap ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Colonne liste */}
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {displayedPools.map((p: any) => (
                <PoolCard key={p.id} pool={p} />
              ))}
            </div>
          </div>
          {/* Colonne carte */}
          <div className="h-[70vh] lg:h-[80vh] sticky top-4 rounded overflow-hidden border">
            <iframe
              title="Carte des piscines"
              className="w-full h-full"
              src="https://www.openstreetmap.org/export/embed.html?bbox=-10.5%2C35%2C15.5%2C55&layer=mapnik"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {displayedPools.map((p: any) => (
            <PoolCard key={p.id} pool={p} />
          ))}
        </div>
      )}
      </div>
    </main>
  );
}


