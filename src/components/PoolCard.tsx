"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

export type Pool = {
  id: string;
  title: string;
  photos: string[];
  pricePerHour: number;
  address?: string;
};

function isValidSrc(src?: string) {
  if (!src) return false;
  if (src.startsWith("/") || src.startsWith("data:")) return true;
  try {
    const u = new URL(src);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export default function PoolCard({ pool }: { pool: Pool }) {
  const initialCover = useMemo(() => (pool.photos || []).find(isValidSrc), [pool.photos]);
  const [showImage, setShowImage] = useState<boolean>(!!initialCover);

  return (
    <div className="bg-white border rounded-lg shadow p-3 flex flex-col gap-2">
      <div className="relative h-36 w-full rounded overflow-hidden border bg-muted">
        {showImage && initialCover ? (
          <Image
            src={initialCover}
            alt={pool.title}
            fill
            className="object-cover"
            onError={() => setShowImage(false)}
            unoptimized // optionnel si tu utilises des images externes sans les autoriser dans next.config.js
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
            Sans image
          </div>
        )}
      </div>
      <div className="font-semibold text-sm line-clamp-1">{pool.title}</div>
      {pool.address && (
        <div className="text-xs text-muted-foreground line-clamp-1">{pool.address}</div>
      )}
      <div className="text-blue-600 font-bold text-sm">{pool.pricePerHour} €/heure</div>
      <Link
        href={`/pool/${pool.id}`}
        className="bg-blue-600 text-white px-3 py-1 rounded text-sm text-center mt-1 hover:bg-blue-700 transition"
      >
        Voir
      </Link>
    </div>
  );
}
