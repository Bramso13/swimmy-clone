import Link from "next/link";
import RevenueSnapshotCard from "@/components/dashboard/RevenueSnapshotCard";

const revenueSnapshots = [
  {
    label: "Revenus du mois en cours",
    period: "1 → 30 (estimé)",
    value: "— €",
    hint: "Montant net à percevoir pour vos réservations confirmées ce mois-ci.",
  },
  {
    label: "Revenus des 3 derniers mois",
    period: "Rolling 90 jours",
    value: "— €",
    hint: "Vision cumulée pour anticiper vos encaissements à court terme.",
  },
  {
    label: "Revenus de l'année",
    period: new Date().getFullYear().toString(),
    value: "— €",
    hint: "Synthèse annuelle (brut) des réservations validées.",
  },
];

const ComptabilitePage = () => {
  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <p className="text-sm text-muted-foreground uppercase tracking-wide">Dashboard propriétaire</p>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(90deg, #08436A, #4f46e5)" }}
          >
            Comptabilité
          </span>
        </h1>
        <p className="text-muted-foreground">
          Cette section sera disponible pour suivre vos revenus, charges et documents comptables.
        </p>
      </div>

      <section className="mb-10">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground uppercase tracking-wide">Vue d’ensemble</p>
          <h2 className="text-xl font-semibold mt-1">Revenus prévisionnels</h2>
          <p className="text-sm text-muted-foreground">
            Suivez vos revenus sur différentes périodes dès que les données comptables seront synchronisées.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {revenueSnapshots.map((snapshot) => (
            <RevenueSnapshotCard
              key={snapshot.label}
              label={snapshot.label}
              period={snapshot.period}
              value={snapshot.value}
              hint={snapshot.hint}
            />
          ))}
        </div>
      </section>

      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center shadow-sm">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white"
          style={{ backgroundColor: "#08436A" }}
        >
          Retour au tableau de bord
        </Link>
      </div>
    </main>
  );
};

export default ComptabilitePage;


