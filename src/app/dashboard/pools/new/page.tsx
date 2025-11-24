"use client";
import React, { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/context/NotificationContext";
import { useApi } from "@/context/ApiContext";

const BRAND_BLUE = "var(--brand-blue)";
const BRAND_BLUE_HOVER = "color-mix(in srgb, var(--brand-blue) 85%, black)";
const BRAND_BLUE_SOFT = "#E3ECF2";

const personsOptions = [
  { label: "1 à 5", value: 5 },
  { label: "5 à 10", value: 10 },
  { label: "10+", value: 15 },
];

const rhythmOptions = [
  { label: "De temps en temps", value: "sometimes", factor: 1 },
  { label: "Tous les week-ends", value: "weekends", factor: 2 },
  { label: "En semaine et les week-ends", value: "both", factor: 3 },
];

const NewPoolPage = () => {
  const router = useRouter();
  const { success, error: notifyError } = useNotification();
  const { request } = useApi();
  const [region, setRegion] = useState("");
  const [persons, setPersons] = useState<number | null>(null);
  const [rhythm, setRhythm] = useState(rhythmOptions[0].value);
  const formRef = useRef<HTMLDivElement | null>(null);
  const addrTimerRef = useRef<NodeJS.Timeout | null>(null);
  const addrAbortRef = useRef<AbortController | null>(null);

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

  const RULE_OPTIONS: string[] = [
    "Convient aux enfants (0-12 ans)",
    "Pas d’alcool",
    "Pas de musique",
    "Pas d’animaux",
    "Événements autorisés",
    "Espace fumeur",
    "Non fumeur",
    "Naturisme non autorisé",
    "Musique autorisée / tolérée selon niveau",
    "Propriétaire présent pendant la location",
    "Restriction d’âge ou capacité selon enfants très jeunes / enfants ne sachant pas nager",
  ];

  // Icônes simples (emoji) pour les options
  const equipmentIcon = (label: string) => {
    const s = label.toLowerCase();
    if (s.includes("chauff") || s.includes("heater")) return "🔥";
    if (s.includes("douche") || s.includes("shower")) return "🚿";
    if (s.includes("wc") || s.includes("toilet")) return "🚻";
    if (s.includes("barbecue") || s.includes("plancha") || s.includes("bbq")) return "🍖";
    if (s.includes("transat") || s.includes("chaise") || s.includes("sunbed")) return "🪑";
    if (s.includes("wifi") || s.includes("wi-fi")) return "📶";
    if (s.includes("parking")) return "🅿️";
    if (s.includes("éclairage") || s.includes("eclairage") || s.includes("light")) return "💡";
    if (s.includes("jacuzzi") || s.includes("spa")) return "🛁";
    if (s.includes("couverture") || s.includes("abri")) return "🛡️";
    if (s.includes("serviette") || s.includes("towel")) return "🧺";
    if (s.includes("frigo")) return "🧊";
    return "✓";
  };

  const ruleIcon = (label: string) => {
    const s = label.toLowerCase();
    if (s.includes("non fumeur") || s.includes("no smoke") || s.includes("cig")) return "🚭";
    if (s.includes("animaux") || s.includes("pets")) return "🐾";
    if (s.includes("alcool")) return "🍷";
    if (s.includes("musique") || s.includes("bruit") || s.includes("noise")) return "🔊";
    if (s.includes("enfant") || s.includes("kids")) return "👨‍👩‍👧";
    if (s.includes("horaire") || s.includes("hours")) return "⏰";
    if (s.includes("propret") || s.includes("clean")) return "🧼";
    return "•";
  };

  // Fields for DB creation
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [pricePerHour, setPricePerHour] = useState<string>("");
  const [rules, setRules] = useState<string[]>([]);
  const [location, setLocation] = useState<"INDOOR" | "OUTDOOR">("OUTDOOR");
  const [ownerPresent, setOwnerPresent] = useState(false);
  const [product, setProduct] = useState("Chlore");
  const [equipmentInput, setEquipmentInput] = useState("");
  const [equipments, setEquipments] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressFocused, setAddressFocused] = useState(false);

  const revenue = useMemo(() => {
    const base = persons ? persons * 8 : 0; // simple maquette de calcul
    const factor = rhythmOptions.find((r) => r.value === rhythm)?.factor ?? 1;
    return base * factor;
  }, [persons, rhythm]);

  // Autocomplétion d'adresse via Nominatim
  React.useEffect(() => {
    const q = address.trim();
    if (!q || q.length < 3) {
      setAddressSuggestions([]);
      if (addrAbortRef.current) addrAbortRef.current.abort();
      if (addrTimerRef.current) clearTimeout(addrTimerRef.current);
      return;
    }
    if (addrTimerRef.current) clearTimeout(addrTimerRef.current);
    addrTimerRef.current = setTimeout(async () => {
      try {
        if (addrAbortRef.current) addrAbortRef.current.abort();
        addrAbortRef.current = new AbortController();
        setAddressLoading(true);
        const params = new URLSearchParams({
          format: "jsonv2",
          addressdetails: "1",
          q,
          limit: "5",
          countrycodes: "fr",
        });
        const res = await request(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
          signal: addrAbortRef.current.signal,
          headers: {
            "Accept-Language": "fr",
            "User-Agent": "YoumPool-clone/1.0 (autocomplete)"
          }
        });
        if (!res.ok) throw new Error("nominatim error");
        const data = await res.json();
        const list = Array.isArray(data)
          ? data.map((d: any) => ({ display_name: String(d?.display_name || ""), lat: String(d?.lat || ""), lon: String(d?.lon || "") }))
          : [];
        setAddressSuggestions(list);
      } catch (e) {
        if ((e as any)?.name !== "AbortError") {
          setAddressSuggestions([]);
        }
      } finally {
        setAddressLoading(false);
      }
    }, 300);

    return () => {
      if (addrTimerRef.current) clearTimeout(addrTimerRef.current);
    };
  }, [address, request]);

  return (
    <div className="relative">
      <section className="grid lg:grid-cols-2 gap-8 items-center">
        {/* Texte à gauche */}
        <div className="flex flex-col gap-6 py-6">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Gagnez de l'argent <span style={{ color: BRAND_BLUE }}>en</span>
            <br />
            louant votre piscine
          </h1>
          <p className="text-muted-foreground max-w-xl">
            Rentabilisez votre piscine dès le premier plongeon.
          </p>
          <p className="text-muted-foreground max-w-xl">
            YoumPool est le premier site de location de piscines entre particuliers.
            Vous fixez librement vos prix, vos règles, vos disponibilités. Toutes
            nos locations sont couvertes par une assurance.
          </p>
          <p className="text-muted-foreground">Estimez vos revenus via notre simulateur.</p>
          <div>
            <button
              onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-full text-base font-semibold transition shadow-sm"
              style={{ backgroundColor: BRAND_BLUE }}
              onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = BRAND_BLUE_HOVER}
              onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = BRAND_BLUE}
            >
              Créez votre annonce <span className="text-xl leading-none">+</span>
            </button>
          </div>
        </div>

        {/* Formulaire à droite */}
        <div ref={formRef} className="w-full">
          <div className="bg-white dark:bg-black rounded-xl shadow border p-4 md:p-6">
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-white font-medium">
                <span className="text-red-500 font-bold text-base">*</span> Champs obligatoires - Ces informations sont requises pour créer votre annonce
              </p>
            </div>
            <div className="grid md:grid-cols-[1fr_auto] gap-4 md:gap-6 items-start">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">
                    Titre de votre annonce <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input 
                    value={title} 
                    onChange={(e)=>setTitle(e.target.value)} 
                    placeholder="Ex: Belle piscine avec jardin à Paris"
                    className="mt-1 w-full border rounded-md px-3 py-2" 
                    required
                  />
                </div>
                
                {/* Équipements */}
                <div>
                  <label className="text-sm font-medium">Équipements</label>
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {EQUIPMENT_OPTIONS.map((opt) => {
                      const selected = equipments.includes(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() =>
                            setEquipments((prev) =>
                              prev.includes(opt)
                                ? prev.filter((e) => e !== opt)
                                : [...prev, opt]
                            )
                          }
                          className={`w-full text-left px-3 py-2 rounded-md border text-sm font-medium transition ${
                            selected ? "text-white border-2" : "hover:bg-muted"
                          }`}
                          style={selected ? { backgroundColor: BRAND_BLUE, borderColor: BRAND_BLUE } : {}}
                        >
                          <span className="mr-2">{equipmentIcon(opt)}</span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {equipments.length > 0 && (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-gray-500">Sélectionnés:</span>
                      {equipments.map((eq, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 text-xs border rounded-full px-2 py-0.5 bg-white">
                          <span>{equipmentIcon(eq)}</span>
                          <span>{eq}</span>
                          <button
                            type="button"
                            aria-label="Retirer"
                            className="ml-1 text-red-600"
                            onClick={() => setEquipments((prev)=> prev.filter((_, i)=> i !== idx))}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      <button
                        type="button"
                        className="text-xs underline text-gray-600"
                        onClick={() => setEquipments([])}
                      >
                        Effacer tout
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Adresse exacte de votre piscine <span className="text-red-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <input 
                      value={address} 
                      onChange={(e)=>setAddress(e.target.value)} 
                      onFocus={() => setAddressFocused(true)}
                      onBlur={() => setTimeout(() => setAddressFocused(false), 150)}
                      placeholder="Ex: 123 Rue de la Paix, 75001 Paris, France"
                      className="mt-1 w-full border rounded-md px-3 py-2" 
                      required
                      autoComplete="off"
                    />
                    {(addressFocused && (addressLoading || addressSuggestions.length > 0)) && (
                      <div className="absolute z-20 left-0 right-0 mt-1 bg-white border rounded-md shadow">
                        {addressLoading ? (
                          <div className="px-3 py-2 text-sm text-gray-500">Recherche…</div>
                        ) : (
                          <ul className="max-h-64 overflow-auto">
                            {addressSuggestions.map((s, idx) => (
                              <li key={`${s.lat}-${s.lon}-${idx}`}>
                                <button
                                  type="button"
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                                  onClick={() => {
                                    setAddress(s.display_name);
                                    setLatitude(s.lat);
                                    setLongitude(s.lon);
                                    setAddressSuggestions([]);
                                  }}
                                >
                                  {s.display_name}
                                </button>
                              </li>
                            ))}
                            {addressSuggestions.length === 0 && (
                              <li className="px-3 py-2 text-sm text-gray-500">Aucun résultat</li>
                            )}
                          </ul>
                        )}
                        {!addressLoading && (
                          <div
                            className="border-t px-3 py-2 text-[11px] text-white"
                            style={{ backgroundColor: BRAND_BLUE }}
                          >
                            Sélectionnez une suggestion pour enregistrer l’adresse exacte : c’est elle qui sera utilisée
                            pour le filtre « Au plus proche ».
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Indiquez l'adresse complète pour que les locataires puissent vous trouver facilement
                  </p>
                  <div className="mt-2 rounded-lg border border-blue-500 p-3 text-xs text-white space-y-1" style={{ backgroundColor: BRAND_BLUE }}>
                    <p className="font-semibold">Conseils adresse (utile pour le filtre « Au plus proche »)</p>
                    <ul className="list-disc pl-4 space-y-1 text-white/90">
                      <li>Saisissez une adresse complète : numéro, rue, code postal et ville.</li>
                      <li>Sélectionnez l’une des suggestions proposées pour enregistrer les coordonnées GPS.</li>
                      <li>Ces coordonnées permettent à votre annonce d’apparaître lorsque les locataires filtrent par adresse.</li>
                    </ul>
                    <p className="italic text-white/80">Exemple attendu : « 8 Quai Antoine Riboud, 69002 Lyon, France ».</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">
                      Latitude (en mètres) <span className="text-red-500 font-bold">*</span>
                    </label>
                    <input 
                      type="number"
                      value={latitude} 
                      onChange={(e)=>setLatitude(e.target.value)} 
                      className="mt-1 w-full border rounded-md px-3 py-2" 
                      required
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      Longitude (en mètres) <span className="text-red-500 font-bold">*</span>
                    </label>
                    <input 
                      type="number"
                      value={longitude} 
                      onChange={(e)=>setLongitude(e.target.value)} 
                      className="mt-1 w-full border rounded-md px-3 py-2" 
                      required
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Description <span className="text-red-500 font-bold">*</span>
                  </label>
                  <textarea value={description} onChange={(e)=>setDescription(e.target.value)} rows={3} className="mt-1 w-full border rounded-md px-3 py-2" required />
                </div>
                <div>
                  <label className="text-sm font-medium">Type d'emplacement</label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setLocation("OUTDOOR")}
                    className={`px-3 py-2 rounded-md border text-sm font-medium transition ${
                      location === "OUTDOOR" ? "text-white border-2" : "hover:bg-muted"
                    }`}
                    style={location === "OUTDOOR" ? { backgroundColor: BRAND_BLUE, borderColor: BRAND_BLUE } : {}}
                    >
                      Extérieur
                    </button>
                    <button
                      type="button"
                      onClick={() => setLocation("INDOOR")}
                    className={`px-3 py-2 rounded-md border text-sm font-medium transition ${
                      location === "INDOOR" ? "text-white border-2" : "hover:bg-muted"
                    }`}
                    style={location === "INDOOR" ? { backgroundColor: BRAND_BLUE, borderColor: BRAND_BLUE } : {}}
                    >
                      Intérieur
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Téléverser des photos (multiple) <span className="text-red-500 font-bold">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 mb-1">Au moins une photo est requise</p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="mt-1 w-full border rounded-md px-3 py-2"
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length === 0) return;
                      setUploading(true);
                      try {
                        const uploadedUrls: string[] = [];
                        for (const file of files) {
                          const form = new FormData();
                          form.append("file", file);
                          const res = await request("/api/upload", { method: "POST", body: form });
                          const j = await res.json();
                          if (res.ok) {
                            uploadedUrls.push(j.url);
                          } else {
                            notifyError("Upload échoué", j.error || "Impossible de téléverser cette photo.");
                          }
                        }
                        setPhotos((prev) => [...prev, ...uploadedUrls]);
                      } finally {
                        setUploading(false);
                      }
                    }}
                  />
                  {uploading && <div className="text-xs text-muted-foreground mt-1">Téléversement en cours…</div>}
                  {photos.length > 0 && (
                    <div className="mt-3 grid grid-cols-4 gap-2">
                      {photos.map((url, idx) => (
                        <div key={idx} className="relative group">
                          <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-20 object-cover rounded border" />
                          <button
                            type="button"
                            onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Prix à l'heure (€) <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input 
                    type="number"
                    value={pricePerHour} 
                    onChange={(e)=>setPricePerHour(e.target.value)} 
                    className="mt-1 w-full border rounded-md px-3 py-2" 
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Vous habitez en <span className="text-red-500 font-bold">*</span>
                  </label>
                  <div className="mt-1">
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full border rounded-md px-3 py-2"
                      required
                    >
                      <option value="">Choisir votre région...</option>
                      <option>Île-de-France</option>
                      <option>Auvergne-Rhône-Alpes</option>
                      <option>Nouvelle-Aquitaine</option>
                      <option>Occitanie</option>
                      <option>Provence-Alpes-Côte d'Azur</option>
                      <option>Hauts-de-France</option>
                      <option>Grand Est</option>
                      <option>Bretagne</option>
                      <option>Normandie</option>
                      <option>Pays de la Loire</option>
                      <option>Bourgogne-Franche-Comté</option>
                      <option>Centre-Val de Loire</option>
                      <option>Corse</option>
                    </select>
                  </div>
                </div>
                

                <div>
                  <label className="text-sm font-medium">
                    Combien de personnes souhaitez-vous accueillir ? <span className="text-red-500 font-bold">*</span>
                  </label>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {personsOptions.map((opt) => (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => setPersons(opt.value)}
                    className={`px-3 py-2 rounded-md border text-sm font-medium transition ${
                      persons === opt.value ? "text-white border-2" : "hover:bg-muted"
                    }`}
                    style={persons === opt.value ? { backgroundColor: BRAND_BLUE, borderColor: BRAND_BLUE } : {}}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">À quel rythme souhaitez-vous louer ?</label>
                  <div className="mt-2 space-y-2">
                    {rhythmOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setRhythm(opt.value)}
                    className={`w-full text-left px-3 py-2 rounded-md border transition ${
                      rhythm === opt.value ? "border-2" : "hover:bg-muted"
                    }`}
                    style={rhythm === opt.value ? { backgroundColor: BRAND_BLUE_SOFT, borderColor: BRAND_BLUE } : {}}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Règles et informations supplémentaires */}
                <div>
                  <label className="text-sm font-medium">Règlement intérieur</label>
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {RULE_OPTIONS.map((opt) => {
                      const selected = rules.includes(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() =>
                            setRules((prev) =>
                              prev.includes(opt)
                                ? prev.filter((e) => e !== opt)
                                : [...prev, opt]
                            )
                          }
                          className={`w-full text-left px-3 py-2 rounded-md border text-sm font-medium transition ${
                            selected ? "text-white border-2" : "hover:bg-muted"
                          }`}
                          style={selected ? { backgroundColor: BRAND_BLUE, borderColor: BRAND_BLUE } : {}}
                        >
                          <span className="mr-2">{ruleIcon(opt)}</span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {rules.length > 0 && (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-gray-500">Sélectionnées:</span>
                      {rules.map((rule, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 text-xs border rounded-full px-2 py-0.5 bg-white">
                          <span>{ruleIcon(rule)}</span>
                          <span>{rule}</span>
                          <button
                            type="button"
                            aria-label="Retirer"
                            className="ml-1 text-red-600"
                            onClick={() => setRules((prev)=> prev.filter((_, i)=> i !== idx))}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      <button
                        type="button"
                        className="text-xs underline text-gray-600"
                        onClick={() => setRules([])}
                      >
                        Effacer tout
                      </button>
                    </div>
                  )}
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={ownerPresent} onChange={(e)=>setOwnerPresent(e.target.checked)} />
                    <span>Propriétaire présent</span>
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      Produit d'entretien <span className="text-red-500 font-bold">*</span>
                    </label>
                    <input value={product} onChange={(e)=>setProduct(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2" required />
                  </div>
                </div>
              </div>

              {/* Revenu */}
              <div className="md:pt-8 md:pl-4 border-t md:border-t-0 md:border-l border-border flex md:block items-center justify-between rounded-md">
                <div>
                  <div className="text-sm text-muted-foreground">Revenu mensuel</div>
                  <div className="text-4xl md:text-5xl font-extrabold mt-1" style={{ color: BRAND_BLUE }}>
                    {revenue.toLocaleString("fr-FR")} €
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              {showSuccessMessage ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">✅</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-green-800 dark:text-green-400 mb-2">
                        Demande envoyée avec succès !
                      </h3>
                      <p className="text-green-700 dark:text-green-300 mb-4">
                        Votre annonce a été soumise et est en attente de validation par un administrateur. 
                        Vous recevrez une notification dès qu'elle sera approuvée.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => router.push("/dashboard")}
                          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
                        >
                          Retour au tableau de bord
                        </button>
                        <button
                          onClick={() => {
                            setShowSuccessMessage(false);
                            setTitle("");
                            setDescription("");
                            setAddress("");
                            setLatitude("");
                            setLongitude("");
                            setPhotos([]);
                            setPricePerHour("");
                            setRules([]);
                          }}
                          className="bg-white dark:bg-gray-800 border border-green-600 text-green-600 px-4 py-2 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20 transition"
                        >
                          Créer une autre annonce
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  disabled={submitting}
                  className="text-white px-5 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition"
                  style={{ backgroundColor: BRAND_BLUE }}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = BRAND_BLUE_HOVER}
                  onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = BRAND_BLUE}
                  onClick={async () => {
                    // Validation des champs obligatoires
                    if (!title.trim()) {
                      notifyError("Titre manquant", "Le titre est obligatoire pour créer votre annonce.");
                      return;
                    }
                    if (!address.trim()) {
                      notifyError("Adresse obligatoire", "Merci d'indiquer l'adresse exacte de votre piscine.");
                      return;
                    }
                    if (latitude === "" || Number(latitude) <= 0) {
                      notifyError("Latitude invalide", "La latitude doit être renseignée et supérieure à 0.");
                      return;
                    }
                    if (longitude === "" || Number(longitude) <= 0) {
                      notifyError("Longitude invalide", "La longitude doit être renseignée et supérieure à 0.");
                      return;
                    }
                    if (!description.trim()) {
                      notifyError("Description manquante", "Ajoutez une description pour votre annonce.");
                      return;
                    }
                    if (!pricePerHour || Number(pricePerHour) <= 0) {
                      notifyError("Tarif invalide", "Le prix par heure doit être supérieur à 0.");
                      return;
                    }
                    if (!region || region.trim() === "") {
                      notifyError("Région obligatoire", "Sélectionnez la région de votre piscine.");
                      return;
                    }
                    if (persons === null || persons === undefined) {
                      notifyError("Capacité requise", "Indiquez le nombre de personnes que vous souhaitez accueillir.");
                      return;
                    }
                    if (photos.length === 0) {
                      notifyError("Photos manquantes", "Ajoutez au moins une photo de votre piscine.");
                      return;
                    }
                    if (!product || !product.trim()) {
                      notifyError("Produit d'entretien requis", "Précisez le produit d'entretien utilisé.");
                      return;
                    }
                    
                    setSubmitting(true);
                    try {
                      const body = {
                        title: title.trim(),
                        description: description.trim(),
                        address: address.trim(),
                        latitude: Number(latitude) || 0,
                        longitude: Number(longitude) || 0,
                        photos: photos,
                        pricePerHour: Number(pricePerHour),
                        availability: {},
                        rules,
                        additional: { ownerPresent, product },
                        extras: { equipments },
                        location,
                      };
                      const res = await request("/api/pools", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
                      const j = await res.json();
                      
                      if (res.ok || res.status === 202) {
                        // Si c'est une demande d'approbation (status 202)
                        if (res.status === 202 || j.approval) {
                          success(
                            "Demande envoyée",
                            "Votre annonce attend validation. Nous vous préviendrons dès qu'elle sera approuvée."
                          );
                          setShowSuccessMessage(true);
                        } else if (j.pool) {
                          success("Piscine créée", "Votre annonce est maintenant en ligne.");
                          router.push(`/pool/${j.pool.id}`);
                        }
                      } else {
                        notifyError("Erreur de création", j.error || "Impossible de créer l'annonce.");
                      }
                    } catch (error) {
                      notifyError("Erreur de création", "Une erreur est survenue lors de la création.");
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                >
                  {submitting ? "Envoi en cours..." : "Enregistrer ma piscine"}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NewPoolPage;

