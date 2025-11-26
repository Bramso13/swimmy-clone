"use client";

import React, { createContext, useCallback, useContext, useState, ReactNode } from "react";
import { useApi } from "./ApiContext";

export interface User {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  image?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  dateOfBirth?: string | Date | null;
  emailVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

type UsersContextType = {
  // Récupérer un utilisateur
  user: User | null;
  userLoading: boolean;
  userError: string | null;
  fetchUser: (userId: string) => Promise<User | null>;
  
  // Mettre à jour un utilisateur
  updateUser: (userId: string, data: Partial<User>) => Promise<boolean>;
  updating: boolean;
  
  // Changer le mot de passe
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  changingPassword: boolean;
};

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const UsersProvider = ({ children }: { children: ReactNode }) => {
  const { request } = useApi();
  
  // État pour l'utilisateur courant
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);
  
  // État pour les mises à jour
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Récupérer un utilisateur
  const fetchUser = useCallback(async (userId: string): Promise<User | null> => {
    if (!userId) return null;
    
    setUserLoading(true);
    setUserError(null);
    
    try {
      const res = await request(`/api/users/${userId}`);
      
      if (!res.ok) {
        throw new Error("Erreur lors de la récupération de l'utilisateur");
      }
      
      const data = await res.json();
      const userData = data.user as User;
      setUser(userData);
      return userData;
    } catch (error: any) {
      setUserError(error.message || "Une erreur est survenue");
      return null;
    } finally {
      setUserLoading(false);
    }
  }, [request]);

  // Mettre à jour un utilisateur
  const updateUser = useCallback(async (
    userId: string,
    data: Partial<User>
  ): Promise<boolean> => {
    if (!userId) return false;
    
    setUpdating(true);
    
    try {
      const res = await request(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Erreur lors de la mise à jour");
      }
      
      // Recharger l'utilisateur mis à jour
      await fetchUser(userId);
      return true;
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
      return false;
    } finally {
      setUpdating(false);
    }
  }, [request, fetchUser]);

  // Changer le mot de passe
  const changePassword = useCallback(async (
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> => {
    setChangingPassword(true);
    
    try {
      const res = await request("/api/users/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Erreur lors du changement de mot de passe");
      }
      
      return true;
    } catch (error: any) {
      console.error("Erreur lors du changement de mot de passe:", error);
      return false;
    } finally {
      setChangingPassword(false);
    }
  }, [request]);

  const value: UsersContextType = {
    user,
    userLoading,
    userError,
    fetchUser,
    updateUser,
    updating,
    changePassword,
    changingPassword,
  };

  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>;
};

export const useUsers = () => {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error("useUsers doit être utilisé dans un UsersProvider");
  }
  return context;
};

