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
      className="w-full max-w-4xl rounded-full border bg-white dark:bg-black shadow-md overflow-hidden flex items-stretch"
      data-popover-root
    >
      {/* Adresse */}
      <div className="flex-1 px-4 py-3 hover:bg-muted transition">
        <div className="text-xs text-muted-foreground">Adresse</div>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Où cherchez-vous ?"
          className="w-full bg-transparent outline-none"
        />
      </div>

      {/* Date */}
      <div className="flex-1 px-4 py-3 hover:bg-muted transition relative">
        <button
          type="button"
          className="text-left w-full"
          onClick={() => setOpen(open === "date" ? "none" : "date")}
        >
          <div className="text-xs text-muted-foreground">Date</div>
          <div>{date ? new Date(date).toLocaleDateString("fr-FR") : "Quand ?"}</div>
        </button>
        {open === "date" && (
          <div className="absolute left-0 top-full mt-2 z-50 bg-white dark:bg-black border rounded-xl shadow p-3 w-72">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border rounded px-2 py-2"
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
          <div className="text-xs text-muted-foreground">Créneau</div>
          <div>{start && end ? `${start} – ${end}` : "Quand ?"}</div>
        </button>
        {open === "time" && (
          <div className="absolute left-0 top-full mt-2 z-50 bg-white dark:bg-black border rounded-xl shadow p-3 w-80">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm">Heure de début</label>
                <input
                  type="time"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="mt-1 w-full border rounded px-2 py-2"
                />
              </div>
              <div>
                <label className="text-sm">Heure de fin</label>
                <input
                  type="time"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="mt-1 w-full border rounded px-2 py-2"
                />
              </div>
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
          <div className="text-xs text-muted-foreground">Baigneurs</div>
          <div>{swimLabel}</div>
        </button>
        {open === "swim" && (
          <div className="absolute left-0 top-full mt-2 z-50 bg-white dark:bg-black border rounded-2xl shadow p-3 w-[360px]">
            {[
              { key: "adults", label: "Adultes", sub: "13 ans et plus" },
              { key: "children", label: "Enfants", sub: "de 3 à 12 ans" },
              { key: "babies", label: "Bébés", sub: "- de 3 ans" },
            ].map((row) => (
              <div key={row.key} className="flex items-center justify-between py-3 border-b last:border-0">
                <div>
                  <div className="font-medium">{row.label}</div>
                  <div className="text-xs text-muted-foreground">{row.sub}</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => decrement(row.key as keyof Swimmers)}
                    className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-muted"
                  >
                    −
                  </button>
                  <span className="w-6 text-center">{(swimmers as any)[row.key]}</span>
                  <button
                    type="button"
                    onClick={() => increment(row.key as keyof Swimmers)}
                    className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-muted"
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
          className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700"
          aria-label="Rechercher"
        >
          🔍
        </button>
      </div>
    </form>
  );
}



