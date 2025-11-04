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
  const extras: any = (pool as any).extras || {};
  const equipments: string[] = Array.isArray(extras?.equipments)
    ? (extras.equipments as any[]).filter((e) => typeof e === "string" && e.trim().length > 0)
    : [];
  const locationLabel = (pool as any).location === "INDOOR" ? "Intérieur" : "Extérieur";
  const rules: string[] = Array.isArray((pool as any).rules)
    ? ((pool as any).rules as any[]).filter((e) => typeof e === "string" && e.trim().length > 0)
    : [];

  const comments = await (prisma as any).comment.findMany({
    where: { poolId: id },
    orderBy: { createdAt: "desc" },
    include: { author: { select: { id: true, name: true, email: true, image: true } } },
  });
  const ratingCount = comments.length;
  const ratingAvg = ratingCount > 0 ? (comments.reduce((s: number, c: any) => s + (c.rating || 0), 0) / ratingCount) : 0;

  return (
    <main className="mx-auto max-w-6xl p-4 md:p-6">
      {/* Title + actions */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">
            {pool.title}
          </h1>
          <div className="mt-2 text-sm text-muted-foreground flex items-center gap-3">
            <span>
              {ratingCount > 0 ? (
                <>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={i < Math.round(ratingAvg) ? 'text-yellow-500' : 'text-gray-300'}>★</span>
                  ))}
                  <span className="ml-1">{ratingAvg.toFixed(2)} ({ratingCount})</span>
                </>
              ) : (
                <>Aucune note</>
              )}
            </span>
            <span>•</span>
            <span>Superhôte</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5">
              {(pool as any).location === "INDOOR" ? "🏡" : "🌤️"} {locationLabel}
            </span>
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

          <h3 className="text-lg font-semibold mt-6 mb-2">Caractéristiques</h3>
          <div className="text-sm text-muted-foreground mb-6">
            Type d'emplacement: <span className="font-medium text-black dark:text-white">{locationLabel}</span>
          </div>

          <h3 className="text-lg font-semibold mt-8 mb-3">Équipements</h3>
          {equipments.length > 0 ? (
            <ul className="grid sm:grid-cols-2 gap-2">
              {equipments.map((eq) => (
                <li key={eq} className="flex items-center gap-2">✓ {eq}</li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-muted-foreground">Aucune</div>
          )}

          <h3 className="text-lg font-semibold mt-10 mb-3">Règlement intérieur</h3>
          {rules.length > 0 ? (
            <ul className="grid sm:grid-cols-2 gap-2">
              {rules.map((e: string) => (
                <li key={e} className="flex items-center gap-2">{e}</li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-muted-foreground">Aucune règle</div>
          )}
        </section>

          <aside className="h-max rounded-2xl border shadow-sm p-4 sticky top-20">
            <div className="font-semibold mb-2">À partir de</div>
            <div className="text-2xl font-extrabold text-blue-700 mb-4">{pool.pricePerHour} € / heure</div>
            <BookingForm poolId={pool.id} />
          </aside>
      </div>
      {/* Avis / commentaires */}
      <section className="mt-12">
        <h3 className="text-xl font-semibold mb-4">Avis des visiteurs</h3>
        {comments.length === 0 ? (
          <div className="text-sm text-muted-foreground">Aucun commentaire pour le moment.</div>
        ) : (
          <ul className="space-y-6">
            {comments.map((c: any) => {
              const authorName = c.author?.name || c.author?.email || "Utilisateur";
              const created = c.createdAt ? new Date(c.createdAt) : null;
              const dateLabel = created ? created.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' }) : '';
              return (
                <li key={c.id} className="flex gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border flex items-center justify-center bg-gray-100">
                    {c.author?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.author.image} alt={authorName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm text-gray-600">
                        {authorName.substring(0,1).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold">{authorName}</div>
                      <div className="text-yellow-500 text-sm">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={i < (c.rating || 0) ? 'text-yellow-500' : 'text-gray-300'}>★</span>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground">{dateLabel}</div>
                    </div>
                    <p className="mt-2 text-gray-800">{c.content}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
      {/* Section supplémentaire retirée pour éviter les doublons et grands espaces vides */}
    </main>
  );
}
