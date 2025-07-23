import React from "react";

const PaymentPage = ({ params }: { params: { reservationId: string } }) => {
  // TODO: fetch infos réservation, formulaire paiement MangoPay
  return (
    <main className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Paiement de la réservation</h1>
      <div>Formulaire de paiement MangoPay (à venir)</div>
    </main>
  );
};

export default PaymentPage;
