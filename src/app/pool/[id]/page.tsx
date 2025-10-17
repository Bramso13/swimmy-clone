import React from "react";
import { prisma } from "../../../../lib/prisma";
import BookingForm from "./BookingForm";
import FavoriteButton from "./FavoriteButton";
import ImageCarousel from "./ImageCarousel";

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
  const rawPhotos: string[] = Array.isArray(pool.photos) ? (pool.photos as string[]) : [];
  const images: string[] = rawPhotos.filter((src) => typeof src === "string" && src.trim().length > 0);

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
          <FavoriteButton poolId={pool.id} />
        </div>
      </div>

      {/* Carrousel d'images */}
      <ImageCarousel images={images} title={pool.title} />

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
            <div className="font-semibold mb-2">À partir de</div>
            <div className="text-2xl font-extrabold text-blue-700 mb-4">{pool.pricePerHour} € / heure</div>
            <BookingForm poolId={pool.id} />
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
