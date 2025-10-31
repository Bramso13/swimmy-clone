"use client";
import { useState } from "react";
import Link from "next/link";

export default function SecuritePage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleUpdate = async () => {
    if (newPassword !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }
    if (newPassword.length < 8) {
      alert("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    setSaving(true);
    // TODO: Appeler l'API pour changer le mot de passe
    setTimeout(() => {
      setSaving(false);
      alert("Mot de passe mis à jour avec succès");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }, 500);
  };

  return (
    <main className="mx-auto max-w-5xl">
      {/* Header bleu */}
      <div className="py-8 px-6" style={{ backgroundColor: "#0094EC" }}>
        <div className="max-w-5xl mx-auto text-white">
          <div className="text-sm opacity-90 mb-2">
            <Link href="/profile" className="underline">Mon compte</Link> <span className="mx-1">›</span> Sécurité
          </div>
          <h1 className="text-4xl font-bold">Sécurité</h1>
        </div>
      </div>

      <div className="px-6 py-10 grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
        {/* Section principale */}
        <div className="md:col-span-2">
          <h2 className="text-2xl font-semibold mb-6 border-b pb-2">Changement de mot de passe</h2>

          <div className="space-y-6">
            {/* Mot de passe actuel */}
            <div>
              <label className="block text-sm font-medium mb-2">Mot de passe actuel</label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  className="w-full border rounded-lg px-4 py-3 pr-12"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Entrez votre mot de passe actuel"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showCurrent ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            {/* Nouveau mot de passe */}
            <div>
              <label className="block text-sm font-medium mb-2">Nouveau mot de passe</label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  className="w-full border rounded-lg px-4 py-3 pr-12"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Entrez votre nouveau mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showNew ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            {/* Confirmer le mot de passe */}
            <div>
              <label className="block text-sm font-medium mb-2">Confirmer le mot de passe</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  className="w-full border rounded-lg px-4 py-3 pr-12"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmez votre nouveau mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirm ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            {/* Bouton Mettre à jour */}
            <div className="flex justify-center mt-8">
              <button
                onClick={handleUpdate}
                disabled={saving || !currentPassword || !newPassword || !confirmPassword}
                className="px-8 py-3 rounded-lg text-white disabled:opacity-60 bg-gray-400"
              >
                {saving ? "Mise à jour..." : "Mettre à jour"}
              </button>
            </div>
          </div>
        </div>

        {/* Carte d'information à droite */}
        <aside className="bg-white rounded-xl border p-6 h-fit">
          <div className="font-semibold text-lg mb-2">Sécuriser votre compte</div>
          <p className="text-gray-600 text-sm">
            Pensez à utiliser un mot de passe complexe pour sécuriser votre compte. Utilisez par exemple des lettres majuscules, minuscules, des chiffres ou encore des caractères spéciaux.
          </p>
        </aside>
      </div>
    </main>
  );
}

