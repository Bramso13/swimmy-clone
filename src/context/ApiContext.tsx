"use client";

import React, { createContext, useCallback, useContext, useMemo, ReactNode } from "react";

type ApiContextType = {
  request: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  requestJson: <T = any>(input: RequestInfo | URL, init?: RequestInit) => Promise<T>;
};

const ApiContext = createContext<ApiContextType | undefined>(undefined);

type ApiProviderProps = {
  children: ReactNode;
};

export const ApiProvider = ({ children }: ApiProviderProps) => {
  const request = useCallback(async (input: RequestInfo | URL, init?: RequestInit) => {
    return fetch(input, init);
  }, []);

  const requestJson = useCallback(
    async <T,>(input: RequestInfo | URL, init?: RequestInit) => {
      const response = await request(input, init);
      return (await response.json()) as T;
    },
    [request]
  );

  const value = useMemo(
    () => ({
      request,
      requestJson,
    }),
    [request, requestJson]
  );

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};

export const useApi = () => {
  const ctx = useContext(ApiContext);
  if (!ctx) {
    throw new Error("useApi doit être utilisé à l'intérieur d'un ApiProvider");
  }
  return ctx;
};


