import Link from "next/link";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
      {/* Header personnalisé pour la page d'aide */}
      <nav className="sticky top-0 z-30 w-full bg-white flex items-center justify-center py-4 md:py-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 max-w-7xl mx-auto w-full px-4 md:px-6">
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 text-sm md:text-base font-medium text-gray-800">
            <Link href="/settings/locataire" className="hover:text-[var(--brand-blue)] transition-colors">
              FAQ Locataires
            </Link>
            <Link href="/settings/proprietaire" className="hover:text-[var(--brand-blue)] transition-colors">
              FAQ Propriétaires
            </Link>
            <Link href="/contact" className="hover:text-[var(--brand-blue)] transition-colors">
              Contactez-nous
            </Link>
            <Link href="/" className="hover:text-[var(--brand-blue)] transition-colors">
              Revenir sur YoumPool
            </Link>
          </div>
          <Link
            href="/"
            className="font-bold text-2xl tracking-tight"
            style={{ color: 'var(--brand-blue)', fontFamily: 'cursive' }}
          >
            YoumPool
          </Link>
        </div>
      </nav>
      <div className="min-h-screen bg-white">
        {children}
      </div>
    </div>
  );
}


