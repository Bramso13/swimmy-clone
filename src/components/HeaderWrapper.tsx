"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import SideMenu from "@/components/SideMenu";
import NavBar from "@/components/NavBar";

export default function HeaderWrapper() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      // Le header devient blanc quand on dépasse 150px (quand la searchbar sticky apparaît)
      setIsScrolled(window.scrollY > 150);
    };

    // Vérifier la position initiale
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Masquer le header sur la page /settings
  if (pathname?.startsWith('/settings')) {
    return null;
  }

  return (
    <nav 
      className={`sticky top-0 z-30 w-full dark:bg-black flex items-center justify-between px-3 md:px-6 py-3 shadow-sm transition-all duration-300 ${
        isScrolled ? 'bg-white' : ''
      }`}
      style={!isScrolled ? { background: 'linear-gradient(to right, #08436A, #0A5B87)' } : {}}
    >
      <div className="flex items-center gap-3">
        <SideMenu isHeaderBlue={!isScrolled} />
      </div>
      <NavBar isHeaderBlue={!isScrolled} />
    </nav>
  );
}
