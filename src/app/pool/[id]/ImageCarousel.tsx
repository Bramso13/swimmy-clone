"use client";

import Image from "next/image";
import { useState } from "react";

interface ImageCarouselProps {
  images: string[];
  title: string;
}

export default function ImageCarousel({ images, title }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="relative rounded-xl overflow-hidden border bg-gray-200 dark:bg-gray-800 h-[460px] flex items-center justify-center">
        <span className="text-gray-500 text-lg">Aucune image disponible</span>
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative rounded-xl overflow-hidden border group">
      {/* Indicateur de position */}
      <div className="absolute left-3 top-3 z-10 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
        {currentIndex + 1}/{images.length}
      </div>

      {/* Image principale */}
      <div className="relative h-[340px] md:h-[460px] bg-gray-100 dark:bg-gray-800">
        <Image
          src={images[currentIndex]}
          alt={`${title} - Image ${currentIndex + 1}`}
          fill
          className="object-cover"
          unoptimized
        />
      </div>

      {/* Flèches de navigation */}
      {images.length > 1 && (
        <>
          {/* Flèche gauche */}
          <button
            onClick={goToPrevious}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Image précédente"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          {/* Flèche droite */}
          <button
            onClick={goToNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Image suivante"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </>
      )}

      {/* Indicateurs de points (dots) */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentIndex
                  ? "bg-white w-6"
                  : "bg-white/60 hover:bg-white/80"
              }`}
              aria-label={`Aller à l'image ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

