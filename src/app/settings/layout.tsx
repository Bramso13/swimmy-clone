import Link from "next/link";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
      {/* Header personnalisé pour la page d'aide */}
      <nav className="sticky top-0 z-30 w-full bg-white flex items-center justify-center py-6 shadow-sm">
        <div className="flex items-center justify-between gap-6 max-w-7xl mx-auto w-full px-6">
          <div className="flex items-center gap-8">
            <Link href="/settings/locataire" className="text-gray-800 hover:text-[var(--brand-blue)] transition-colors text-base font-medium">
              FAQ Locataires
            </Link>
            <Link href="/settings/proprietaire" className="text-gray-800 hover:text-[var(--brand-blue)] transition-colors text-base font-medium">
              FAQ Propriétaires
            </Link>
            <Link href="/contact" className="text-gray-800 hover:text-[var(--brand-blue)] transition-colors text-base font-medium">
              Contactez-nous
            </Link>
            <Link href="/" className="text-gray-800 hover:text-[var(--brand-blue)] transition-colors text-base font-medium">
              Revenir sur YoumPool
            </Link>
          </div>
          <Link href="/" className="font-bold text-2xl tracking-tight" style={{ color: 'var(--brand-blue)', fontFamily: 'cursive' }}>
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


