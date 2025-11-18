"use client";
import React, { useState } from "react";
import PoolCard from "@/components/PoolCard";
import SideMenu from "@/components/SideMenu";
import { useSearchParams } from "next/navigation";

async function getPools() {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  const res = await fetch(`${base}/api/pools`, { cache: "no-store" });
  const j = await res.json();
  return j.pools ?? [];
}

type LocationSuggestion = {
  label: string;
  context?: string;
  latitude: number;
  longitude: number;
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [pools, setPools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    sortBy: 'closest', // 'closest', 'top', 'instant'
    topSelection: false,
    instant: false,
    location: 'ALL' as 'ALL' | 'INDOOR' | 'OUTDOOR',
    jacuzzi: false,
    showMap: false,
    superhost: false,
    events: false,
    music: false,
    pets: false,
  });
  const [showPrice, setShowPrice] = useState(false);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  // Plus de filtres
  const [moreOpen, setMoreOpen] = useState(false);
  const [searchDrawerOpen, setSearchDrawerOpen] = useState(false);
  const [searchDate, setSearchDate] = useState("");
  const [searchGuests, setSearchGuests] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [mobilePage, setMobilePage] = useState(0);
  const poolsPerPage = 10;
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationQuery, setLocationQuery] = useState<string>("");
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [selectedLocationCoords, setSelectedLocationCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const locationRef = React.useRef<HTMLDivElement | null>(null);
  const locationInputRef = React.useRef<HTMLInputElement | null>(null);
  const EQUIPMENT_OPTIONS: string[] = [
    "Barbecue",
    "Transats",
    "Wifi",
    "Parking",
    "Douche",
    "Serviettes",
    "Vestiaires",
    "WC",
    "Frigo",
    "Plancha",
    "Jacuzzi",
    "Spa",
    "Piscine chauffée",
    "Couverture",
    "Éclairage de nuit",
  ];
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>([]);
  const equipmentIcon = (label: string) => {
    const s = label.toLowerCase();
    if (s.includes('intérieure')) return '🏠';
    if (s.includes('chauff')) return '🔥';
    if (s.includes('douche')) return '🚿';
    if (s === 'wc' || s.includes('toilet')) return '🚻';
    if (s.includes('jacuzzi') || s.includes('spa')) return '🛁';
    if (s.includes('sauna')) return '🧖‍♂️';
    if (s.includes('jardin')) return '🌳';
    if (s.includes('transats')) return '🛋️';
    if (s.includes('table')) return '🪑';
    if (s.includes('barbecue') || s.includes('plancha')) return '🍖';
    if (s.includes('bouées')) return '🛟';
    if (s.includes("jeux d'extérieur")) return '🎯';
    if (s.includes('tennis')) return '🎾';
    if (s.includes('pétanque')) return '🥏';
    if (s.includes('wi-fi') || s.includes('wifi')) return '📶';
    return '✓';
  };

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

  React.useEffect(() => {
    if (!locationOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setLocationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [locationOpen]);

  React.useEffect(() => {
    if (!locationOpen) {
      return;
    }

    if (locationInputRef.current) {
      locationInputRef.current.focus();
      locationInputRef.current.select();
    }
  }, [locationOpen]);

  React.useEffect(() => {
    if (!locationOpen) {
      return;
    }

    const query = locationQuery.trim();
    if (query.length < 2) {
      setLocationSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLocationLoading(true);
      try {
        const params = new URLSearchParams({
          q: query,
          limit: "12",
          autocomplete: "1",
          type: "housenumber,street,locality,municipality",
        });
        const res = await fetch(`https://api-adresse.data.gouv.fr/search/?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error("Adresse API error");
        }
        const data = await res.json();
        const features = Array.isArray(data?.features) ? data.features : [];
        setLocationSuggestions(
          features
            .map((feature: any) => {
              const label = String(feature?.properties?.label ?? "");
              if (!label) return null;
              const coords = Array.isArray(feature?.geometry?.coordinates)
                ? feature.geometry.coordinates
                : null;
              if (!coords || typeof coords[0] !== "number" || typeof coords[1] !== "number") {
                return null;
              }
              const props = feature?.properties ?? {};
              const formatted = [props?.housenumber, props?.street, props?.locality, props?.postcode, props?.city]
                .map((part: any) => (typeof part === 'string' ? part : ''))
                .filter(Boolean)
                .join(', ');
              return {
                label,
                context: formatted || (typeof props?.context === 'string' ? props.context : undefined),
                longitude: coords[0],
                latitude: coords[1],
              };
            })
            .filter((item: LocationSuggestion | null): item is LocationSuggestion => Boolean(item))
        );
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        console.error("Erreur auto-complétion adresse:", error);
      } finally {
        if (!controller.signal.aborted) {
          setLocationLoading(false);
        }
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [locationQuery, locationOpen]);

  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const handleLocationSelect = (suggestion: LocationSuggestion | null) => {
    if (!suggestion) {
      setSelectedLocation("");
      setSelectedLocationCoords(null);
      setLocationQuery("");
    } else {
      setSelectedLocation(suggestion.label);
      setSelectedLocationCoords({ latitude: suggestion.latitude, longitude: suggestion.longitude });
      setLocationQuery(suggestion.label);
    }
    setLocationOpen(false);
  };

  const handleLocationKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const first = locationSuggestions[0];
      if (first) {
        handleLocationSelect(first);
      } else {
        // Pas de suggestion valide -> alerte visuelle rapide
        setLocationSuggestions([]);
      }
    }
  };

  // Pré-charger des filtres via l'URL (ex: /search?events=1&music=1)
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const events = params.get('events');
    const music = params.get('music');
    const pets = params.get('pets');
    const superhost = params.get('superhost');
    const eq = params.getAll('eq'); // plusieurs équipements: ?eq=Wifi&eq=Barbecue

    setFilters((f) => ({
      ...f,
      events: events === '1' || events === 'true',
      music: music === '1' || music === 'true',
      pets: pets === '1' || pets === 'true',
      superhost: superhost === '1' || superhost === 'true',
    }));
    if (eq.length > 0) {
      setSelectedEquipments(eq);
    }
  }, []);

  React.useEffect(() => {
    const query = searchParams.get('q');
    if (!query || query.trim().length === 0) {
      return;
    }
    let cancelled = false;
    const fetchFromQuery = async () => {
      setLocationLoading(true);
      try {
        const params = new URLSearchParams({
          q: query,
          limit: "1",
          autocomplete: "1",
          type: "housenumber,street,locality,municipality",
        });
        const res = await fetch(`https://api-adresse.data.gouv.fr/search/?${params.toString()}`);
        if (!res.ok) {
          throw new Error("Adresse API error");
        }
        const data = await res.json();
        const feature = Array.isArray(data?.features) ? data.features[0] : null;
        if (!feature) {
          return;
        }
        const coords = Array.isArray(feature?.geometry?.coordinates)
          ? feature.geometry.coordinates
          : null;
        if (!coords || typeof coords[0] !== "number" || typeof coords[1] !== "number") {
          return;
        }
        const label = String(feature?.properties?.label || query);
        if (!cancelled) {
          setSelectedLocation(label);
          setSelectedLocationCoords({ latitude: coords[1], longitude: coords[0] });
          setLocationQuery(label);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Erreur géocodage depuis la barre de recherche:", error);
        }
      } finally {
        if (!cancelled) {
          setLocationLoading(false);
        }
      }
    };
    fetchFromQuery();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

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
      // Animaux / Musique / Évènements basés sur règles (si présentes)
      const rules: string[] = Array.isArray(p?.rules) ? p.rules : [];
      const r = rules.map((x) => String(x).toLowerCase());
      if (filters.pets) {
        // On accepte si AUCUNE règle "pas d’animaux" n'est trouvée
        const forbidsPets = r.some((x) => x.includes('pas d’animaux') || x.includes('pas d\'animaux') || x.includes('animaux interdits'));
        if (forbidsPets) return false;
      }
      if (filters.music) {
        // On exige que la musique ne soit pas explicitement interdite
        const forbidsMusic = r.some((x) => x.includes('pas de musique'));
        if (forbidsMusic) return false;
      }
      if (filters.events) {
        const allowsEvents = r.some((x) => x.includes('événements autorisés') || x.includes('evenements autorises'));
        if (!allowsEvents) return false;
      }
      if (selectedEquipments.length > 0) {
        const equipments: string[] = Array.isArray(p?.extras?.equipments) ? p.extras.equipments : [];
        const normalized = equipments.map((e) => String(e).toLowerCase());
        const allSelectedPresent = selectedEquipments.every((s) => normalized.includes(s.toLowerCase()));
        if (!allSelectedPresent) return false;
      }
      return true;
    })
    .map((p: any) => {
      const hasPoolCoords = typeof p?.latitude === 'number' && typeof p?.longitude === 'number';
      const hasSelectedCoords = selectedLocationCoords && typeof selectedLocationCoords.latitude === 'number' && typeof selectedLocationCoords.longitude === 'number';
      let distanceKm: number | null = null;
      if (hasPoolCoords && hasSelectedCoords) {
        const toRad = (value: number) => (value * Math.PI) / 180;
        const R = 6371; // rayon de la Terre en km
        const dLat = toRad(p.latitude - selectedLocationCoords!.latitude);
        const dLon = toRad(p.longitude - selectedLocationCoords!.longitude);
        const lat1 = toRad(selectedLocationCoords!.latitude);
        const lat2 = toRad(p.latitude);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        distanceKm = Math.round((R * c) * 10) / 10;
      }
      return { ...p, distanceKm };
    })
    .sort((a: any, b: any) => {
      if (selectedLocationCoords) {
        const aHas = typeof a.distanceKm === 'number';
        const bHas = typeof b.distanceKm === 'number';
        if (aHas && bHas) {
          return a.distanceKm - b.distanceKm;
        }
        if (aHas) return -1;
        if (bHas) return 1;
      }
      return 0;
    });

  const totalMobilePages = Math.max(1, Math.ceil(displayedPools.length / poolsPerPage));
  const poolsToRender = isMobile
    ? displayedPools.slice(mobilePage * poolsPerPage, mobilePage * poolsPerPage + poolsPerPage)
    : displayedPools;

  React.useEffect(() => {
    if (!isMobile && mobilePage !== 0) {
      setMobilePage(0);
    } else if (isMobile) {
      if (mobilePage >= totalMobilePages) {
        setMobilePage(totalMobilePages - 1);
      }
    }
  }, [isMobile, mobilePage, totalMobilePages]);

  if (loading) {
    return (
      <main className="w-full p-0 overflow-x-hidden">
        <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen box-border px-3 sm:px-4 md:px-6">
          <div className="text-center">Chargement...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full p-0 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
        <div className="flex justify-center py-4">
          <div className="flex w-full max-w-3xl items-center gap-3">
            <button
              type="button"
              onClick={() => setSearchDrawerOpen(true)}
              className="flex flex-1 items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm"
            >
              <span className="text-xl">◀</span>
              <span className="font-semibold">{selectedLocation || "France"}</span>
              <span className="text-gray-500 truncate">
                {searchDate || "Ajoutez une date"}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setSearchDrawerOpen(true)}
              className="rounded-full border border-gray-200 bg-white p-2 shadow-sm"
              aria-label="Modifier la recherche"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 8h16" />
                <path d="M4 16h16" />
                <circle cx="9" cy="8" r="2" />
                <circle cx="15" cy="16" r="2" />
              </svg>
            </button>
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2">Toutes les piscines</h1>
        <p className="text-gray-600 mb-4">{pools.length} résultat{pools.length > 1 ? 's' : ''}</p>
      
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-3">
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
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-full border px-3 py-2">
              <span className="text-gray-700">Type</span>
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

            {/* Plus de filtres */}
            <div className="relative">
              <button
                onClick={() => setMoreOpen((v) => !v)}
                className={`rounded-full border px-4 py-2 ${moreOpen ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}`}
              >
                Plus de filtres{selectedEquipments.length > 0 ? ` (${selectedEquipments.length})` : ''}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-gray-700">Afficher la carte</span>
          <label className="inline-flex items-center gap-3 text-gray-700">
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
      </div>
      
      {/* Liste + Carte (optionnelle) */}
      {filters.showMap ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {poolsToRender.map((p: any) => (
                <PoolCard key={p.id} pool={p} />
              ))}
            </div>
            {isMobile && totalMobilePages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-6">
                <button
                  onClick={() => setMobilePage((page) => Math.max(0, page - 1))}
                  disabled={mobilePage === 0}
                  className="px-4 py-2 rounded-full border text-sm font-medium disabled:opacity-40"
                >
                  ◀ Retour
                </button>
                <span className="text-sm text-gray-600">
                  {mobilePage + 1} / {totalMobilePages}
                </span>
                <button
                  onClick={() => setMobilePage((page) => Math.min(totalMobilePages - 1, page + 1))}
                  disabled={mobilePage >= totalMobilePages - 1}
                  className="px-4 py-2 rounded-full border text-sm font-medium disabled:opacity-40"
                >
                  Suivant ▶
                </button>
              </div>
            )}
          </div>
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
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {poolsToRender.map((p: any) => (
              <PoolCard key={p.id} pool={p} />
            ))}
          </div>
          {isMobile && totalMobilePages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={() => setMobilePage((page) => Math.max(0, page - 1))}
                disabled={mobilePage === 0}
                className="px-4 py-2 rounded-full border text-sm font-medium disabled:opacity-40"
              >
                ◀ Retour
              </button>
              <span className="text-sm text-gray-600">
                {mobilePage + 1} / {totalMobilePages}
              </span>
              <button
                onClick={() => setMobilePage((page) => Math.min(totalMobilePages - 1, page + 1))}
                disabled={mobilePage >= totalMobilePages - 1}
                className="px-4 py-2 rounded-full border text-sm font-medium disabled:opacity-40"
              >
                Suivant ▶
              </button>
            </div>
          )}
        </>
      )}
      </div>

      {/* Modale de recherche compacte */}
      {searchDrawerOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSearchDrawerOpen(false)} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <button className="text-2xl" onClick={() => setSearchDrawerOpen(false)}>✕</button>
              <div className="text-base font-semibold">Modifiez votre recherche</div>
              <div className="w-6 h-6 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 8h16" />
                  <path d="M4 16h16" />
                  <circle cx="9" cy="8" r="2" />
                  <circle cx="15" cy="16" r="2" />
                </svg>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="rounded-2xl border border-gray-200 overflow-hidden">
                <div ref={locationRef} className="relative">
                  <button
                    type="button"
                    className="flex items-center gap-3 px-4 py-3 w-full text-left"
                    onClick={() => {
                      setLocationQuery(selectedLocation);
                      setLocationOpen((prev) => !prev);
                    }}
                  >
                    <span className="text-lg">🔍</span>
                    <span className="flex-1 flex flex-col">
                      <span className="text-sm text-gray-500">Où ?</span>
                      <span className="font-semibold">{selectedLocation || "France"}</span>
                    </span>
                  </button>
                  {locationOpen && (
                    <div className="absolute left-4 right-4 top-[72px] z-50 rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
                      <label className="mb-2 block text-xs font-semibold text-gray-500" htmlFor="search-location-input-modal">
                        Rechercher un lieu
                      </label>
                      <input
                        id="search-location-input-modal"
                        ref={locationInputRef}
                        value={locationQuery}
                        onChange={(e) => setLocationQuery(e.target.value)}
                        onKeyDown={handleLocationKeyDown}
                        placeholder="Ville, code postal, adresse"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                      />
                      <div className="mt-3 max-h-60 overflow-y-auto">
                        {locationLoading && (
                          <div className="py-2 text-sm text-gray-500">Chargement...</div>
                        )}
                        {!locationLoading && locationSuggestions.length === 0 && locationQuery.trim().length < 2 && (
                          <div className="py-2 text-sm text-gray-500">
                            Saisissez au moins 2 lettres
                          </div>
                        )}
                        {!locationLoading && locationSuggestions.length === 0 && locationQuery.trim().length >= 2 && (
                          <div className="py-2 text-sm text-gray-500">
                            Aucun résultat
                          </div>
                        )}
                        {locationSuggestions.map((suggestion) => (
                          <button
                            key={`${suggestion.label}-${suggestion.latitude}-${suggestion.longitude}`}
                            type="button"
                            className="flex w-full flex-col items-start gap-0.5 rounded-lg px-3 py-2 text-left hover:bg-blue-50"
                            onMouseDown={(event) => {
                              event.preventDefault();
                              handleLocationSelect(suggestion);
                              setLocationOpen(false);
                            }}
                          >
                            <span className="text-sm font-medium text-gray-900">{suggestion.label}</span>
                            {suggestion.context && (
                              <span className="text-xs text-gray-500">{suggestion.context}</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 border-t border-gray-200">
                  <div className="flex flex-col gap-2 px-4 py-3 border-r border-gray-200">
                    <span className="text-sm text-gray-500">Quand ?</span>
                    <input
                      type="date"
                      value={searchDate}
                      onChange={(e) => setSearchDate(e.target.value)}
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-2 px-4 py-3">
                    <span className="text-sm text-gray-500">Combien ?</span>
                    <input
                      type="number"
                      min={0}
                      value={searchGuests}
                      onChange={(e) => setSearchGuests(e.target.value)}
                      placeholder="0"
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
              <button
                className="w-full rounded-full bg-blue-600 px-4 py-3 text-white font-semibold"
                onClick={() => setSearchDrawerOpen(false)}
              >
                Afficher les résultats
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Plus de filtres */}
      {moreOpen && (
        <div className="fixed inset-0 z-50">
          {/* overlay */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setMoreOpen(false)} />
          {/* panel */}
          <div className="absolute left-1/2 top-8 -translate-x-1/2 w-[92vw] max-w-3xl bg-white rounded-xl shadow-lg overflow-hidden flex flex-col max-h-[85vh]">
            {/* header */}
            <div className="flex items-center justify_between px-4 py-3 border-b">
              <div className="text-lg font-semibold">Plus de filtres</div>
              <button className="text-gray-600" onClick={() => setMoreOpen(false)}>✕</button>
            </div>
            {/* body scrollable */}
            <div className="overflow-auto p-4 space-y-6">
              {/* Switches */}
              <div>
                <div className="font-semibold mb-1">Superhôte</div>
                <p className="text-sm text-gray-600 mb-2">Passez un moment chez nos hôtes reconnus.</p>
                <label className="inline-flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={filters.superhost} onChange={() => setFilters((f)=>({...f, superhost: !f.superhost}))} className="sr-only" />
                  <span className={`w-12 h-6 rounded-full ${filters.superhost ? 'bg-blue-600' : 'bg-gray-300'} relative`}> 
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${filters.superhost ? 'translate-x-6' : ''}`} />
                  </span>
                </label>
              </div>

              <div>
                <div className="font-semibold mb-1">Évènements</div>
                <p className="text-sm text-gray-600 mb-2">Organisez votre évènement au bord d'une piscine.</p>
                <label className="inline-flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={filters.events} onChange={() => setFilters((f)=>({...f, events: !f.events}))} className="sr-only" />
                  <span className={`w-12 h-6 rounded-full ${filters.events ? 'bg-blue-600' : 'bg-gray-300'} relative`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${filters.events ? 'translate-x-6' : ''}`} />
                  </span>
                </label>
              </div>

              <div>
                <div className="font-semibold mb-1">Musique</div>
                <p className="text-sm text-gray-600 mb-2">Baignez vous en musique.</p>
                <label className="inline-flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={filters.music} onChange={() => setFilters((f)=>({...f, music: !f.music}))} className="sr-only" />
                  <span className={`w-12 h-6 rounded-full ${filters.music ? 'bg-blue-600' : 'bg-gray-300'} relative`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${filters.music ? 'translate-x-6' : ''}`} />
                  </span>
                </label>
              </div>

              <div>
                <div className="font-semibold mb-1">Animaux</div>
                <p className="text-sm text-gray-600 mb-2">Passez l'après-midi sans oublier votre animal.</p>
                <label className="inline-flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={filters.pets} onChange={() => setFilters((f)=>({...f, pets: !f.pets}))} className="sr-only" />
                  <span className={`w-12 h-6 rounded-full ${filters.pets ? 'bg-blue-600' : 'bg-gray-300'} relative`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${filters.pets ? 'translate-x-6' : ''}`} />
                  </span>
                </label>
              </div>

              {/* Equipements */}
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-base font-semibold">Équipements</div>
                  <button className="text-sm text-gray-600 hover:underline" onClick={() => setSelectedEquipments([])}>Effacer</button>
                </div>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {EQUIPMENT_OPTIONS.map((opt) => {
                    const active = selectedEquipments.includes(opt);
                    return (
                      <label key={opt} className={`flex items-center gap-3 rounded-md border px-3 py-2 text-sm cursor-pointer ${active ? 'border-blue-600' : ''}`}>
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={() => setSelectedEquipments((prev)=> prev.includes(opt) ? prev.filter((e)=> e !== opt) : [...prev, opt])}
                        />
                        <span className="w-6 text-center">{equipmentIcon(opt)}</span>
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
            {/* footer */}
            <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
              <button className="rounded-full border px-4 py-2" onClick={() => { setSelectedEquipments([]); setFilters((f)=>({ ...f, superhost:false, events:false, music:false, pets:false })); setMinPrice(''); setMaxPrice(''); }}>Remettre à zéro</button>
              <div className="flex items-center gap-2">
                <button className="rounded-full border px-4 py-2" onClick={() => setMoreOpen(false)}>Annuler</button>
                <button className="rounded-full px-5 py-2 text-white" style={{ backgroundColor: 'var(--brand-blue)' }} onClick={() => setMoreOpen(false)}>Valider</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}



