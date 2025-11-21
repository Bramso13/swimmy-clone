"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type NotificationType = "success" | "error" | "info" | "warning";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (notification: Omit<Notification, "id">) => void;
  removeNotification: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const showNotification = useCallback(
    (notification: Omit<Notification, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newNotification: Notification = {
        ...notification,
        id,
        duration: notification.duration ?? 5000,
      };

      setNotifications((prev) => [...prev, newNotification]);

      // Auto-remove après la durée spécifiée
      if (newNotification.duration && newNotification.duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, newNotification.duration);
      }
    },
    [removeNotification]
  );

  const success = useCallback(
    (title: string, message?: string) => {
      showNotification({ type: "success", title, message });
    },
    [showNotification]
  );

  const error = useCallback(
    (title: string, message?: string) => {
      showNotification({ type: "error", title, message });
    },
    [showNotification]
  );

  const info = useCallback(
    (title: string, message?: string) => {
      showNotification({ type: "info", title, message });
    },
    [showNotification]
  );

  const warning = useCallback(
    (title: string, message?: string) => {
      showNotification({ type: "warning", title, message });
    },
    [showNotification]
  );

  const value: NotificationContextType = {
    notifications,
    showNotification,
    removeNotification,
    success,
    error,
    info,
    warning,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotification doit être utilisé à l'intérieur d'un NotificationProvider");
  }
  return context;
};

