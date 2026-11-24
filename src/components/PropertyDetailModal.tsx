"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  BedDouble,
  Bath,
  Car,
  Compass,
  Calendar,
  Zap,
  Check,
  MapPin,
  Layers,
  ShieldCheck,
  MessageCircle,
  ZoomIn,
} from "lucide-react";
import { Property } from "@/types/property";

interface PropertyDetailModalProps {
  property: Property | null;
  isSelected: boolean;
  onClose: () => void;
  onToggleSelect: (id: string) => void;
  onShareSingle: (property: Property) => void;
  forceMobile?: boolean;
}

export function PropertyDetailModal({
  property,
  isSelected,
  onClose,
  onToggleSelect,
  onShareSingle,
  forceMobile = false,
}: PropertyDetailModalProps) {
  const [activePhoto, setActivePhoto] = useState(0);
  const [activeTab, setActiveTab] = useState<"caracteristicas" | "memoria">(
    "caracteristicas"
  );
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    setActivePhoto(0);
    setActiveTab("caracteristicas");
    setIsLightboxOpen(false);
  }, [property?.id]);

  useEffect(() => {
    if (!property) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isLightboxOpen) {
          setIsLightboxOpen(false);
        } else {
          onClose();
        }
      } else if (e.key === "ArrowLeft") {
        setActivePhoto((prev) =>
          prev === 0 ? property.photos.length - 1 : prev - 1
        );
      } else if (e.key === "ArrowRight") {
        setActivePhoto((prev) =>
          prev === property.photos.length - 1 ? 0 : prev + 1
        );
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [property, isLightboxOpen, onClose]);

  if (!property) return null;

  const currentPhoto = property.photos[activePhoto] || property.photos[0];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center bg-[#0B2545]/60 backdrop-blur-sm ${
        forceMobile ? "" : "sm:items-center sm:p-6"
      }`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={property.title}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative flex max-h-[94%] w-full max-w-5xl flex-col overflow-hidden rounded-t-3xl border border-[#DCE7F3] bg-white shadow-2xl ${
          forceMobile ? "" : "sm:rounded-3xl"
        }`}
      >
        {/* Mobile drag handle */}
        <div className={`flex justify-center bg-[#F4F8FC] pt-2.5 ${forceMobile ? "" : "sm:hidden"}`}>
          <div className="h-1 w-10 rounded-full bg-[#C5D8EE]" />
        </div>

        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-[#DCE7F3] bg-[#F4F8FC] px-5 py-3.5 sm:px-7 sm:py-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-full bg-[#1658B8] px-3 py-1 text-xs font-semibold text-white">
              {property.operation}
            </span>
            <span className="rounded-full border border-[#DCE7F3] bg-white px-3 py-1 text-xs font-semibold text-[#0B2545]">
              {property.category}
            </span>
            <span className="font-mono text-xs text-[#476484]">
              Ref. {property.ref}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ficha"
            className="rounded-full border border-[#DCE7F3] bg-white p-2 text-[#0B2545] transition-colors hover:bg-[#EBF3FB] hover:text-[#1658B8]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ overscrollBehavior: "contain" }}
        >
          {/* Gallery Section */}
          <div className="border-b border-[#DCE7F3] bg-[#F4F8FC]/60 p-5 sm:px-7 sm:py-6">
            <div className="relative aspect-[16/9] max-h-[420px] w-full overflow-hidden rounded-2xl bg-[#EBF3FB]">
              <img
                src={currentPhoto.url}
                alt={currentPhoto.caption}
                className="h-full w-full object-cover"
              />

              {/* Zoom trigger */}
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-[#0B2545]/75 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-[#0B2545]"
              >
                <ZoomIn className="h-3.5 w-3.5" />
                Ampliar foto
              </button>

              {property.photos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setActivePhoto((p) =>
                        p === 0 ? property.photos.length - 1 : p - 1
                      )
                    }
                    aria-label="Foto anterior"
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2.5 text-[#0B2545] shadow-md transition-colors hover:bg-white"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActivePhoto((p) =>
                        p === property.photos.length - 1 ? 0 : p + 1
                      )
                    }
                    aria-label="Siguiente foto"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2.5 text-[#0B2545] shadow-md transition-colors hover:bg-white"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Caption */}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-[#0B2545]/80 via-[#0B2545]/40 to-transparent px-4 pb-3 pt-8 text-xs text-white sm:text-sm">
                <span>{currentPhoto.caption}</span>
                <span className="ml-3 shrink-0 rounded-full bg-white/20 px-2.5 py-0.5 text-xs backdrop-blur-sm">
                  {activePhoto + 1} / {property.photos.length}
                </span>
              </div>
            </div>

            {/* Thumbnails */}
            <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1">
              {property.photos.map((photo, idx) => (
                <button
                  key={photo.url + idx}
                  type="button"
                  onClick={() => setActivePhoto(idx)}
                  className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                    idx === activePhoto
                      ? "border-[#1658B8] ring-2 ring-[#1658B8]/25"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={photo.url}
                    alt={photo.caption}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Main Info & Tabs */}
          <div className="p-5 sm:px-7 sm:py-6">
            <div className="flex flex-col justify-between gap-4 border-b border-[#DCE7F3] pb-5 md:flex-row md:items-end">
              <div>
                <p className="flex items-center gap-1.5 text-sm font-medium text-[#1658B8]">
                  <MapPin className="h-4 w-4" />
                  {property.address} · {property.neighborhood}, {property.city}
                </p>
                <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-[#0B2545] sm:text-3xl">
                  {property.title}
                </h2>
                <p className="mt-1.5 text-sm text-[#476484] sm:text-base">
                  {property.subtitle}
                </p>
              </div>
              <div className="shrink-0 text-left md:text-right">
                <span className="text-xs font-medium text-[#476484]">
                  Precio de {property.operation.toLowerCase()}
                </span>
                <div className="text-3xl font-bold tracking-tight text-[#0B2545]">
                  {property.priceFormatted}
                </div>
              </div>
            </div>

            {/* Quick Key Stats Bar */}
            <div
              className={`mt-5 grid grid-cols-2 gap-2.5 ${
                forceMobile ? "" : "sm:grid-cols-3 lg:grid-cols-6"
              }`}
            >
              <div className="rounded-2xl border border-[#DCE7F3] bg-[#F4F8FC] p-3">
                <div className="flex items-center gap-1.5 text-xs text-[#476484]">
                  <Maximize2 className="h-3.5 w-3.5 text-[#1658B8]" />
                  Sup. construida
                </div>
                <div className="mt-1 text-base font-bold text-[#0B2545]">
                  {property.areaBuilt} m²
                </div>
              </div>
              <div className="rounded-2xl border border-[#DCE7F3] bg-[#F4F8FC] p-3">
                <div className="flex items-center gap-1.5 text-xs text-[#476484]">
                  <Layers className="h-3.5 w-3.5 text-[#1658B8]" />
                  Sup. útil
                </div>
                <div className="mt-1 text-base font-bold text-[#0B2545]">
                  {property.areaUsable} m²
                </div>
              </div>
              <div className="rounded-2xl border border-[#DCE7F3] bg-[#F4F8FC] p-3">
                <div className="flex items-center gap-1.5 text-xs text-[#476484]">
                  <BedDouble className="h-3.5 w-3.5 text-[#1658B8]" />
                  Dormitorios
                </div>
                <div className="mt-1 text-base font-bold text-[#0B2545]">
                  {property.bedrooms}
                </div>
              </div>
              <div className="rounded-2xl border border-[#DCE7F3] bg-[#F4F8FC] p-3">
                <div className="flex items-center gap-1.5 text-xs text-[#476484]">
                  <Bath className="h-3.5 w-3.5 text-[#1658B8]" />
                  Baños
                </div>
                <div className="mt-1 text-base font-bold text-[#0B2545]">
                  {property.bathrooms}
                </div>
              </div>
              <div className="rounded-2xl border border-[#DCE7F3] bg-[#F4F8FC] p-3">
                <div className="flex items-center gap-1.5 text-xs text-[#476484]">
                  <Car className="h-3.5 w-3.5 text-[#1658B8]" />
                  Garaje
                </div>
                <div className="mt-1 text-base font-bold text-[#0B2545]">
                  {property.garageSpaces > 0
                    ? `${property.garageSpaces} ${property.garageSpaces === 1 ? "plaza" : "plazas"}`
                    : "No"}
                </div>
              </div>
              <div className="rounded-2xl border border-[#DCE7F3] bg-[#F4F8FC] p-3">
                <div className="flex items-center gap-1.5 text-xs text-[#476484]">
                  <Zap className="h-3.5 w-3.5 text-[#1658B8]" />
                  Eficiencia
                </div>
                <div className="mt-1 text-base font-bold text-[#0B2545]">
                  Clase {property.energyRating}
                </div>
              </div>
            </div>

            {/* Tabs Switcher */}
            <div className="mt-7 flex gap-2 border-b border-[#DCE7F3]">
              <button
                type="button"
                onClick={() => setActiveTab("caracteristicas")}
                className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                  activeTab === "caracteristicas"
                    ? "border-[#1658B8] text-[#1658B8]"
                    : "border-transparent text-[#476484] hover:text-[#0B2545]"
                }`}
              >
                Características y descripción
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("memoria")}
                className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                  activeTab === "memoria"
                    ? "border-[#1658B8] text-[#1658B8]"
                    : "border-transparent text-[#476484] hover:text-[#0B2545]"
                }`}
              >
                Memoria de calidades
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === "caracteristicas" ? (
              <div className={`mt-5 grid gap-6 ${forceMobile ? "" : "md:grid-cols-5"}`}>
                <div className={`space-y-4 ${forceMobile ? "" : "md:col-span-3"}`}>
                  <h3 className="text-sm font-semibold text-[#0B2545]">
                    Descripción de la propiedad
                  </h3>
                  <p className="text-sm leading-relaxed text-[#476484]">
                    {property.description}
                  </p>

                  <div className="pt-2">
                    <h4 className="text-sm font-semibold text-[#0B2545]">
                      Equipamiento y extras
                    </h4>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {property.features.map((feat) => (
                        <span
                          key={feat}
                          className="inline-flex items-center gap-1.5 rounded-full border border-[#DCE7F3] bg-[#F4F8FC] px-3 py-1.5 text-xs font-medium text-[#0B2545]"
                        >
                          <Check className="h-3.5 w-3.5 text-[#1658B8]" />
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={`rounded-2xl border border-[#DCE7F3] bg-[#F4F8FC] p-4 ${forceMobile ? "" : "md:col-span-2"}`}>
                  <h4 className="text-sm font-semibold text-[#0B2545]">
                    Datos técnicos
                  </h4>
                  <dl className="mt-3 space-y-2.5 text-sm">
                    <div className="flex justify-between border-b border-[#DCE7F3] pb-2">
                      <dt className="flex items-center gap-1.5 text-[#476484]">
                        <Layers className="h-3.5 w-3.5 text-[#1658B8]" />
                        Planta
                      </dt>
                      <dd className="font-medium text-[#0B2545]">
                        {property.floor}
                      </dd>
                    </div>
                    <div className="flex justify-between border-b border-[#DCE7F3] pb-2">
                      <dt className="flex items-center gap-1.5 text-[#476484]">
                        <Compass className="h-3.5 w-3.5 text-[#1658B8]" />
                        Orientación
                      </dt>
                      <dd className="font-medium text-[#0B2545]">
                        {property.orientation}
                      </dd>
                    </div>
                    <div className="flex justify-between border-b border-[#DCE7F3] pb-2">
                      <dt className="flex items-center gap-1.5 text-[#476484]">
                        <Calendar className="h-3.5 w-3.5 text-[#1658B8]" />
                        Año construcción
                      </dt>
                      <dd className="font-medium text-[#0B2545]">
                        {property.yearBuilt}
                      </dd>
                    </div>
                    {property.terraceArea && (
                      <div className="flex justify-between border-b border-[#DCE7F3] pb-2">
                        <dt className="text-[#476484]">Terraza / exterior</dt>
                        <dd className="font-medium text-[#0B2545]">
                          {property.terraceArea} m²
                        </dd>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <dt className="text-[#476484]">Trastero</dt>
                      <dd className="font-medium text-[#0B2545]">
                        {property.hasStorageRoom ? "Incluido" : "No"}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <div className="flex items-center gap-2 rounded-xl border border-[#BBD6F5] bg-[#EBF3FB] px-4 py-2.5 text-xs text-[#0B2545]">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-[#1658B8]" />
                  Memoria constructiva y especificaciones técnicas (datos simulados de catálogo).
                </div>

                <div className={`grid gap-4 ${forceMobile ? "" : "md:grid-cols-2"}`}>
                  {property.memoriaCalidades.map((section) => (
                    <div
                      key={section.category}
                      className="rounded-2xl border border-[#DCE7F3] bg-[#F4F8FC] p-4"
                    >
                      <h4 className="font-semibold text-[#0B2545]">
                        {section.category}
                      </h4>
                      <ul className="mt-2.5 space-y-2">
                        {section.details.map((detail, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm leading-relaxed text-[#476484]"
                          >
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1658B8]" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#DCE7F3] bg-white px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 sm:px-7">
          <button
            type="button"
            onClick={() => onToggleSelect(property.id)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              isSelected
                ? "bg-[#EBF3FB] text-[#1658B8] ring-1 ring-[#1658B8]"
                : "border border-[#DCE7F3] bg-[#F4F8FC] text-[#0B2545] hover:border-[#1658B8]"
            }`}
          >
            <Check className="h-4 w-4" />
            {isSelected
              ? "Seleccionada para envío"
              : "Añadir a selección para cliente"}
          </button>

          <button
            type="button"
            onClick={() => onShareSingle(property)}
            className="flex items-center gap-2 rounded-xl bg-[#1658B8] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0F4494]"
          >
            <MessageCircle className="h-4 w-4" />
            Compartir ficha por WhatsApp
          </button>
        </div>
      </div>

      {/* Fullscreen Lightbox */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0B2545]/95 p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Cerrar pantalla completa"
            className="absolute right-5 top-5 rounded-full bg-white/15 p-2.5 text-white hover:bg-white/25"
          >
            <X className="h-6 w-6" />
          </button>

          <img
            src={currentPhoto.url}
            alt={currentPhoto.caption}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-[92vw] rounded-xl object-contain"
          />

          <p className="absolute bottom-6 rounded-full bg-black/50 px-4 py-1.5 text-sm text-white backdrop-blur-sm">
            {currentPhoto.caption} ({activePhoto + 1}/{property.photos.length})
          </p>
        </div>
      )}
    </div>
  );
}
