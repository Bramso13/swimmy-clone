"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function MessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const session = await authClient.getSession();
        if (!session.data?.user) {
          window.location.href = "/login";
          return;
        }
        const res = await fetch("/api/messages");
        const j = await res.json();
        if (!res.ok) throw new Error(j.error || "Erreur chargement");
        setMessages(j.messages || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-6">Chargement…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Mes messages</h1>
      {messages.length === 0 ? (
        <div className="text-muted-foreground">Aucun message reçu.</div>
      ) : (
        <ul className="space-y-3">
          {messages.map((m) => (
            <li key={m.id} className="border rounded-lg p-3">
              <div className="text-sm text-gray-500">De: {m.sender?.name || m.sender?.email || "Hôte"}</div>
              <div className="mt-1">{m.content}</div>
              <div className="text-xs text-gray-400 mt-1">{new Date(m.createdAt).toLocaleString("fr-FR")}</div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}


