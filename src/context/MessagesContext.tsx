"use client";

import React, { createContext, useCallback, useContext, useState, ReactNode } from "react";
import { useApi } from "./ApiContext";

export interface Conversation {
  userId: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    avatarUrl: string | null;
  };
  lastMessage: {
    id: string;
    content: string;
    createdAt: string;
    senderId: string;
  };
}

export interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  sender: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    avatarUrl: string | null;
  };
  recipient: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    avatarUrl: string | null;
  };
}

type MessagesContextType = {
  // Conversations
  conversations: Conversation[];
  conversationsLoading: boolean;
  conversationsError: string | null;
  fetchConversations: () => Promise<void>;
  
  // Messages d'une conversation
  messages: Message[];
  messagesLoading: boolean;
  messagesError: string | null;
  fetchMessages: (userId: string) => Promise<void>;
  
  // Envoyer un message
  sendMessage: (recipientId: string, content: string) => Promise<boolean>;
  sending: boolean;
  
  // Upload et envoyer une image
  uploadAndSendImage: (file: File, recipientId: string) => Promise<boolean>;
  uploadingImage: boolean;
  
  // Réinitialiser les messages
  clearMessages: () => void;
};

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export const MessagesProvider = ({ children }: { children: ReactNode }) => {
  const { request } = useApi();
  
  // État pour les conversations
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [conversationsError, setConversationsError] = useState<string | null>(null);
  
  // État pour les messages
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  
  // État pour l'envoi
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Charger les conversations
  const fetchConversations = useCallback(async () => {
    setConversationsLoading(true);
    setConversationsError(null);
    
    try {
      const res = await request("/api/messages");
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors du chargement des conversations");
      }
      
      setConversations(data.conversations || []);
    } catch (error: any) {
      setConversationsError(error.message || "Une erreur est survenue");
    } finally {
      setConversationsLoading(false);
    }
  }, [request]);

  // Charger les messages d'une conversation
  const fetchMessages = useCallback(async (userId: string) => {
    if (!userId) {
      setMessages([]);
      return;
    }
    
    setMessagesLoading(true);
    setMessagesError(null);
    
    try {
      const res = await request(`/api/messages/${userId}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors du chargement des messages");
      }
      
      setMessages(data.messages || []);
    } catch (error: any) {
      setMessagesError(error.message || "Une erreur est survenue");
    } finally {
      setMessagesLoading(false);
    }
  }, [request]);

  // Envoyer un message
  const sendMessage = useCallback(async (recipientId: string, content: string): Promise<boolean> => {
    if (!content.trim() || !recipientId || sending) return false;
    
    setSending(true);
    
    try {
      const res = await request("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId,
          content: content.trim(),
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de l'envoi du message");
      }
      
      // Recharger les messages et conversations après l'envoi
      await Promise.all([
        fetchMessages(recipientId),
        fetchConversations(),
      ]);
      
      return true;
    } catch (error: any) {
      console.error("Erreur lors de l'envoi du message:", error);
      return false;
    } finally {
      setSending(false);
    }
  }, [request, sending, fetchMessages, fetchConversations]);

  // Upload et envoyer une image
  const uploadAndSendImage = useCallback(async (file: File, recipientId: string): Promise<boolean> => {
    if (!file || !recipientId) return false;
    
    setUploadingImage(true);
    
    try {
      // Upload de l'image
      const form = new FormData();
      form.append("file", file);
      
      const uploadRes = await request("/api/upload", { 
        method: "POST", 
        body: form 
      });
      
      const uploadData = await uploadRes.json();
      
      if (!uploadRes.ok) {
        throw new Error(uploadData.error || "Upload échoué");
      }
      
      const imageUrl = uploadData.url as string;
      
      // Envoyer le message avec l'URL de l'image
      const sendRes = await request("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          recipientId, 
          content: imageUrl 
        }),
      });
      
      const sendData = await sendRes.json();
      
      if (!sendRes.ok) {
        throw new Error(sendData.error || "Envoi de l'image échoué");
      }
      
      // Recharger les messages et conversations après l'envoi
      await Promise.all([
        fetchMessages(recipientId),
        fetchConversations(),
      ]);
      
      return true;
    } catch (error: any) {
      console.error("Erreur lors de l'envoi de l'image:", error);
      return false;
    } finally {
      setUploadingImage(false);
    }
  }, [request, fetchMessages, fetchConversations]);

  // Réinitialiser les messages
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const value: MessagesContextType = {
    conversations,
    conversationsLoading,
    conversationsError,
    fetchConversations,
    messages,
    messagesLoading,
    messagesError,
    fetchMessages,
    sendMessage,
    sending,
    uploadAndSendImage,
    uploadingImage,
    clearMessages,
  };

  return <MessagesContext.Provider value={value}>{children}</MessagesContext.Provider>;
};

export const useMessages = () => {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error("useMessages doit être utilisé dans un MessagesProvider");
  }
  return context;
};

