import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import SideMenu from "@/components/SideMenu";
import NavBar from "@/components/NavBar";
import { RenterProvider } from "@/context/RenterContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Swimmy Clone - Louez une piscine près de chez vous !",
  description:
    "Trouvez, réservez ou proposez une piscine en quelques clics. Paiement sécurisé MangoPay.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background bg-gray-100 text-foreground min-h-screen flex flex-col`}
      >
        <RenterProvider>
          <nav className="sticky top-0 z-30 w-full bg-white/80 dark:bg-black/80 backdrop-blur border-b border-border flex items-center justify-between px-3 md:px-6 py-3 shadow-sm">
            <div className="flex items-center gap-3">
              <SideMenu />
              <Link
                href="/"
                className="font-bold text-xl tracking-tight text-blue-700"
              >
                Swimmy<span className="text-blue-400">Clone</span>
              </Link>
            </div>
            <NavBar />
          </nav>
          <main className="flex-1 w-full mx-auto max-w-7xl px-4 py-8">
            {children}
          </main>
          <footer className="w-full bg-white py-12 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                {/* Logo et tagline */}
                <div className="md:col-span-1">
                  <h2 className="text-3xl font-bold mb-2" style={{color: '#0094EC', fontFamily: 'cursive'}}>
                    Swimmy
                  </h2>
                  <p className="text-sm" style={{color: '#0094EC'}}>
                    Le premier site de location de piscines privées en France.
                  </p>
                </div>

                {/* Colonne NEWS */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                    NEWS
                  </h3>
                  <ul className="space-y-2">
                    <li><Link href="/blog" className="text-gray-600 hover:underline text-sm">Blog</Link></li>
                    <li><Link href="/media" className="text-gray-600 hover:underline text-sm">Swimmy dans les médias</Link></li>
                    <li><Link href="/aventure" className="text-gray-600 hover:underline text-sm">L'aventure Swimmy</Link></li>
                  </ul>
                </div>

                {/* Colonne AIDE 1 */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                    AIDE
                  </h3>
                  <ul className="space-y-2">
                    <li><Link href="/aide/baigneurs" className="text-gray-600 hover:underline text-sm">Pour les baigneurs</Link></li>
                    <li><Link href="/aide/proprietaires" className="text-gray-600 hover:underline text-sm">Pour les propriétaires</Link></li>
                    <li><Link href="/dashboard/pools/new" className="text-gray-600 hover:underline text-sm">Louer ma piscine</Link></li>
                    <li><Link href="/aide/comment-ca-marche" className="text-gray-600 hover:underline text-sm">Comment ça marche ?</Link></li>
                  </ul>
                </div>

                {/* Colonne AIDE 2 */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                    AIDE
                  </h3>
                  <ul className="space-y-2">
                    <li><Link href="/settings" className="text-gray-600 hover:underline text-sm">Centre d'aide</Link></li>
                    <li><Link href="/terms" className="text-gray-600 hover:underline text-sm">Conditions d'utilisation</Link></li>
                    <li><Link href="/privacy" className="text-gray-600 hover:underline text-sm">Politique de confidentialité</Link></li>
                    <li><Link href="/legal" className="text-gray-600 hover:underline text-sm">Mentions légales</Link></li>
                  </ul>
                </div>

                {/* Colonne SUIVEZ-NOUS */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                    SUIVEZ-NOUS
                  </h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="https://facebook.com" className="flex items-center gap-2 text-gray-600 hover:underline text-sm">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        Facebook
                      </Link>
                    </li>
                    <li>
                      <Link href="https://instagram.com" className="flex items-center gap-2 text-gray-600 hover:underline text-sm">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.231c-.49 0-.875-.385-.875-.875s.385-.875.875-.875.875.385.875.875-.385.875-.875.875zm-1.297 1.297c-.807.875-1.297 2.026-1.297 3.323s.49 2.448 1.297 3.323c.875.807 2.026 1.297 3.323 1.297s2.448-.49 3.323-1.297c.807-.875 1.297-2.026 1.297-3.323s-.49-2.448-1.297-3.323c-.875-.807-2.026-1.297-3.323-1.297s-2.448.49-3.323 1.297z"/>
                        </svg>
                        Instagram
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </footer>

          {/* Bouton Aide flottant */}
          <div className="fixed bottom-6 left-6 z-50">
            <Link 
              href="/settings"
              className="flex items-center gap-2 px-4 py-3 rounded-full text-white shadow-lg hover:shadow-xl transition-all duration-300"
              style={{backgroundColor: '#0094EC'}}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Aide</span>
            </Link>
          </div>
        </RenterProvider>
      </body>
    </html>
  );
}
