"use client";

import { useEffect, useState, useRef } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface Conversation {
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

interface Message {
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

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileList, setShowMobileList] = useState(true);
  const [headerHeight, setHeaderHeight] = useState(64);
  const router = useRouter();

  // Récupérer l'ID de l'utilisateur connecté
  useEffect(() => {
    const getUserId = async () => {
      try {
        const session = await authClient.getSession();
        setCurrentUserId(session.data?.user?.id as string | undefined);
      } catch (e) {
        console.error("Erreur récupération session:", e);
      }
    };
    getUserId();
  }, []);

  // Charger les conversations
  useEffect(() => {
    const load = async () => {
      try {
        const session = await authClient.getSession();
        if (!session.data?.user) {
          router.replace("/login");
          return;
        }
        const res = await fetch("/api/messages");
        const j = await res.json();
        if (!res.ok) throw new Error(j.error || "Erreur chargement");
        setConversations(j.conversations || []);
        // Sélectionner la première conversation par défaut
        if (j.conversations && j.conversations.length > 0) {
          setSelectedConversation(j.conversations[0].userId);
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Charger les messages de la conversation sélectionnée
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      setLoadingMessages(true);
      try {
        const res = await fetch(`/api/messages/${selectedConversation}`);
        const j = await res.json();
        if (!res.ok) throw new Error(j.error || "Erreur chargement");
        setMessages(j.messages || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();
  }, [selectedConversation]);

  // Détecter la largeur pour bascule mobile
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Calculer la hauteur réelle du header
  useEffect(() => {
    const updateHeaderHeight = () => {
      const header = document.querySelector('nav[class*="sticky"]');
      if (header) {
        setHeaderHeight(header.getBoundingClientRect().height);
      }
    };
    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    // Vérifier après un court délai pour s'assurer que le header est rendu
    const timeout = setTimeout(updateHeaderHeight, 100);
    return () => {
      window.removeEventListener('resize', updateHeaderHeight);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setShowMobileList(false);
    } else if (!selectedConversation) {
      setShowMobileList(true);
    }
  }, [isMobile, selectedConversation]);

  // Scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
    if (isMobile) {
      setShowMobileList(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return;

    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: selectedConversation,
          content: newMessage.trim(),
        }),
      });

      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Erreur envoi");

      // Recharger les messages
      const messagesRes = await fetch(`/api/messages/${selectedConversation}`);
      const messagesData = await messagesRes.json();
      if (messagesRes.ok) {
        setMessages(messagesData.messages || []);
      }

      // Recharger les conversations pour mettre à jour le dernier message
      const convRes = await fetch("/api/messages");
      const convData = await convRes.json();
      if (convRes.ok) {
        setConversations(convData.conversations || []);
      }

      setNewMessage("");
    } catch (e: any) {
      alert(e.message || "Erreur lors de l'envoi");
    } finally {
      setSending(false);
    }
  };

  const handlePickImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConversation) return;
    try {
      setUploadingImage(true);
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Upload échoué");
      const imageUrl = j.url as string;
      // Envoyer le message image (contenu = URL)
      const sendRes = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId: selectedConversation, content: imageUrl }),
      });
      const sendJ = await sendRes.json();
      if (!sendRes.ok) throw new Error(sendJ.error || "Envoi image échoué");
      // Refresh messages & conversations
      const [messagesRes, convRes] = await Promise.all([
        fetch(`/api/messages/${selectedConversation}`),
        fetch("/api/messages"),
      ]);
      const [messagesData, convData] = await Promise.all([
        messagesRes.json(),
        convRes.json(),
      ]);
      if (messagesRes.ok) setMessages(messagesData.messages || []);
      if (convRes.ok) setConversations(convData.conversations || []);
    } catch (err: any) {
      alert(err.message || "Erreur lors de l'envoi de l'image");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const getAvatarUrl = (user: Conversation["user"]) => {
    return user.image || user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email)}&background=0094EC&color=fff`;
  };

  const getSelectedUser = () => {
    return conversations.find((c) => c.userId === selectedConversation)?.user;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-500">Chargement…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  const conversationListContent = (
    <>
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Messages</h2>
        <button className="text-gray-500 hover:text-gray-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <p className="text-sm">Aucune conversation</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {conversations.map((conv) => {
              const isSelected = selectedConversation === conv.userId;
              const displayName = conv.user.name || conv.user.email || "Utilisateur";
              const isFromMe = conv.lastMessage.senderId === currentUserId;

              return (
                <button
                  key={conv.userId}
                  onClick={() => handleSelectConversation(conv.userId)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                    isSelected ? "bg-blue-50 border-l-4 border-blue-500" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={getAvatarUrl(conv.user)}
                      alt={displayName}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{displayName}</div>
                      <div className={`text-sm mt-1 truncate ${isSelected ? "text-gray-700" : "text-gray-500"}`}>
                        {isFromMe && "Vous: "}
                        {conv.lastMessage.content}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(conv.lastMessage.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );

  const conversationArea = selectedConversation ? (
    <>
      <div className="p-4 border-b border-gray-200 bg-white flex items-center gap-3">
        {isMobile && (
          <button
            className="mr-1 text-gray-600 hover:text-gray-900"
            onClick={() => setShowMobileList(true)}
          >
            ◀
          </button>
        )}
        {(() => {
          const user = getSelectedUser();
          if (!user) return null;
          const displayName = user.name || user.email || "Utilisateur";
          return (
            <>
              <img
                src={getAvatarUrl(user)}
                alt={displayName}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="font-semibold text-gray-900">{displayName}</div>
                <div className="text-sm text-gray-500">{user.email}</div>
              </div>
            </>
          );
        })()}
      </div>
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50" style={{ minHeight: 0 }}>
        {loadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Chargement des messages…</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p className="text-sm">Aucun message dans cette conversation</p>
              <p className="text-xs mt-2">Envoyez le premier message !</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pb-4">
            {messages.map((msg) => {
              const isFromMe = msg.senderId === currentUserId;
              const sender = isFromMe ? msg.sender : msg.recipient;
              const displayName = sender.name || sender.email || "Utilisateur";
              let content = msg.content || "";
              const isImage = (content.startsWith("/") || content.startsWith("http")) && /\.(png|jpe?g|gif|webp|svg)$/i.test(content);
              
              // Détecter si le message contient un reservationId pour afficher un bouton de paiement
              const reservationIdMatch = content.match(/RESERVATION_ID:([a-f0-9-]+)/i);
              const reservationId = reservationIdMatch ? reservationIdMatch[1] : null;
              // Retirer le reservationId du contenu affiché
              if (reservationId) {
                content = content.replace(/\n?RESERVATION_ID:[a-f0-9-]+/i, '').trim();
              }

              // Vérifier si le message de paiement est encore valide (24h après l'envoi)
              const messageDate = new Date(msg.createdAt);
              const now = new Date();
              const hoursSinceMessage = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);
              const isPaymentMessageValid = reservationId && !isFromMe && hoursSinceMessage < 24;

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isFromMe ? "justify-end" : "justify-start"}`}
                >
                  {!isFromMe && (
                    <img
                      src={getAvatarUrl(sender)}
                      alt={displayName}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                  )}
                  <div className={`max-w-[70%] min-w-0 ${isFromMe ? "order-2" : ""}`}>
                    {!isFromMe && (
                      <div className="text-xs text-gray-500 mb-1 px-2">{displayName}</div>
                    )}
                    {isImage ? (
                      <div className={`${isFromMe ? "text-right" : "text-left"}`}>
                        <a href={content} target="_blank" rel="noreferrer">
                          <img
                            src={content}
                            alt="image"
                            className="rounded-lg max-w-[280px] md:max-w-xs lg:max-w-sm object-cover border border-gray-200 bg-white"
                          />
                        </a>
                        <div className={`text-xs mt-1 ${isFromMe ? "text-white" : "text-gray-400"}`}>
                          {new Date(msg.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`rounded-lg px-4 py-3 ${
                          isFromMe
                            ? "bg-blue-500 text-white"
                            : "bg-white text-gray-900 border border-gray-200 shadow-sm"
                        }`}
                        style={{ wordBreak: 'break-word' }}
                      >
                        <p className={`text-sm whitespace-pre-wrap break-words leading-relaxed ${isFromMe ? 'text-white' : 'text-gray-900'}`}>
                          {content.split('\n').map((line, idx) => {
                            // Détecter les URLs dans le message et les rendre cliquables
                            const urlRegex = /(https?:\/\/[^\s]+)/g;
                            const parts = line.split(urlRegex);
                            return (
                              <span key={idx}>
                                {parts.map((part, partIdx) => {
                                  if (part.match(urlRegex)) {
                                    return (
                                      <a
                                        key={partIdx}
                                        href={part}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`underline hover:no-underline ${
                                          isFromMe 
                                            ? 'text-white hover:text-blue-100' 
                                            : 'text-blue-600 hover:text-blue-800'
                                        }`}
                                      >
                                        {part}
                                      </a>
                                    );
                                  }
                                  return <span key={partIdx}>{part}</span>;
                                })}
                                {idx < content.split('\n').length - 1 && <br />}
                              </span>
                            );
                          })}
                        </p>
                        {/* Afficher un bouton de paiement si c'est un message d'acceptation de réservation et qu'il est encore valide (moins de 24h) */}
                        {reservationId && !isFromMe && (
                          <div className="mt-3 pt-3 border-t border-gray-300 -mx-1 px-1">
                            {isPaymentMessageValid ? (
                              <>
                                <button
                                  onClick={() => router.push(`/payment/${reservationId}`)}
                                  className="w-full px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm shadow-sm active:bg-green-800"
                                  type="button"
                                >
                                  💳 Procéder au paiement
                                </button>
                                <p className="text-xs text-gray-500 mt-2 text-center">
                                  Valable pendant encore {Math.max(0, Math.floor(24 - hoursSinceMessage))}h {Math.max(0, Math.floor((24 - hoursSinceMessage) % 1 * 60))}min
                                </p>
                              </>
                            ) : (
                              <div className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-lg text-center text-sm border border-gray-300">
                                ⏰ Ce lien de paiement a expiré (valable 24h après l'acceptation)
                              </div>
                            )}
                          </div>
                        )}
                        <div
                          className={`text-xs mt-2 pt-1 ${
                            isFromMe ? "text-white" : "text-gray-400"
                          }`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  {isFromMe && (
                    <img
                      src={getAvatarUrl(msg.sender)}
                      alt="Vous"
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2 items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={handlePickImage}
            disabled={uploadingImage || sending}
            title="Ajouter une image"
            className="px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            {uploadingImage ? "..." : "📎"}
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Tapez votre message..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={sending}
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? "Envoi..." : "Envoyer"}
          </button>
        </div>
      </div>
    </>
  ) : (
    <div className="flex items-center justify-center h-full text-gray-500">
      <div className="text-center">
        <p className="text-lg">Sélectionnez une conversation</p>
        <p className="text-sm mt-2">Choisissez une conversation dans la liste pour commencer</p>
        {isMobile && (
          <button
            className="mt-4 px-4 py-2 rounded-full border"
            onClick={() => setShowMobileList(true)}
          >
            Voir les conversations
          </button>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div 
        className="flex flex-col bg-white" 
        style={{ 
          height: `calc(100vh - ${headerHeight}px)`, 
          marginTop: 0 
        }}
      >
        {showMobileList && (
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            {conversationListContent}
          </div>
        )}
        {!showMobileList && (
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            {conversationArea}
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className="fixed left-0 right-0 flex bg-white"
      style={{ 
        top: `${headerHeight}px`,
        bottom: 0,
        height: `calc(100vh - ${headerHeight}px)`,
        width: '100%',
        zIndex: 10
      }}
    >
      <div className="w-80 border-r border-gray-200 flex flex-col overflow-hidden h-full flex-shrink-0">
        {conversationListContent}
      </div>
      <div className="flex-1 flex flex-col overflow-hidden h-full min-w-0">
        {conversationArea}
      </div>
    </div>
  );
}
