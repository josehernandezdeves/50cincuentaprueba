"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
  MessageCircle,
  RotateCcw,
  Loader2,
  Send,
  Smartphone,
  Monitor,
  Wifi,
  BatteryFull,
} from "lucide-react";
import { PROPERTIES } from "@/data/properties";
import {
  AISearchResponse,
  FilterState,
  Property,
  PropertyCategory,
} from "@/types/property";
import { runSimulatedAISearch } from "@/lib/aiSearch";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyDetailModal } from "@/components/PropertyDetailModal";
import { WhatsAppShareModal } from "@/components/WhatsAppShareModal";
import { FilterSheetModal } from "@/components/FilterSheetModal";

const INITIAL_FILTERS: FilterState = {
  query: "",
  operation: "Todas",
  category: "Todas",
  maxPrice: null,
  minBedrooms: 0,
  requiredFeatures: [],
};

const QUICK_RAILS: {
  id: string;
  label: string;
  category?: "Todas" | PropertyCategory;
  feature?: string;
}[] = [
  { id: "all", label: "Todo el catálogo", category: "Todas" },
  { id: "atico", label: "Áticos", category: "Ático" },
  { id: "villa", label: "Villas", category: "Villa" },
  { id: "piso", label: "Pisos", category: "Piso" },
  { id: "chalet", label: "Chalets", category: "Chalet" },
  { id: "loft", label: "Lofts", category: "Loft" },
  { id: "mar", label: "Vistas al mar", feature: "Vistas al mar" },
  { id: "piscina", label: "Piscina", feature: "Piscina" },
  { id: "terraza", label: "Terraza", feature: "Terraza" },
];

const AI_EXAMPLES = [
  "Ático con terraza y vistas al mar en Pampatar hasta $350.000",
  "Casa familiar con piscina y 4 habitaciones en Maneiro",
  "Apartamento amueblado en alquiler en Porlamar con garaje",
];

type ViewMode = "desktop" | "mobile";

export default function CatalogPage() {
  const [viewMode, setViewMode] = useState<ViewMode | null>(null);
  const [properties, setProperties] = useState<Property[]>(PROPERTIES);

  useEffect(() => {
    fetch("/api/properties")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.properties) && data.properties.length > 0) {
          setProperties(data.properties);
        }
      })
      .catch(() => {
        // Keep local fallback
      });
  }, []);

  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [searchMode, setSearchMode] = useState<"standard" | "ai">("standard");
  const [aiInput, setAiInput] = useState("");
  const [aiResponse, setAiResponse] = useState<AISearchResponse | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);

  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailProperty, setDetailProperty] = useState<Property | null>(null);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [singleShareProperty, setSingleShareProperty] =
    useState<Property | null>(null);

  const isMobileFrame = viewMode === "mobile";

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setAiResponse(null);
    setAiInput("");
  };

  const handleRunAISearch = (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed) return;
    setIsAiThinking(true);
    setTimeout(() => {
      const result = runSimulatedAISearch(trimmed, properties);
      setAiResponse(result);
      setIsAiThinking(false);
    }, 380);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.operation !== "Todas") count++;
    if (filters.category !== "Todas") count++;
    if (filters.maxPrice !== null) count++;
    if (filters.minBedrooms > 0) count++;
    count += filters.requiredFeatures.length;
    return count;
  }, [filters, properties]);

  const filteredProperties = useMemo(() => {
    return properties.filter((prop) => {
      if (filters.operation !== "Todas" && prop.operation !== filters.operation) {
        return false;
      }
      if (filters.category !== "Todas" && prop.category !== filters.category) {
        return false;
      }
      if (filters.maxPrice !== null && prop.price > filters.maxPrice) {
        return false;
      }
      if (filters.minBedrooms > 0 && prop.bedrooms < filters.minBedrooms) {
        return false;
      }
      if (filters.requiredFeatures.length > 0) {
        const hasAll = filters.requiredFeatures.every((req) =>
          prop.features.includes(req)
        );
        if (!hasAll) return false;
      }
      if (filters.query.trim()) {
        const q = filters.query.toLowerCase();
        const haystack =
          `${prop.title} ${prop.subtitle} ${prop.city} ${prop.neighborhood} ${prop.ref} ${prop.category}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [filters, properties]);

  const displayedItems = useMemo(() => {
    if (searchMode === "ai" && aiResponse) {
      return aiResponse.matches.map((m) => ({
        property: m.property,
        aiMatch: { score: m.score, reasons: m.reasons },
      }));
    }
    return filteredProperties.map((p) => ({
      property: p,
      aiMatch: undefined,
    }));
  }, [searchMode, aiResponse, filteredProperties]);

  const selectedProperties = useMemo(() => {
    return properties.filter((p) => selectedIds.includes(p.id));
  }, [selectedIds, properties]);

  const propertiesForModal = singleShareProperty
    ? [singleShareProperty]
    : selectedProperties;

  const catalogAppContent = (
    <div className="min-h-full bg-white pb-28">
      {/* Compact App Header */}
      <header
        className={`sticky top-0 z-30 border-b border-[#DCE7F3] bg-white/95 backdrop-blur-md ${
          isMobileFrame ? "" : "pt-[env(safe-area-inset-top)]"
        }`}
      >
        <div
          className={`mx-auto flex max-w-7xl items-center justify-between gap-2 py-3 ${
            isMobileFrame ? "px-4" : "px-4 sm:px-6 lg:px-8"
          }`}
        >
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#0B2545] text-xs font-bold tracking-tight text-white">
              50
            </div>
            <div className="min-w-0">
              <span
                className={`block truncate font-bold tracking-tight text-[#0B2545] ${
                  isMobileFrame ? "text-[14px]" : "text-lg sm:text-xl"
                }`}
              >
                50cincuenta catálogo
              </span>
              <span className="block truncate text-[10px] font-semibold uppercase tracking-[0.08em] text-[#476484]">
                {isMobileFrame ? "Isla de Margarita" : "Isla de Margarita · Simulado"}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {/* Switch to Mobile button when in Desktop mode */}
            {viewMode === "desktop" && (
              <button
                type="button"
                onClick={() => setViewMode("mobile")}
                className="hidden items-center gap-1.5 rounded-full border border-[#DCE7F3] bg-white px-3 py-1.5 text-xs font-semibold text-[#0B2545] transition-colors hover:border-[#1658B8] hover:text-[#1658B8] sm:inline-flex"
                title="Ver en marco de teléfono"
              >
                <Smartphone className="h-3.5 w-3.5 text-[#1658B8]" />
                <span>Marco Mobile</span>
              </button>
            )}

            {/* Segmented Mode Switcher (Catálogo | Buscador IA) */}
            <div className="flex items-center rounded-full border border-[#DCE7F3] bg-[#F4F8FC] p-1">
              <button
                type="button"
                onClick={() => setSearchMode("standard")}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-all active:scale-95 ${
                  searchMode === "standard"
                    ? "bg-white text-[#0B2545] shadow-sm"
                    : "text-[#476484]"
                }`}
              >
                Catálogo
              </button>
              <button
                type="button"
                onClick={() => setSearchMode("ai")}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-all active:scale-95 ${
                  searchMode === "ai"
                    ? "bg-[#1658B8] text-white shadow-sm"
                    : "text-[#1658B8]"
                }`}
              >
                <Sparkles className="h-3 w-3" />
                IA
              </button>
            </div>
          </div>
        </div>

        {/* Unified Mobile-First Search Bar inside sticky header */}
        <div
          className={`mx-auto max-w-7xl pb-3 ${
            isMobileFrame ? "px-4" : "px-4 sm:px-6 lg:px-8"
          }`}
        >
          {searchMode === "standard" ? (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#476484]" />
                <input
                  type="search"
                  enterKeyHint="search"
                  value={filters.query}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, query: e.target.value }))
                  }
                  placeholder="Zona, ciudad o ref..."
                  className={`w-full rounded-2xl border border-[#DCE7F3] bg-[#F4F8FC] py-2.5 pl-10 pr-8 text-[#0B2545] placeholder:text-[#7E98B5] focus:border-[#1658B8] focus:bg-white focus:outline-none ${
                    isMobileFrame ? "text-sm" : "text-base sm:text-sm"
                  }`}
                />
                {filters.query && (
                  <button
                    type="button"
                    onClick={() => setFilters((f) => ({ ...f, query: "" }))}
                    aria-label="Borrar búsqueda"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#476484] hover:text-[#0B2545]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsFilterSheetOpen(true)}
                className={`relative inline-flex h-[42px] shrink-0 items-center gap-1.5 rounded-2xl border px-3.5 text-xs font-semibold transition-transform active:scale-95 ${
                  activeFilterCount > 0
                    ? "border-[#1658B8] bg-[#EBF3FB] text-[#1658B8]"
                    : "border-[#DCE7F3] bg-white text-[#0B2545]"
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filtros</span>
                {activeFilterCount > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#1658B8] px-1.5 text-[11px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRunAISearch(aiInput);
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <Sparkles className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1658B8]" />
                <input
                  type="text"
                  enterKeyHint="search"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Describe lo que busca tu cliente..."
                  className={`w-full rounded-2xl border border-[#BBD6F5] bg-[#F4F8FC] py-2.5 pl-10 pr-4 text-[#0B2545] placeholder:text-[#7E98B5] focus:border-[#1658B8] focus:bg-white focus:outline-none ${
                    isMobileFrame ? "text-sm" : "text-base sm:text-sm"
                  }`}
                />
              </div>
              <button
                type="submit"
                disabled={isAiThinking || !aiInput.trim()}
                aria-label="Buscar con IA"
                className="inline-flex h-[42px] shrink-0 items-center gap-1.5 rounded-2xl bg-[#1658B8] px-3.5 text-xs font-semibold text-white transition-transform active:scale-95 disabled:opacity-50"
              >
                {isAiThinking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {!isMobileFrame && <span className="hidden sm:inline">Buscar</span>}
              </button>
            </form>
          )}
        </div>

        {/* Horizontal Swipeable Category / Collection Rail */}
        {searchMode === "standard" && (
          <div
            className={`mx-auto max-w-7xl border-t border-[#DCE7F3]/70 py-2.5 ${
              isMobileFrame ? "px-4" : "px-4 sm:px-6 lg:px-8"
            }`}
          >
            <div
              className="no-scrollbar flex items-center gap-2 overflow-x-auto"
              style={{ touchAction: "pan-x pan-y" }}
            >
              {QUICK_RAILS.map((item) => {
                const isActive = item.category
                  ? filters.category === item.category &&
                    filters.requiredFeatures.length === 0
                  : item.feature
                  ? filters.requiredFeatures.includes(item.feature)
                  : false;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (item.category) {
                        setFilters((f) => ({
                          ...f,
                          category: item.category!,
                          requiredFeatures:
                            item.category === "Todas" ? [] : f.requiredFeatures,
                        }));
                      } else if (item.feature) {
                        setFilters((f) => ({
                          ...f,
                          requiredFeatures: f.requiredFeatures.includes(
                            item.feature!
                          )
                            ? f.requiredFeatures.filter(
                                (feat) => feat !== item.feature
                              )
                            : [...f.requiredFeatures, item.feature!],
                        }));
                      }
                    }}
                    className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all active:scale-95 ${
                      isActive
                        ? "bg-[#0B2545] text-white"
                        : "border border-[#DCE7F3] bg-white text-[#476484] hover:border-[#1658B8] hover:text-[#0B2545]"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      <main
        className={`mx-auto max-w-7xl pt-5 ${
          isMobileFrame ? "px-4" : "px-4 sm:px-6 sm:pt-7 lg:px-8"
        }`}
      >
        {/* AI Mode Helper / Results Banner */}
        {searchMode === "ai" && (
          <section className="mb-5 rounded-2xl border border-[#BBD6F5] bg-[#F4F8FC] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#1658B8] px-2.5 py-0.5 text-[11px] font-semibold text-white">
                  IA Simulada
                </span>
                <span className="text-xs font-medium text-[#476484]">
                  Búsqueda natural
                </span>
              </div>
              {aiResponse && (
                <button
                  type="button"
                  onClick={() => {
                    setAiResponse(null);
                    setAiInput("");
                  }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#1658B8]"
                >
                  <RotateCcw className="h-3 w-3" />
                  Nueva consulta
                </button>
              )}
            </div>

            {!aiResponse ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {AI_EXAMPLES.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => {
                      setAiInput(example);
                      handleRunAISearch(example);
                    }}
                    className="rounded-xl border border-[#DCE7F3] bg-white px-3 py-2 text-left text-xs font-medium text-[#0B2545] transition-transform active:scale-95 hover:border-[#1658B8]"
                  >
                    “{example}”
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-3">
                <p className="text-sm font-medium text-[#0B2545]">
                  {aiResponse.summary}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {aiResponse.interpretedCriteria.map((crit) => (
                    <span
                      key={crit}
                      className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[#1658B8] ring-1 ring-[#DCE7F3]"
                    >
                      {crit}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Section Title */}
        <div
          className={`mb-5 flex flex-col justify-between gap-2 ${
            isMobileFrame ? "" : "sm:mb-7 sm:flex-row sm:items-end"
          }`}
        >
          <div>
            <h1
              className={`font-bold leading-tight tracking-tight text-[#0B2545] ${
                isMobileFrame ? "text-xl" : "text-2xl sm:text-3xl"
              }`}
            >
              {searchMode === "ai" && aiResponse
                ? "Selección sugerida para tu cliente"
                : "Colección residencial"}
            </h1>
            <p className="mt-1 text-xs text-[#476484]">
              {displayedItems.length}{" "}
              {displayedItems.length === 1
                ? "propiedad disponible"
                : "propiedades disponibles"}{" "}
              · Toca para ver galería y memoria
            </p>
          </div>

          {activeFilterCount > 0 && searchMode === "standard" && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 self-start text-xs font-semibold text-[#1658B8] hover:underline"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Limpiar filtros ({activeFilterCount})
            </button>
          )}
        </div>

        {/* Property Feed Grid */}
        {displayedItems.length > 0 ? (
          <div
            className={`grid gap-5 ${
              isMobileFrame
                ? "grid-cols-1"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6"
            }`}
          >
            {displayedItems.map(({ property, aiMatch }) => (
              <PropertyCard
                key={property.id}
                property={property}
                isSelected={selectedIds.includes(property.id)}
                onToggleSelect={handleToggleSelect}
                onOpenDetail={(prop) => setDetailProperty(prop)}
                aiMatch={aiMatch}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-[#BBD6F5] bg-[#F4F8FC] px-6 py-12 text-center">
            <p className="text-lg font-bold text-[#0B2545]">
              Sin resultados para estos criterios
            </p>
            <p className="mt-1.5 text-xs text-[#476484]">
              Ajusta los filtros o prueba otra descripción en el buscador IA.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-[#1658B8] px-5 py-2.5 text-xs font-semibold text-white active:scale-95"
            >
              <RotateCcw className="h-4 w-4" />
              Ver todo el catálogo
            </button>
          </div>
        )}
      </main>

      {/* Native Floating Multi-Select WhatsApp Bar */}
      {selectedProperties.length > 0 && (
        <div
          className={`fixed inset-x-0 z-40 mx-auto max-w-xl px-3 ${
            isMobileFrame
              ? "bottom-3"
              : "bottom-[calc(0.75rem+env(safe-area-inset-bottom))]"
          }`}
        >
          <div className="flex items-center justify-between gap-2.5 rounded-2xl border border-[#1658B8]/25 bg-[#0B2545] p-2.5 pl-3 text-white shadow-2xl shadow-[#0B2545]/35">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex -space-x-2">
                {selectedProperties.slice(0, 3).map((p) => (
                  <img
                    key={p.id}
                    src={p.photos[0]?.url}
                    alt={p.title}
                    className="h-8 w-8 rounded-full border-2 border-[#0B2545] object-cover"
                  />
                ))}
              </div>
              <div className="min-w-0">
                <div className="truncate text-xs font-bold">
                  {selectedProperties.length}{" "}
                  {selectedProperties.length === 1
                    ? "seleccionada"
                    : "seleccionadas"}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="text-[11px] font-medium text-[#BBD6F5] hover:text-white"
                >
                  Limpiar
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setSingleShareProperty(null);
                setIsWhatsAppModalOpen(true);
              }}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#2E86DE] px-3.5 py-2.5 text-xs font-semibold text-white shadow-sm transition-transform active:scale-95 hover:bg-[#1658B8]"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Enviar por WhatsApp</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter Bottom Sheet */}
      <FilterSheetModal
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        filters={filters}
        onChangeFilters={setFilters}
        onReset={handleResetFilters}
        resultCount={filteredProperties.length}
        forceMobile={isMobileFrame}
      />

      {/* Property Detail Sheet/Modal */}
      <PropertyDetailModal
        property={detailProperty}
        isSelected={
          detailProperty ? selectedIds.includes(detailProperty.id) : false
        }
        onClose={() => setDetailProperty(null)}
        onToggleSelect={handleToggleSelect}
        onShareSingle={(prop) => {
          setSingleShareProperty(prop);
          setIsWhatsAppModalOpen(true);
        }}
        forceMobile={isMobileFrame}
      />

      {/* WhatsApp Share Sheet/Modal */}
      <WhatsAppShareModal
        properties={propertiesForModal}
        isOpen={isWhatsAppModalOpen}
        onClose={() => {
          setIsWhatsAppModalOpen(false);
          setSingleShareProperty(null);
        }}
        onRemoveProperty={(id) => {
          if (singleShareProperty?.id === id) {
            setIsWhatsAppModalOpen(false);
            setSingleShareProperty(null);
          } else {
            handleToggleSelect(id);
          }
        }}
        forceMobile={isMobileFrame}
      />
    </div>
  );

  /* 1. Initial Mode Selection Screen */
  if (viewMode === null) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-br from-[#EEF4FC] via-[#FFFFFF] to-[#E2EEF9] p-5">
        <div className="w-full max-w-lg rounded-3xl border border-[#DCE7F3] bg-white p-6 shadow-xl shadow-[#0B2545]/8 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0B2545] text-sm font-bold text-white">
              50
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#0B2545]">
                50cincuenta catálogo
              </h1>
              <p className="text-xs font-medium text-[#476484]">
                Isla de Margarita · Presentación interactiva
              </p>
            </div>
          </div>

          <p className="mt-6 text-base font-semibold text-[#0B2545]">
            ¿Cómo deseas visualizar la aplicación?
          </p>
          <p className="mt-1 text-sm text-[#476484]">
            Elige el modo de presentación. Podrás cambiar entre ambos en cualquier momento.
          </p>

          <div className="mt-6 grid gap-3.5 sm:grid-cols-2">
            {/* Mobile Frame Option */}
            <button
              type="button"
              onClick={() => setViewMode("mobile")}
              className="group flex flex-col items-start rounded-2xl border-2 border-[#1658B8] bg-[#F4F8FC] p-4 text-left transition-all hover:bg-[#EBF3FB] active:scale-[0.98]"
            >
              <div className="flex w-full items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1658B8] text-white">
                  <Smartphone className="h-5 w-5" />
                </span>
                <span className="rounded-full bg-[#1658B8]/15 px-2.5 py-0.5 text-[11px] font-bold text-[#1658B8]">
                  Para cliente
                </span>
              </div>
              <span className="mt-4 text-base font-bold text-[#0B2545]">
                Modo Mobile
              </span>
              <span className="mt-1 text-xs leading-relaxed text-[#476484]">
                Simula la app dentro de un marco de teléfono iPhone.
              </span>
            </button>

            {/* Desktop Option */}
            <button
              type="button"
              onClick={() => setViewMode("desktop")}
              className="group flex flex-col items-start rounded-2xl border border-[#DCE7F3] bg-white p-4 text-left transition-all hover:border-[#1658B8] hover:bg-[#F4F8FC] active:scale-[0.98]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EBF3FB] text-[#0B2545] group-hover:bg-[#0B2545] group-hover:text-white transition-colors">
                <Monitor className="h-5 w-5" />
              </div>
              <span className="mt-4 text-base font-bold text-[#0B2545]">
                Modo Desktop
              </span>
              <span className="mt-1 text-xs leading-relaxed text-[#476484]">
                Vista a pantalla completa para ordenador o proyector.
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* 2. Mobile Phone Frame Mode */
  if (viewMode === "mobile") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-br from-[#EDF4FC] via-[#F7FAFF] to-[#E1EDF9] px-3 py-4 sm:py-6">
        {/* Top presenter switcher bar */}
        <div className="mb-3 flex w-full max-w-[396px] items-center justify-between px-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#0B2545] shadow-sm ring-1 ring-[#DCE7F3]">
            <Smartphone className="h-3.5 w-3.5 text-[#1658B8]" />
            Vista Mobile para cliente
          </span>

          <button
            type="button"
            onClick={() => setViewMode("desktop")}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#0B2545] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-transform hover:bg-[#1658B8] active:scale-95"
          >
            <Monitor className="h-3.5 w-3.5" />
            Ver en Desktop
          </button>
        </div>

        {/* Realistic Phone Bezel */}
        <div className="relative h-[min(830px,calc(100dvh-76px))] w-[min(393px,95vw)] rounded-[52px] border-[10px] border-[#0B2545] bg-[#0B2545] shadow-[0_32px_80px_-16px_rgba(11,37,69,0.42)]">
          {/* Side hardware accents */}
          <div className="pointer-events-none absolute -left-[13px] top-28 h-8 w-[3px] rounded-l-full bg-[#1C3B63]" />
          <div className="pointer-events-none absolute -left-[13px] top-40 h-12 w-[3px] rounded-l-full bg-[#1C3B63]" />
          <div className="pointer-events-none absolute -right-[13px] top-36 h-16 w-[3px] rounded-r-full bg-[#1C3B63]" />

          {/* Screen Viewport (transform: translateZ(0) traps fixed sheets & bars inside the phone) */}
          <div
            className="relative flex h-full w-full flex-col overflow-hidden rounded-[42px] bg-white"
            style={{ transform: "translateZ(0)" }}
          >
            {/* iOS Status Bar + Dynamic Island */}
            <div className="relative z-40 flex shrink-0 items-center justify-between bg-white px-6 pb-2 pt-3 text-[11px] font-semibold text-[#0B2545]">
              <span>9:41</span>

              {/* Dynamic Island */}
              <div className="absolute left-1/2 top-2.5 h-[22px] w-[92px] -translate-x-1/2 rounded-full bg-[#0B2545]" />

              <div className="flex items-center gap-1.5">
                <Wifi className="h-3.5 w-3.5" />
                <BatteryFull className="h-4 w-4" />
              </div>
            </div>

            {/* Scrollable App Area */}
            <div
              className="no-scrollbar flex-1 overflow-y-auto overflow-x-hidden"
              style={{ overscrollBehavior: "contain" }}
            >
              {catalogAppContent}
            </div>

            {/* Home Indicator */}
            <div className="pointer-events-none absolute inset-x-0 bottom-1.5 z-50 flex justify-center">
              <div className="h-1 w-28 rounded-full bg-[#0B2545]/25" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* 3. Desktop Fullscreen Mode */
  return catalogAppContent;
}
