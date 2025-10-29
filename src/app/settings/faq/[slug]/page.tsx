"use client";
import React from "react";
import Link from "next/link";
import { faqItems } from "../data";

export default function FaqDetailPage({ params }: { params: { slug: string } }) {
  const item = faqItems.find((i) => i.slug === params.slug);

  if (!item) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Article introuvable</h1>
        <Link href="/settings" className="text-blue-600 hover:underline">
          ← Retour à l'aide
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">{item.title}</h1>
      <div className="prose prose-gray max-w-none">
        {item.content}
      </div>
      <div className="mt-10">
        <Link href="/settings" className="inline-block px-4 py-2 rounded text-white" style={{backgroundColor: '#0094EC'}}>
          ← Retour à l'aide
        </Link>
      </div>
    </main>
  );
}


