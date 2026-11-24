"use client";

import React from "react";
import { X, RotateCcw } from "lucide-react";
import { ALL_QUICK_FEATURES } from "@/data/properties";
import { FilterState, OperationType, PropertyCategory } from "@/types/property";

interface FilterSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onChangeFilters: (next: FilterState) => void;
  onReset: () => void;
  resultCount: number;
  forceMobile?: boolean;
}

const OPERATIONS: ("Todas" | OperationType)[] = ["Todas", "Venta", "Alquiler"];
const CATEGORIES: ("Todas" | PropertyCategory)[] = [
  "Todas",
  "Ático",
  "Villa",
  "Piso",
  "Chalet",
  "Loft",
];

export function FilterSheetModal({
  isOpen,
  onClose,
  filters,
  onChangeFilters,
  onReset,
  resultCount,
  forceMobile = false,
}: FilterSheetModalProps) {
  if (!isOpen) return null;

  const toggleFeature = (feature: string) => {
    const exists = filters.requiredFeatures.includes(feature);
    onChangeFilters({
      ...filters,
      requiredFeatures: exists
        ? filters.requiredFeatures.filter((f) => f !== feature)
        : [...filters.requiredFeatures, feature],
    });
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center bg-[#0B2545]/55 backdrop-blur-sm ${
        forceMobile ? "" : "sm:items-center sm:p-4"
      }`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Filtros de búsqueda"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`flex max-h-[90%] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-[#DCE7F3] bg-white shadow-2xl ${
          forceMobile ? "" : "sm:rounded-3xl"
        }`}
      >
        {/* Mobile Sheet Drag Indicator */}
        <div className={`flex justify-center pt-2.5 ${forceMobile ? "" : "sm:hidden"}`}>
          <div className="h-1 w-10 rounded-full bg-[#C5D8EE]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#DCE7F3] px-5 py-4">
          <h2 className="text-lg font-bold tracking-tight text-[#0B2545]">
            Filtros de búsqueda
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar filtros"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#DCE7F3] bg-[#F4F8FC] text-[#0B2545] active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Filter Body */}
        <div
          className="flex-1 space-y-6 overflow-y-auto p-5"
          style={{ overscrollBehavior: "contain" }}
        >
          {/* Operation Segmented Control */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#476484]">
              Operación
            </span>
            <div className="mt-2.5 grid grid-cols-3 gap-2 rounded-2xl bg-[#F4F8FC] p-1.5">
              {OPERATIONS.map((op) => {
                const active = filters.operation === op;
                return (
                  <button
                    key={op}
                    type="button"
                    onClick={() =>
                      onChangeFilters({ ...filters, operation: op })
                    }
                    className={`rounded-xl py-2.5 text-sm font-semibold transition-all active:scale-[0.97] ${
                      active
                        ? "bg-[#1658B8] text-white shadow-sm"
                        : "text-[#0B2545] hover:bg-white"
                    }`}
                  >
                    {op}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Chips */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#476484]">
              Tipología
            </span>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const active = filters.category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() =>
                      onChangeFilters({ ...filters, category: cat })
                    }
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition-all active:scale-95 ${
                      active
                        ? "bg-[#0B2545] text-white"
                        : "border border-[#DCE7F3] bg-white text-[#0B2545] hover:border-[#1658B8]"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Max Price & Min Bedrooms */}
          <div className={`grid grid-cols-1 gap-4 ${forceMobile ? "" : "sm:grid-cols-2"}`}>
            <div>
              <label
                htmlFor="sheet-max-price"
                className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#476484]"
              >
                Presupuesto máximo
              </label>
              <select
                id="sheet-max-price"
                value={filters.maxPrice ?? ""}
                onChange={(e) =>
                  onChangeFilters({
                    ...filters,
                    maxPrice: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className="mt-2 w-full rounded-xl border border-[#DCE7F3] bg-[#F4F8FC] px-3.5 py-3 text-base font-medium text-[#0B2545] focus:border-[#1658B8] focus:bg-white focus:outline-none sm:text-sm"
              >
                <option value="">Sin límite</option>
                <option value="1500">≤ $1.500/mes</option>
                <option value="2500">≤ $2.500/mes</option>
                <option value="200000">≤ $200.000</option>
                <option value="350000">≤ $350.000</option>
                <option value="600000">≤ $600.000</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="sheet-min-beds"
                className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#476484]"
              >
                Dormitorios mínimos
              </label>
              <div className="mt-2 grid grid-cols-4 gap-1.5">
                {[0, 2, 3, 4].map((beds) => {
                  const active = filters.minBedrooms === beds;
                  return (
                    <button
                      key={beds}
                      type="button"
                      onClick={() =>
                        onChangeFilters({ ...filters, minBedrooms: beds })
                      }
                      className={`rounded-xl py-2.5 text-sm font-semibold transition-all active:scale-95 ${
                        active
                          ? "bg-[#1658B8] text-white"
                          : "border border-[#DCE7F3] bg-[#F4F8FC] text-[#0B2545]"
                      }`}
                    >
                      {beds === 0 ? "Todos" : `${beds}+`}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Extras */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#476484]">
              Características y extras
            </span>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {ALL_QUICK_FEATURES.map((feat) => {
                const active = filters.requiredFeatures.includes(feat);
                return (
                  <button
                    key={feat}
                    type="button"
                    onClick={() => toggleFeature(feat)}
                    className={`rounded-full px-3.5 py-2 text-xs font-semibold transition-all active:scale-95 ${
                      active
                        ? "bg-[#1658B8] text-white"
                        : "border border-[#DCE7F3] bg-[#F4F8FC] text-[#0B2545] hover:border-[#1658B8]"
                    }`}
                  >
                    {feat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sticky Footer with safe-area padding */}
        <div className="flex items-center justify-between gap-3 border-t border-[#DCE7F3] bg-white px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#476484] hover:text-[#0B2545] active:scale-95"
          >
            <RotateCcw className="h-4 w-4" />
            Restablecer
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl bg-[#1658B8] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-transform active:scale-[0.98] sm:flex-none"
          >
            Ver {resultCount}{" "}
            {resultCount === 1 ? "propiedad" : "propiedades"}
          </button>
        </div>
      </div>
    </div>
  );
}
