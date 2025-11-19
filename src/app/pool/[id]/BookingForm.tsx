"use client";

import React, { useMemo, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

type Props = {
  poolId: string;
  pricePerHour: number;
};

export default function BookingForm({ poolId, pricePerHour }: Props) {
  const router = useRouter();
  const [date, setDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("10:00");
  const [endTime, setEndTime] = useState<string>("10:00");
  const [adults, setAdults] = useState<number>(1);
  const [children, setChildren] = useState<number>(0);
  const [babies, setBabies] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const disabled = useMemo(() => !date || !startTime || !endTime, [date, startTime, endTime]);

  // Calculer le prix total
  const calculatePrice = useMemo(() => {
    if (!date || !startTime || !endTime) return 0;
    
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const totalMinutes = endMinutes > startMinutes ? endMinutes - startMinutes : (24 * 60) - startMinutes + endMinutes;
    const hours = totalMinutes / 60;
    
    // Prix de base pour les adultes
    let totalPrice = adults * pricePerHour * hours;
    
    // Réduction de 50% pour les enfants
    totalPrice += children * pricePerHour * hours * 0.5;
    
    // Bébés gratuits (pas de calcul)
    
    // Réduction de 50% si plus de 3 heures
    if (hours > 3) {
      totalPrice *= 0.5;
    }
    
    return Math.round(totalPrice * 100) / 100;
  }, [date, startTime, endTime, adults, children, pricePerHour]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || loading) return;
    
    try {
      setLoading(true);
      // Récupérer l'utilisateur connecté
      const session = await authClient.getSession();
      const currentUserId = session.data?.user?.id as string | undefined;
      
      if (!currentUserId) {
        alert("Vous devez être connecté pour effectuer une réservation.");
        router.push("/login");
        return;
      }

      // Créer les dates complètes
      const startDateTime = new Date(`${date}T${startTime}`);
      const endDateTime = new Date(`${date}T${endTime}`);
      
      // Si l'heure de fin est avant l'heure de début, on ajoute un jour
      if (endDateTime <= startDateTime) {
        endDateTime.setDate(endDateTime.getDate() + 1);
      }

      // Créer la réservation
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poolId,
          userId: currentUserId,
          startDate: startDateTime.toISOString(),
          endDate: endDateTime.toISOString(),
          amount: calculatePrice,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const reservationId = data.reservation?.id;
        
        if (reservationId) {
          // Rediriger vers la page de paiement
          router.push(`/payment/${reservationId}`);
        } else {
          alert("Erreur lors de la création de la réservation.");
        }
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Impossible de créer la réservation.");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur réseau, veuillez réessayer.");
    } finally {
      setLoading(false);
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
          <p className="text-white">
            Au-delà de 3 heures consécutives de réservation, l'hôte vous fait bénéficier d'une réduction de 50%.
          </p>
        </div>
      </div>

      <Qty label="Adultes" sub="13 ans et plus" value={adults} setValue={setAdults} />

      <Qty label="Enfants" sub="de 3 à 12 ans" value={children} setValue={setChildren} badge={<span className="ml-2 inline-block text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full">-50%</span>} />

      <Qty label="Bébés" sub="Moins de 3 ans" value={babies} setValue={setBabies} badge={<span className="ml-2 inline-block text-[10px] bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">Gratuit</span>} />

      {calculatePrice > 0 && (
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold">Total</span>
            <span className="text-xl font-bold">{calculatePrice.toFixed(2)} €</span>
          </div>
        </div>
      )}

      <button type="submit" disabled={disabled || loading} className={`w-full rounded-lg px-4 py-3 text-white ${disabled || loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}>
        {loading ? "Création de la réservation..." : calculatePrice > 0 ? "Réserver et payer" : "Vérifier la disponibilité"}
      </button>
    </form>
  );
}


