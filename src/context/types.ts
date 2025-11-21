"use client";

export interface PoolOwner {
  id: string;
  name: string | null;
  email: string;
}

export interface Pool {
  id: string;
  title: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  photos: string[];
  pricePerHour: number;
  availability: any;
  rules?: string[];
  extras?: any;
  additional?: any;
  owner?: PoolOwner;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  reservationId: string;
  userId: string;
  mangopayId: string | null;
  status: string;
  amount: number;
  createdAt: string;
}

export interface Reservation {
  id: string;
  poolId: string;
  userId: string;
  startDate: string;
  endDate: string;
  amount: number;
  status: string;
  pool?: Pool;
  transaction?: Transaction;
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateReservationData {
  poolId: string;
  userId: string;
  startDate: string;
  endDate: string;
  amount: number;
}

export interface InitiatePaymentData {
  reservationId: string;
  userId: string;
  amount: number;
}


