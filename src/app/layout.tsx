import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import SideMenu from "@/components/SideMenu";

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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
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
          <div className="flex gap-4 items-center">
            <Link href="/" className="hover:underline">
              Rechercher
            </Link>
            <Link href="/dashboard" className="hover:underline">
              Dashboard
            </Link>
            <Link href="/profile" className="hover:underline">
              Profil
            </Link>
            <Link
              href="/login"
              className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700 transition"
            >
              Connexion
            </Link>
          </div>
        </nav>
        <main className="flex-1 w-full mx-auto max-w-7xl px-4 py-8">
          {children}
        </main>
        <footer className="w-full border-t border-border py-6 text-center text-sm text-muted-foreground bg-white/80 dark:bg-black/80 backdrop-blur">
          &copy; {new Date().getFullYear()} Swimmy Clone. Propulsé par Next.js,
          Prisma, Supabase & MangoPay.
        </footer>
      </body>
    </html>
  );
}
