"use client";

import React, { createContext, useCallback, useContext, useState, ReactNode } from "react";
import { InitiatePaymentData, Transaction } from "./types";

type PaymentsContextType = {
  paymentLoading: boolean;
  paymentError: string | null;
  initiatePayment: (data: InitiatePaymentData) => Promise<Transaction | null>;
  clearPaymentError: () => void;
};

const PaymentsContext = createContext<PaymentsContextType | undefined>(undefined);

export const PaymentsProvider = ({ children }: { children: ReactNode }) => {
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const initiatePayment = useCallback(async (data: InitiatePaymentData) => {
    setPaymentLoading(true);
    setPaymentError(null);
    try {
      const response = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Erreur lors de l'initiation du paiement");
      }
      const result = await response.json();
      return result.transaction as Transaction;
    } catch (error: any) {
      setPaymentError(error.message || "Une erreur est survenue");
      return null;
    } finally {
      setPaymentLoading(false);
    }
  }, []);

  const clearPaymentError = useCallback(() => setPaymentError(null), []);

  return (
    <PaymentsContext.Provider
      value={{
        paymentLoading,
        paymentError,
        initiatePayment,
        clearPaymentError,
      }}
    >
      {children}
    </PaymentsContext.Provider>
  );
};

export const usePayments = () => {
  const context = useContext(PaymentsContext);
  if (!context) {
    throw new Error("usePayments doit être utilisé dans un PaymentsProvider");
  }
  return context;
};


