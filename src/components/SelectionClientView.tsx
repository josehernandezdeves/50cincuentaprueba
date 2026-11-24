"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  MessageCircle,
  MapPin,
  Maximize2,
  BedDouble,
  Bath,
  ArrowUpRight,
} from "lucide-react";
import { Property } from "@/types/property";
import { PropertyDetailModal } from "@/components/PropertyDetailModal";

interface SelectionClientViewProps {
  clientName: string;
  customNote: string;
  properties: Property[];
}

export function SelectionClientView({
  clientName,
  customNote,
  properties,
}: SelectionClientViewProps) {
  const [detailProperty, setDetailProperty] = useState<Property | null>(null);

  const greetingTitle = clientName
    ? `Hola ${clientName}, esta es tu selección de propiedades`
    : "Esta es tu selección de propiedades";

  const handleInquiryWhatsApp = (prop: Property) => {
    const text = `Hola, me interesa conocer más detalles sobre *${prop.title}* (Ref. ${prop.ref}) en ${prop.neighborhood}, ${prop.city} (${prop.priceFormatted}).`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#F4F8FC] via-white to-[#F4F8FC] pb-16">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 border-b border-[#DCE7F3] bg-white/90 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0B2545] text-xs font-bold text-white">
              50
            </div>
            <div>
              <span className="block text-base font-bold tracking-tight text-[#0B2545] sm:text-lg">
                50cincuenta catálogo
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1658B8]">
                Selección personalizada · Isla de Margarita
              </span>
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#DCE7F3] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#0B2545] transition-colors hover:border-[#1658B8] hover:text-[#1658B8]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Ver catálogo completo</span>
            <span className="sm:hidden">Catálogo</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pt-7 sm:px-6 sm:pt-10">
        {/* Personalized Client Dossier Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-[#C5D8EE] bg-gradient-to-br from-[#0B2545] via-[#123868] to-[#1658B8] p-6 text-white shadow-xl shadow-[#0B2545]/15 sm:p-9">
          <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[#2E86DE]/25 blur-2xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Dossier exclusivo para ti
            </span>

            <h1 className="mt-4 text-2xl font-bold leading-tight tracking-tight sm:text-4xl">
              {greetingTitle}
            </h1>

            {customNote && (
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#DCE7F3] sm:text-base">
                {customNote}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-medium text-[#BBD6F5]">
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-white">
                {properties.length}{" "}
                {properties.length === 1
                  ? "propiedad seleccionada"
                  : "propiedades seleccionadas"}
              </span>
              <span>Isla de Margarita · Venezuela</span>
            </div>
          </div>
        </section>

        {/* Selected Properties List */}
        <section className="mt-8 grid gap-6 sm:grid-cols-2">
          {properties.map((prop, index) => (
            <article
              key={prop.id}
              onClick={() => setDetailProperty(prop)}
              className="group flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-[#DCE7F3] bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#9BBCE0] hover:shadow-xl hover:shadow-[#0B2545]/8"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#EBF3FB]">
                <img
                  src={prop.photos[0]?.url}
                  alt={prop.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#0B2545]/45 to-transparent" />
                <div className="absolute left-3.5 top-3.5 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0B2545] text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <span className="rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-semibold text-[#0B2545]">
                    {prop.operation}
                  </span>
                </div>
                <span className="absolute bottom-3 right-3 rounded-full bg-[#0B2545]/75 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                  {prop.photos.length} fotos · Ref. {prop.ref}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#1658B8]">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>
                    {prop.city} · {prop.neighborhood}
                  </span>
                </div>

                <h2 className="mt-1.5 text-lg font-bold tracking-tight text-[#0B2545] group-hover:text-[#1658B8]">
                  {prop.title}
                </h2>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#476484]">
                  {prop.subtitle}
                </p>

                <div className="mt-4 flex items-baseline justify-between border-t border-[#DCE7F3] pt-3.5">
                  <span className="text-xl font-bold text-[#0B2545] tabular-nums">
                    {prop.priceFormatted}
                  </span>
                  <div className="flex items-center gap-3 text-xs font-medium text-[#476484] tabular-nums">
                    <span className="inline-flex items-center gap-1">
                      <Maximize2 className="h-3.5 w-3.5 text-[#1658B8]" />
                      {prop.areaBuilt} m²
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <BedDouble className="h-3.5 w-3.5 text-[#1658B8]" />
                      {prop.bedrooms}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Bath className="h-3.5 w-3.5 text-[#1658B8]" />
                      {prop.bathrooms}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDetailProperty(prop);
                    }}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#DCE7F3] bg-[#F4F8FC] px-3 py-2.5 text-xs font-semibold text-[#0B2545] transition-colors hover:border-[#1658B8] hover:text-[#1658B8]"
                  >
                    <span>Ver fotos y memoria</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInquiryWhatsApp(prop);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#1658B8] px-3.5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#0F4494]"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>Consultar</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>

      <PropertyDetailModal
        property={detailProperty}
        isSelected={false}
        onClose={() => setDetailProperty(null)}
        onToggleSelect={() => {}}
        onShareSingle={handleInquiryWhatsApp}
      />
    </div>
  );
}
