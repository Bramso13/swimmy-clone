import React from "react";
import Image from "next/image";
import { prisma } from "../../../../lib/prisma";

export default async function PoolDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pool = await prisma.pool.findUnique({ where: { id } });
  if (!pool) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-semibold">Piscine introuvable</h1>
        <p className="text-muted-foreground mt-2">Cette annonce n'existe pas ou a été supprimée.</p>
      </main>
    );
  }
  const images: string[] = Array.isArray(pool.photos) ? (pool.photos as string[]) : [];
  const imagesCount = images.length;

  return (
    <main className="mx-auto max-w-6xl p-4 md:p-6">
      {/* Title + actions */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">
            {pool.title}
          </h1>
          <div className="mt-2 text-sm text-muted-foreground flex items-center gap-3">
            <span>⭐ 4.89 (90)</span>
            <span>•</span>
            <span>Superhôte</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <button className="inline-flex items-center gap-2 border px-3 py-1.5 rounded-full hover:bg-muted">Partager</button>
          <button className="inline-flex items-center gap-2 border px-3 py-1.5 rounded-full hover:bg-muted">Enregistrer</button>
        </div>
      </div>

      {/* Gallery */}
      <div className="relative rounded-xl overflow-hidden border">
        <div className="absolute left-3 top-3 z-10 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
          1/{imagesCount}
        </div>
        <div className="grid md:grid-cols-2 gap-1">
          <div className="relative h-[340px] md:h-[460px]">
            {images[0] && (
              <Image src={images[0]} alt="pool" fill className="object-cover" />
            )}
          </div>
          <div className="grid grid-cols-2 gap-1">
            {images.slice(1).map((src: string, i: number) => (
              <div key={i} className="relative h-[170px] md:h-[230px]">
                <Image src={src} alt="pool" fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content + booking card */}
      <div className="mt-8 grid lg:grid-cols-[1fr_360px] gap-8">
        <section>
          <h2 className="text-xl font-semibold mb-2">{pool.address}</h2>
          <div className="text-sm text-muted-foreground mb-6">
            {/* Placeholder d'info */}
          </div>
          <p className="mb-6">{pool.description}</p>

          <h3 className="text-lg font-semibold mt-8 mb-3">Équipements</h3>
          <ul className="grid sm:grid-cols-2 gap-2">
            {/* Équipements à connecter si dispo dans le modèle */}
            <li className="flex items-center gap-2">✓ Douche</li>
            <li className="flex items-center gap-2">✓ Jardin</li>
          </ul>

          <h3 className="text-lg font-semibold mt-10 mb-3">Règlement intérieur</h3>
          <ul className="grid sm:grid-cols-2 gap-2">
            {(((pool as any).rules || []) as string[]).map((e: string) => (
              <li key={e} className="flex items-center gap-2">{e}</li>
            ))}
          </ul>
        </section>

        <aside className="h-max rounded-2xl border shadow-sm p-4 sticky top-20">
          <div className="font-semibold mb-3">À partir de</div>
          <div className="text-2xl font-extrabold text-blue-700">{pool.pricePerHour} € / heure</div>
        </aside>
      </div>
      {/* Règles si disponibles */}
      {Array.isArray((pool as any).rules) && (pool as any).rules.length > 0 && (
        <section className="mt-12">
          <h3 className="text-xl font-semibold mb-4">Informations supplémentaires</h3>
          <ul className="space-y-2">
            {((pool as any).rules as string[]).map((r: string) => (
              <li key={r}>• {r}</li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
