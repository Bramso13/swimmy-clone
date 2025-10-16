"use client";

import React, { useMemo, useState } from "react";
import { authClient } from "@/lib/auth-client";

type Props = {
  poolId: string;
};

export default function BookingForm({ poolId }: Props) {
  const [date, setDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("10:00");
  const [endTime, setEndTime] = useState<string>("10:00");
  const [adults, setAdults] = useState<number>(1);
  const [children, setChildren] = useState<number>(0);
  const [babies, setBabies] = useState<number>(0);

  const disabled = useMemo(() => !date || !startTime || !endTime, [date, startTime, endTime]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    try {
      // Récupérer l'utilisateur connecté pour lier la demande
      const session = await authClient.getSession();
      const currentUserId = session.data?.user?.id as string | undefined;

      const res = await fetch("/api/availability/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poolId,
          userId: currentUserId || null,
          date,
          startTime,
          endTime,
          adults,
          children,
          babies,
        }),
      });
      if (res.ok) {
        alert("Votre demande a été envoyée à l'hôte pour confirmation.");
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Impossible d'envoyer la demande.");
      }
    } catch (error) {
      alert("Erreur réseau, veuillez réessayer.");
    }
  };

  const Row = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center justify-between py-3">{children}</div>
  );

  const Qty = ({ label, sub, value, setValue, badge }: { label: string; sub: string; value: number; setValue: (n: number) => void; badge?: React.ReactNode; }) => (
    <Row>
      <div>
        <div className="font-medium flex items-center gap-2">
          <span>{label}</span>
          {badge}
        </div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </div>
      <div className="flex items-center gap-3">
        <button type="button" aria-label={`Diminuer ${label}`} onClick={() => setValue(Math.max(0, value - 1))} className="h-10 w-10 inline-flex items-center justify-center rounded-full border">−</button>
        <div className="w-6 text-center">{value}</div>
        <button type="button" aria-label={`Augmenter ${label}`} onClick={() => setValue(value + 1)} className="h-10 w-10 inline-flex items-center justify-center rounded-full border">+</button>
      </div>
    </Row>
  );

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <h3 className="font-semibold">Ajoutez une date et un créneau pour voir le prix</h3>
      </div>

      <div>
        <label className="text-sm font-medium">Date</label>
        <div className="mt-1">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border rounded-md px-3 py-2" placeholder="Ajouter une date" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium">Heure de début</label>
          <div className="mt-1">
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full border rounded-md px-3 py-2" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Heure de fin</label>
          <div className="mt-1">
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full border rounded-md px-3 py-2" />
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-blue-50 text-blue-900 p-4 text-sm">
        <div className="flex items-start gap-2">
          <span>🔖</span>
          <p>
            Au-delà de 3 heures consécutives de réservation, l’hôte vous fait bénéficier d’une réduction de 50%.
          </p>
        </div>
      </div>

      <Qty label="Adultes" sub="13 ans et plus" value={adults} setValue={setAdults} />

      <Qty label="Enfants" sub="de 3 à 12 ans" value={children} setValue={setChildren} badge={<span className="ml-2 inline-block text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full">-50%</span>} />

      <Qty label="Bébés" sub="Moins de 3 ans" value={babies} setValue={setBabies} badge={<span className="ml-2 inline-block text-[10px] bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">Gratuit</span>} />

      <button type="submit" disabled={disabled} className={`w-full rounded-lg px-4 py-3 text-white ${disabled ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}>
        Vérifier la disponibilité
      </button>
    </form>
  );
}


