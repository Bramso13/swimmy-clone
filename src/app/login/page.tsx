"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "../../../lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsLoading(true);
    try {
      const res = await authClient.signIn.email({
        email,
        password,
      });
      if (res.error) {
        setFormError(res.error.message || "Erreur de connexion");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setFormError("Erreur réseau ou serveur");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-md bg-white dark:bg-black/80 rounded-lg shadow-lg p-8 flex flex-col gap-6 border border-border">
        <h1 className="text-2xl font-bold text-center mb-2" style={{color: '#0094ec'}}>
          Connexion
        </h1>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            className="border rounded px-3 py-2 w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            className="border rounded px-3 py-2 w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          {formError && (
            <div className="text-red-600 text-sm text-center">{formError}</div>
          )}
          <button
            type="submit"
            className="text-white px-6 py-2 rounded font-semibold transition w-full disabled:opacity-60"
            style={{backgroundColor: '#0094ec'}}
            onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#0078c4'}
            onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#0094ec'}
            disabled={isLoading}
          >
            {isLoading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
        <div className="text-center text-sm text-muted-foreground">
          Pas encore de compte ?{" "}
          <Link href="/register" className="hover:underline" style={{color: '#0094ec'}}>
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
}
