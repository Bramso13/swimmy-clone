"use client";
import React, { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

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
  const [region, setRegion] = useState("");
  const [persons, setPersons] = useState<number | null>(null);
  const [rhythm, setRhythm] = useState(rhythmOptions[0].value);
  const formRef = useRef<HTMLDivElement | null>(null);

  // Fields for DB creation
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [pricePerHour, setPricePerHour] = useState<string>("");
  const [rules, setRules] = useState<string>("");
  const [ownerPresent, setOwnerPresent] = useState(false);
  const [product, setProduct] = useState("Chlore");
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const revenue = useMemo(() => {
    const base = persons ? persons * 8 : 0; // simple maquette de calcul
    const factor = rhythmOptions.find((r) => r.value === rhythm)?.factor ?? 1;
    return base * factor;
  }, [persons, rhythm]);

  return (
    <div className="relative">
      <section className="grid lg:grid-cols-2 gap-8 items-center">
        {/* Texte à gauche */}
        <div className="flex flex-col gap-6 py-6">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Gagnez de l'argent <span className="text-blue-600">en</span>
            <br />
            louant votre piscine
          </h1>
          <p className="text-muted-foreground max-w-xl">
            Rentabilisez votre piscine dès le premier plongeon.
          </p>
          <p className="text-muted-foreground max-w-xl">
            Swimmy est le premier site de location de piscines entre particuliers.
            Vous fixez librement vos prix, vos règles, vos disponibilités. Toutes
            nos locations sont couvertes par une assurance.
          </p>
          <p className="text-muted-foreground">Estimez vos revenus via notre simulateur.</p>
          <div>
            <button
              onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full text-base font-semibold hover:bg-blue-700 transition shadow-sm"
            >
              Créez votre annonce <span className="text-xl leading-none">+</span>
            </button>
          </div>
        </div>

        {/* Formulaire à droite */}
        <div ref={formRef} className="w-full">
          <div className="bg-white dark:bg-black rounded-xl shadow border p-4 md:p-6">
            <div className="grid md:grid-cols-[1fr_auto] gap-4 md:gap-6 items-start">
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Titre</label>
                    <input value={title} onChange={(e)=>setTitle(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Adresse</label>
                    <input value={address} onChange={(e)=>setAddress(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Latitude</label>
                    <input value={latitude} onChange={(e)=>setLatitude(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Longitude</label>
                    <input value={longitude} onChange={(e)=>setLongitude(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <textarea value={description} onChange={(e)=>setDescription(e.target.value)} rows={3} className="mt-1 w-full border rounded-md px-3 py-2" />
                </div>
                <div>
                  <label className="text-sm font-medium">Téléverser des photos (multiple)</label>
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
                          const res = await fetch("/api/upload", { method: "POST", body: form });
                          const j = await res.json();
                          if (res.ok) {
                            uploadedUrls.push(j.url);
                          } else {
                            alert(j.error || "Upload échoué");
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
                  <label className="text-sm font-medium">Prix à l'heure (€)</label>
                  <input value={pricePerHour} onChange={(e)=>setPricePerHour(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2" />
                </div>
                <div>
                  <label className="text-sm font-medium">Vous habitez en</label>
                  <div className="mt-1">
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full border rounded-md px-3 py-2"
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
                  <label className="text-sm font-medium">Combien de personnes souhaitez-vous accueillir ?</label>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {personsOptions.map((opt) => (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => setPersons(opt.value)}
                        className={`px-3 py-2 rounded-md border text-sm font-medium transition ${
                          persons === opt.value ? "bg-blue-600 text-white border-blue-600" : "hover:bg-muted"
                        }`}
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
                          rhythm === opt.value ? "bg-blue-50 border-blue-300 dark:bg-blue-950/40" : "hover:bg-muted"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Règles et informations supplémentaires */}
                <div>
                  <label className="text-sm font-medium">Règlement (séparés par des virgules)</label>
                  <input value={rules} onChange={(e)=>setRules(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2" />
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={ownerPresent} onChange={(e)=>setOwnerPresent(e.target.checked)} />
                    <span>Propriétaire présent</span>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Produit d'entretien</label>
                    <input value={product} onChange={(e)=>setProduct(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2" />
                  </div>
                </div>
              </div>

              {/* Revenu */}
              <div className="md:pt-8 md:pl-4 border-t md:border-t-0 md:border-l border-border flex md:block items-center justify-between rounded-md">
                <div>
                  <div className="text-sm text-muted-foreground">Revenu mensuel</div>
                  <div className="text-4xl md:text-5xl font-extrabold text-blue-700 mt-1">
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
                            setRules("");
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
                  className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  onClick={async () => {
                    setSubmitting(true);
                    try {
                      const body = {
                        title,
                        description,
                        address,
                        latitude: Number(latitude),
                        longitude: Number(longitude),
                        photos: photos,
                        pricePerHour: Number(pricePerHour),
                        availability: {},
                        rules: rules.split(",").map((s)=>s.trim()).filter(Boolean),
                        additional: { ownerPresent, product },
                      };
                      const res = await fetch("/api/pools", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
                      const j = await res.json();
                      
                      if(res.ok || res.status === 202) {
                        // Si c'est une demande d'approbation (status 202)
                        if (res.status === 202 || j.approval) {
                          setShowSuccessMessage(true);
                        } else if (j.pool) {
                          // Si c'est une création directe (owner)
                          router.push(`/pool/${j.pool.id}`);
                        }
                      } else {
                        alert(j.error || "Erreur de création");
                      }
                    } catch (error) {
                      alert("Une erreur est survenue lors de la création");
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
