import Link from "next/link";

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


