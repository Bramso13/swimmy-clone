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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
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
          <footer className="w-full border-t border-border py-6 text-center text-sm text-muted-foreground bg-white/80 dark:bg-black/80 backdrop-blur">
            &copy; {new Date().getFullYear()} Swimmy Clone. Propulsé par Next.js,
            Prisma, Supabase & MangoPay.
          </footer>
        </RenterProvider>
      </body>
    </html>
  );
}
