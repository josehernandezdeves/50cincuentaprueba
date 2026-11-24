"use client";

import React, { useState, useRef } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { Property } from "@/types/property";

interface PropertyCardProps {
  property: Property;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onOpenDetail: (property: Property) => void;
  aiMatch?: {
    score: number;
    reasons: string[];
  };
}

export function PropertyCard({
  property,
  isSelected,
  onToggleSelect,
  onOpenDetail,
  aiMatch,
}: PropertyCardProps) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const railRef = useRef<HTMLDivElement>(null);

  const scrollToPhoto = (index: number) => {
    const clamped =
      index < 0
        ? property.photos.length - 1
        : index >= property.photos.length
        ? 0
        : index;
    setPhotoIdx(clamped);
    if (railRef.current) {
      railRef.current.scrollTo({
        left: clamped * railRef.current.clientWidth,
        behavior: "smooth",
      });
    }
  };

  const handleScroll = () => {
    if (!railRef.current) return;
    const { scrollLeft, clientWidth } = railRef.current;
    if (clientWidth > 0) {
      const idx = Math.round(scrollLeft / clientWidth);
      if (idx !== photoIdx) setPhotoIdx(idx);
    }
  };

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-[22px] border transition-colors duration-150 ${
        isSelected
          ? "border-[#1658B8] bg-[#F4F8FC] ring-2 ring-[#1658B8]/20"
          : "border-[#DCE7F3] bg-white"
      }`}
    >
      {/* Swipeable Photo Carousel */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#EBF3FB] sm:aspect-[16/11]">
        <div
          ref={railRef}
          onScroll={handleScroll}
          onClick={() => onOpenDetail(property)}
          className="no-scrollbar flex h-full w-full cursor-pointer snap-x snap-mandatory overflow-x-auto scroll-smooth"
          style={{ touchAction: "pan-x pan-y" }}
        >
          {property.photos.map((photo, idx) => (
            <div
              key={photo.url + idx}
              className="h-full w-full shrink-0 snap-center"
            >
              <img
                src={photo.url}
                alt={photo.caption || property.title}
                className="h-full w-full object-cover"
                loading={idx === 0 ? "eager" : "lazy"}
                draggable={false}
              />
            </div>
          ))}
        </div>

        {/* Subtle legibility gradients */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#0B2545]/45 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#0B2545]/50 to-transparent" />

        {/* Top-left editorial tags */}
        <div className="pointer-events-none absolute left-3.5 top-3.5 flex items-center gap-1.5">
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide ${
              property.operation === "Venta"
                ? "bg-white/95 text-[#0B2545]"
                : "bg-[#1658B8] text-white"
            }`}
          >
            {property.operation}
          </span>
          {property.badge && (
            <span className="rounded-full bg-[#0B2545]/75 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
              {property.badge}
            </span>
          )}
        </div>

        {/* Top-right 44px touch-friendly selection control */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect(property.id);
          }}
          aria-pressed={isSelected}
          aria-label={
            isSelected
              ? `Quitar ${property.title} de la selección`
              : `Seleccionar ${property.title} para compartir`
          }
          className={`absolute right-3 top-3 flex min-h-[38px] items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm transition-transform duration-100 ease-out active:scale-95 ${
            isSelected
              ? "bg-[#1658B8] text-white ring-2 ring-white"
              : "bg-white/95 text-[#0B2545]"
          }`}
        >
          <span
            className={`flex h-4 w-4 items-center justify-center rounded-full border ${
              isSelected
                ? "border-white bg-white text-[#1658B8]"
                : "border-[#9BBCE0] bg-white"
            }`}
          >
            {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
          </span>
          <span>{isSelected ? "Seleccionada" : "Seleccionar"}</span>
        </button>

        {/* Desktop-only hover arrows */}
        {property.photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                scrollToPhoto(photoIdx - 1);
              }}
              aria-label="Foto anterior"
              className="absolute left-2.5 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-[#0B2545] opacity-0 shadow-sm transition-opacity hover:bg-white group-hover:opacity-100 sm:flex"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                scrollToPhoto(photoIdx + 1);
              }}
              aria-label="Siguiente foto"
              className="absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-[#0B2545] opacity-0 shadow-sm transition-opacity hover:bg-white group-hover:opacity-100 sm:flex"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {/* Bottom dots + Ref */}
        <div className="pointer-events-none absolute inset-x-3.5 bottom-3 flex items-center justify-between">
          <span className="text-[11px] font-medium tracking-wider text-white/90">
            {property.ref}
          </span>

          {property.photos.length > 1 && (
            <div className="flex items-center gap-1.5">
              {property.photos.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === photoIdx ? "w-4 bg-white" : "w-1.5 bg-white/55"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Editorial Body */}
      <div
        onClick={() => onOpenDetail(property)}
        className="flex flex-1 cursor-pointer flex-col p-4 sm:p-5"
      >
        {/* AI Match strip */}
        {aiMatch && (
          <div className="mb-3 flex items-start justify-between gap-2 rounded-xl bg-[#EBF3FB] px-3 py-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1658B8]">
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                <span>{aiMatch.score}% afinidad IA</span>
              </div>
              <p className="mt-0.5 truncate text-xs text-[#0B2545]">
                {aiMatch.reasons.join(" · ")}
              </p>
            </div>
          </div>
        )}

        {/* Location eyebrow + Category */}
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-[#1658B8]">
            {property.city} · {property.neighborhood}
          </span>
          <span className="shrink-0 text-[11px] font-medium text-[#476484]">
            {property.category}
          </span>
        </div>

        {/* Title */}
        <h3 className="mt-1.5 text-lg font-bold leading-snug tracking-tight text-[#0B2545] transition-colors group-hover:text-[#1658B8]">
          {property.title}
        </h3>

        <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-[#476484]">
          {property.subtitle}
        </p>

        {/* Bottom architectural spec bar */}
        <div className="mt-auto pt-4">
          <div className="flex items-baseline justify-between border-t border-[#DCE7F3] pt-3.5">
            <span className="text-xl font-bold tracking-tight text-[#0B2545] tabular-nums">
              {property.priceFormatted}
            </span>

            <div className="flex items-center gap-2.5 text-xs font-medium text-[#476484] tabular-nums">
              <span>{property.areaBuilt} m²</span>
              <span className="text-[#C5D8EE]">|</span>
              <span>{property.bedrooms} hab.</span>
              <span className="text-[#C5D8EE]">|</span>
              <span>{property.bathrooms} b.</span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs font-semibold text-[#1658B8]">
            <span>Explorar galería y memoria</span>
            <ArrowUpRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>
      </div>
    </article>
  );
}
