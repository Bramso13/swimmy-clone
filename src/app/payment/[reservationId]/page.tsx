"use client";

import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

function PaymentForm({ reservationId }: { reservationId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reservation, setReservation] = useState<any>(null);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    // Charger les détails de la réservation et l'email de l'utilisateur
    const loadData = async () => {
      try {
        // Charger la réservation
        const res = await fetch(`/api/reservations/${reservationId}`);
        if (res.ok) {
          const data = await res.json();
          setReservation(data.reservation);
        }
        
        // Charger l'email de l'utilisateur connecté
        const session = await authClient.getSession();
        if (session?.data?.user?.email) {
          setEmail(session.data.user.email);
        }
      } catch (err) {
        console.error("Erreur lors du chargement:", err);
      }
    };
    loadData();
  }, [reservationId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Créer le PaymentIntent
      const res = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservationId }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur lors de la création du paiement");
      }

      const { clientSecret } = await res.json();

      // Vérifier que l'email est rempli
      if (!email || !email.includes("@")) {
        throw new Error("Veuillez entrer une adresse email valide");
      }

      // Récupérer les éléments de carte
      const cardNumberElement = elements.getElement(CardNumberElement);
      const cardExpiryElement = elements.getElement(CardExpiryElement);
      const cardCvcElement = elements.getElement(CardCvcElement);

      if (!cardNumberElement || !cardExpiryElement || !cardCvcElement) {
        throw new Error("Les éléments de carte sont introuvables");
      }

      // Confirmer le paiement
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardNumberElement,
            billing_details: {
              email: email,
            },
          },
        }
      );

      if (confirmError) {
        setError(confirmError.message || "Erreur lors du paiement");
        setLoading(false);
      } else if (paymentIntent?.status === "succeeded") {
        // Rediriger vers une page de succès
        router.push(`/payment/${reservationId}/success`);
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#424770",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#9e2146",
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {reservation && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h2 className="font-semibold mb-2">Détails de la réservation</h2>
          <p className="text-sm text-gray-600">
            Montant: <span className="font-bold">{reservation.amount} €</span>
          </p>
          <p className="text-sm text-gray-600">
            Du {new Date(reservation.startDate).toLocaleDateString("fr-FR")} au{" "}
            {new Date(reservation.endDate).toLocaleDateString("fr-FR")}
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Adresse email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.com"
            required
            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="border rounded-lg p-4 space-y-4">
          <label className="block text-sm font-medium mb-2">
            Informations de carte bancaire <span className="text-red-500">*</span>
          </label>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">Numéro de carte</label>
            <div className="border rounded px-3 py-2">
              <CardNumberElement options={cardElementOptions} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Date d'expiration</label>
              <div className="border rounded px-3 py-2">
                <CardExpiryElement options={cardElementOptions} />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">CVC (3 chiffres)</label>
              <div className="border rounded px-3 py-2">
                <CardCvcElement options={cardElementOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className={`w-full rounded-lg px-4 py-3 text-white font-medium ${
          !stripe || loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Traitement..." : `Payer ${reservation?.amount || 0} €`}
      </button>
    </form>
  );
}

export default function PaymentPage({
  params,
}: {
  params: Promise<{ reservationId: string }>;
}) {
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
      <h1 className="text-2xl font-bold mb-6">Paiement de la réservation</h1>
      <Elements stripe={stripePromise}>
        <PaymentForm reservationId={reservationId} />
      </Elements>
    </main>
  );
}
