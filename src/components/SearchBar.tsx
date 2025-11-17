"use client";
import { useEffect, useMemo, useRef, useState } from "react";

type Swimmers = { adults: number; children: number; babies: number };

export default function SearchBar() {
  const [address, setAddress] = useState("");
  const [date, setDate] = useState<string>("");
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [open, setOpen] = useState<"none" | "date" | "time" | "swim">("none");
  const [swimmers, setSwimmers] = useState<Swimmers>({ adults: 0, children: 0, babies: 0 });
  const [flexible, setFlexible] = useState(false);
  const [event, setEvent] = useState(false);

  const swimLabel = useMemo(() => {
    const total = swimmers.adults + swimmers.children + swimmers.babies;
    return total > 0 ? `${total}` : "Combien ?";
  }, [swimmers]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-popover-root]")) setOpen("none");
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const increment = (k: keyof Swimmers) =>
    setSwimmers((s) => ({ ...s, [k]: Math.max(0, (s[k] ?? 0) + 1) } as Swimmers));
  const decrement = (k: keyof Swimmers) =>
    setSwimmers((s) => ({ ...s, [k]: Math.max(0, (s[k] ?? 0) - 1) } as Swimmers));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams({
      q: address,
      date: date || "",
      start: start || "",
      end: end || "",
      adults: String(swimmers.adults),
      children: String(swimmers.children),
      babies: String(swimmers.babies),
    }).toString();
    window.location.href = `/dashboard/pools?${query}`;
  };

  return (
    <form
      onSubmit={submit}
      className="w-full max-w-4xl rounded-full border bg-white dark:bg-black shadow-md overflow-visible flex items-stretch"
      data-popover-root
    >
      {/* Adresse */}
      <div className="flex-1 px-4 py-3 hover:bg-muted transition">
        <div className="text-xs text-gray-600 font-medium mb-1">Adresse</div>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Où cherchez-vous ?"
          className="w-full bg-transparent outline-none text-black"
        />
      </div>

      {/* Date */}
      <div className="flex-1 px-4 py-3 hover:bg-muted transition relative">
        <button
          type="button"
          className="text-left w-full"
          onClick={() => setOpen(open === "date" ? "none" : "date")}
        >
          <div className="text-xs text-gray-600 font-medium mb-1">Date</div>
          <div className="text-black">{date ? new Date(date).toLocaleDateString("fr-FR") : "Quand ?"}</div>
        </button>
                 {open === "date" && (
           <div className="absolute left-0 top-full mt-2 z-50 bg-white border rounded-xl shadow-lg p-4 w-[400px]">
             <input
               type="date"
               value={date}
               onChange={(e) => setDate(e.target.value)}
               className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-lg text-black"
             />
           </div>
         )}
      </div>

      {/* Créneau */}
      <div className="flex-1 px-4 py-3 hover:bg-muted transition relative">
        <button
          type="button"
          className="text-left w-full"
          onClick={() => setOpen(open === "time" ? "none" : "time")}
        >
          <div className="text-xs text-gray-600 font-medium mb-1">Créneau</div>
          <div className="text-black">{start && end ? `${start} – ${end}` : "Quand ?"}</div>
        </button>
                 {open === "time" && (
           <div className="absolute left-0 top-full mt-2 z-50 bg-white border rounded-2xl shadow-lg p-6 w-[500px]">
             <div className="grid grid-cols-2 gap-4 mb-4">
               <div>
                 <label className="text-sm font-medium text-black">Heure de début</label>
                 <input
                   type="time"
                   value={start}
                   onChange={(e) => setStart(e.target.value)}
                   className="mt-2 w-full border rounded-lg px-3 py-2 text-black"
                 />
               </div>
               <div>
                 <label className="text-sm font-medium text-black">Heure de fin</label>
                 <input
                   type="time"
                   value={end}
                   onChange={(e) => setEnd(e.target.value)}
                   className="mt-2 w-full border rounded-lg px-3 py-2 text-black"
                 />
               </div>
             </div>
             <div className="space-y-3 mb-4">
               <label className="flex items-center gap-3 cursor-pointer">
                 <input
                   type="checkbox"
                   checked={flexible}
                   onChange={(e) => setFlexible(e.target.checked)}
                   className="w-4 h-4"
                 />
                 <span className="text-sm text-black">Je suis flexible à plus ou moins deux heures</span>
               </label>
               <label className="flex items-center gap-3 cursor-pointer">
                 <input
                   type="checkbox"
                   checked={event}
                   onChange={(e) => setEvent(e.target.checked)}
                   className="w-4 h-4"
                 />
                 <span className="text-sm text-black">Je souhaite organiser un événement</span>
               </label>
             </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setOpen("none")}
                className="px-6 py-2 rounded-lg text-white text-sm font-medium"
                style={{ backgroundColor: 'var(--brand-blue)' }}
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Baigneurs */}
      <div className="flex-1 px-4 py-3 hover:bg-muted transition relative">
        <button
          type="button"
          className="text-left w-full"
          onClick={() => setOpen(open === "swim" ? "none" : "swim")}
        >
          <div className="text-xs text-gray-600 font-medium mb-1">Baigneurs</div>
          <div className="text-black">{swimLabel}</div>
        </button>
                 {open === "swim" && (
           <div className="absolute left-0 top-full mt-2 z-50 bg-white border rounded-2xl shadow p-3 w-[360px]">
             {[
               { key: "adults", label: "Adultes", sub: "13 ans et plus", badge: null },
               { key: "children", label: "Enfants", sub: "de 3 à 12 ans", badge: "-50%" },
               { key: "babies", label: "Bébés", sub: "- de 3 ans", badge: "Gratuit" },
             ].map((row) => (
               <div key={row.key} className="flex items-center justify-between py-3 border-b last:border-0">
                 <div className="flex items-center gap-2">
                   <div>
                     <div className="font-medium text-black">{row.label}</div>
                     <div className="text-xs text-gray-500">{row.sub}</div>
                   </div>
                  {row.badge && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      row.badge === "Gratuit" ? "bg-green-100 text-green-700" : "bg-green-100 text-green-700"
                    }`}>
                      {row.badge}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                                     <button
                     type="button"
                     onClick={() => decrement(row.key as keyof Swimmers)}
                     disabled={(swimmers as any)[row.key] === 0}
                     className={`w-8 h-8 rounded-full border flex items-center justify-center text-black ${
                       (swimmers as any)[row.key] === 0 
                         ? "opacity-30 cursor-not-allowed" 
                         : "hover:bg-muted cursor-pointer"
                     }`}
                   >
                     −
                   </button>
                   <span className="w-6 text-center text-black">{(swimmers as any)[row.key]}</span>
                                     <button
                     type="button"
                     onClick={() => increment(row.key as keyof Swimmers)}
                     className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-muted text-black"
                   >
                     +
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="pl-2 pr-3 flex items-center">
        <button
          type="submit"
          className="w-10 h-10 rounded-full text-white flex items-center justify-center"
          style={{ backgroundColor: 'var(--brand-blue)' }}
          onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = 'color-mix(in srgb, var(--brand-blue) 85%, black)'}
          onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'var(--brand-blue)'}
          aria-label="Rechercher"
        >
          🔍
        </button>
      </div>
    </form>
  );
}



