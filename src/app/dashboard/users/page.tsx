"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useApi } from "@/context/ApiContext";

type UserItem = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  avatarUrl?: string | null;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function UsersPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const { request } = useApi();

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  const fetchUsers = useCallback(async (opts?: { page?: number; q?: string }) => {
    try {
      setLoading(true);
      setError(null);
      const url = new URL(`/api/users`, window.location.origin);
      url.searchParams.set("page", String(opts?.page ?? page));
      url.searchParams.set("pageSize", String(pageSize));
      if ((opts?.q ?? q).trim()) url.searchParams.set("q", (opts?.q ?? q).trim());
      const res = await request(url.toString(), { cache: "no-store" });
      if (!res.ok) throw new Error("Impossible de charger les utilisateurs");
      const data = await res.json();
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch (e: any) {
      setError(e.message || "Erreur réseau");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, q, request]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const onSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    await fetchUsers({ page: 1, q });
  };

  const handleEdit = async (user: UserItem) => {
    const newName = window.prompt("Nouveau nom (laisser vide pour ne pas changer)", user.name || "");
    const newRole = window.prompt("Nouveau rôle (tenant | owner)", user.role);
    const payload: any = {};
    if (newName !== null && newName !== user.name) payload.name = newName || null;
    if (newRole !== null && newRole !== user.role) payload.role = newRole;
    if (Object.keys(payload).length === 0) return;

    const res = await request(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.error || "Échec de la modification");
      return;
    }
    await fetchUsers();
  };

  const handleDelete = async (user: UserItem) => {
    if (!window.confirm(`Supprimer l’utilisateur ${user.email} ?`)) return;
    const res = await request(`/api/users/${user.id}`, { method: "DELETE" });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.error || "Échec de la suppression");
      return;
    }
    await fetchUsers();
  };

  const handleSendMessage = async (user: UserItem) => {
    const content = window.prompt(`Message à envoyer à ${user.email}`);
    if (!content) return;
    const res = await request(`/api/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientId: user.id, content }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.error || "Échec de l’envoi du message");
      return;
    }
    alert("Message envoyé ✅");
  };

  return (
    <main className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Utilisateurs</h1>
      <p className="text-muted-foreground mb-6">
        Espace réservé aux propriétaires pour consulter et gérer les utilisateurs.
      </p>

      <form onSubmit={onSearch} className="mb-4 flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher par nom ou email"
          className="flex-1 border rounded px-3 py-2"
        />
        <button type="submit" className="px-4 py-2 rounded text-white" style={{ backgroundColor: 'var(--brand-blue)' }}>
          Rechercher
        </button>
      </form>

      <div className="rounded border bg-white overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-2">Nom</th>
              <th className="text-left px-4 py-2">Email</th>
              <th className="text-left px-4 py-2">Rôle</th>
              <th className="text-left px-4 py-2">Créé le</th>
              <th className="text-left px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">Chargement...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-red-600">{error}</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">Aucun utilisateur</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="px-4 py-2">{u.name || "—"}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">{u.role}</td>
                  <td className="px-4 py-2">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(u)} className="px-3 py-1 rounded border hover:bg-gray-50">Modifier</button>
                      <button onClick={() => handleDelete(u)} className="px-3 py-1 rounded border text-red-600 hover:bg-red-50">Supprimer</button>
                      <button onClick={() => handleSendMessage(u)} className="px-3 py-1 rounded border text-blue-700 hover:bg-blue-50">Envoyer un message</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">
          Page {page} / {totalPages} • {total} utilisateurs
        </div>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 rounded border disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
          >
            Précédent
          </button>
          <button
            className="px-3 py-1 rounded border disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
          >
            Suivant
          </button>
        </div>
      </div>
    </main>
  );
}


