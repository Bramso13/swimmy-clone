"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PaymentSuccessPage({
  params,
}: {
  params: Promise<{ reservationId: string }>;
}) {
  const router = useRouter();
  const [reservationId, setReservationId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((p) => {
      setReservationId(p.reservationId);
      setLoading(false);
    });
  }, [params]);

  if (loading) {
    return (
      <main className="max-w-2xl mx-auto p-4">
        <div className="text-center">Chargement...</div>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto p-4 md:p-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="text-6xl mb-4">✓</div>
        <h1 className="text-2xl font-bold text-green-800 mb-2">
          Paiement réussi !
        </h1>
        <p className="text-gray-700 mb-6">
          Votre réservation a été confirmée. Vous recevrez un email de confirmation sous peu.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/dashboard/reservations"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Voir mes réservations
          </Link>
          <Link
            href="/"
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </main>
  );
}

