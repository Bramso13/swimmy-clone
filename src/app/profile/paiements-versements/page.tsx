"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

type PaymentInfo = {
  cardNumber?: string;
  cardholderName?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  isCompany?: boolean;
};

const STORAGE_KEY = "profile.payment";

export default function PaiementsVersementsPage() {
  const { data: session } = authClient.useSession?.() ?? { data: undefined };
  const user = (session as any)?.user as { name?: string; email?: string } | undefined;

  const [activeTab, setActiveTab] = useState<"paiements" | "versements">("paiements");
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    country: "France",
    cardholderName: user?.name || "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setPaymentInfo((prev) => ({
          country: "France",
          cardholderName: user?.name || "",
          ...prev,
          ...parsed,
        }));
      } else {
        setPaymentInfo((prev) => ({
          ...prev,
          country: "France",
          cardholderName: user?.name || "",
        }));
      }
    } catch {}
  }, [user?.name]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(paymentInfo));
    } catch {}
  }, [paymentInfo]);

  const handleSave = async () => {
    setSaving(true);
    // TODO: Sauvegarder via API / MangoPay
    setTimeout(() => {
      setSaving(false);
      alert("Carte bancaire enregistrée");
    }, 500);
  };

  const handlePrefill = () => {
    // TODO: Implémenter le préremplissage depuis MangoPay
    alert("Préremplissage depuis MangoPay");
  };

  return (
    <main className="mx-auto max-w-5xl">
      {/* Header bleu */}
      <div className="py-8 px-6" style={{ backgroundColor: "var(--brand-blue)" }}>
        <div className="max-w-5xl mx-auto text-white">
          <div className="text-sm opacity-90 mb-2">
            <Link href="/profile" className="underline">Mon compte</Link> <span className="mx-1">›</span> Paiements et versements
          </div>
          <h1 className="text-4xl font-bold">Paiements et versements</h1>
        </div>
      </div>

      <div className="px-6 py-10 max-w-5xl mx-auto">
        {/* Onglets */}
        <div className="flex gap-4 border-b mb-8">
          <button
            onClick={() => setActiveTab("paiements")}
            className={`pb-4 px-2 font-medium ${
              activeTab === "paiements"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Paiements
          </button>
          <button
            onClick={() => setActiveTab("versements")}
            className={`pb-4 px-2 font-medium ${
              activeTab === "versements"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Versements
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {/* Section principale */}
          <div className="md:col-span-2 space-y-8">
            {activeTab === "paiements" ? (
              <>
                {/* Détail de la carte de paiement */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Détail de la carte de paiement</h2>
                  <div className="flex gap-4 mb-4">
                    <input
                      type="text"
                      className="flex-1 border rounded-lg px-4 py-3"
                      placeholder="Numéro de carte"
                      value={paymentInfo.cardNumber ?? ""}
                      onChange={(e) => setPaymentInfo((p) => ({ ...p, cardNumber: e.target.value }))}
                      maxLength={19}
                    />
                    <button
                      onClick={handlePrefill}
                      className="px-6 py-3 rounded-lg text-white text-sm font-medium"
                      style={{ backgroundColor: "#10b981" }}
                    >
                      Préremplir link
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">
                    J'autorise YoumPool à envoyer des instructions à l'institution financière ayant fourni ma carte bancaire pour prélever des paiements depuis mon compte, en accord avec les termes d'utilisations avec vous.
                  </p>
                </div>

                {/* Détail de facturation */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Détail de facturation</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nom du propriétaire de la carte</label>
                      <input
                        type="text"
                        className="w-full border rounded-lg px-4 py-3"
                        value={paymentInfo.cardholderName ?? ""}
                        onChange={(e) => setPaymentInfo((p) => ({ ...p, cardholderName: e.target.value }))}
                        placeholder="emir emir"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Adresse postale</label>
                      <input
                        type="text"
                        className="w-full border rounded-lg px-4 py-3"
                        value={paymentInfo.address ?? ""}
                        onChange={(e) => setPaymentInfo((p) => ({ ...p, address: e.target.value }))}
                        placeholder="14 rue de la paix"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Code postal</label>
                        <input
                          type="text"
                          className="w-full border rounded-lg px-4 py-3"
                          value={paymentInfo.postalCode ?? ""}
                          onChange={(e) => setPaymentInfo((p) => ({ ...p, postalCode: e.target.value }))}
                          placeholder="33000"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Ville</label>
                        <input
                          type="text"
                          className="w-full border rounded-lg px-4 py-3"
                          value={paymentInfo.city ?? ""}
                          onChange={(e) => setPaymentInfo((p) => ({ ...p, city: e.target.value }))}
                          placeholder="Bordeaux"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Pays</label>
                      <select
                        className="w-full border rounded-lg px-4 py-3"
                        value={paymentInfo.country ?? "France"}
                        onChange={(e) => setPaymentInfo((p) => ({ ...p, country: e.target.value }))}
                      >
                        <option value="France">France</option>
                        <option value="Belgique">Belgique</option>
                        <option value="Suisse">Suisse</option>
                        <option value="Canada">Canada</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="isCompany"
                        className="w-5 h-5"
                        checked={paymentInfo.isCompany ?? false}
                        onChange={(e) => setPaymentInfo((p) => ({ ...p, isCompany: e.target.checked }))}
                      />
                      <label htmlFor="isCompany" className="text-sm font-medium cursor-pointer">
                        Je suis une entreprise
                      </label>
                    </div>
                  </div>
                </div>

                {/* Bouton Enregistrer */}
                <div className="flex justify-center mt-8">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-8 py-3 rounded-lg text-white disabled:opacity-60 bg-gray-400"
                  >
                    {saving ? "Enregistrement..." : "Enregistrer la carte bancaire"}
                  </button>
                </div>
              </>
            ) : (
              <div>
                <h2 className="text-xl font-semibold mb-4">Versements</h2>
                <p className="text-gray-600">Configuration des versements à venir...</p>
              </div>
            )}
          </div>

          {/* Carte d'information à droite */}
          <aside className="bg-white rounded-xl border p-6 h-fit">
            <div className="font-semibold text-lg mb-2">Effectuez tous vos paiements via YoumPool</div>
            <p className="text-gray-600 text-sm">
              Effectuer vos paiements via YoumPool n'est pas une option. C'est bien une obligation ! Cela permet une vraie sérénité pour le bon déroulement de votre baignade.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}


