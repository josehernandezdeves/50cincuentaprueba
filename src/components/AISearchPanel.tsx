"use client";

import React, { useState } from "react";
import { Sparkles, Send, RotateCcw, Loader2 } from "lucide-react";
import { AISearchResponse } from "@/types/property";

interface AISearchPanelProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  aiResponse: AISearchResponse | null;
  isThinking: boolean;
}

const EXAMPLE_PROMPTS = [
  "Ático luminoso con terraza y vistas al mar en Málaga o Valencia hasta 900.000€",
  "Casa familiar con piscina, jardín y 4 habitaciones para comprar",
  "Piso amueblado en alquiler en Madrid centro con garaje",
  "Loft moderno cerca del mar en Barcelona",
];

export function AISearchPanel({
  onSearch,
  onClear,
  aiResponse,
  isThinking,
}: AISearchPanelProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSearch(input.trim());
  };

  const handleExampleClick = (prompt: string) => {
    setInput(prompt);
    onSearch(prompt);
  };

  return (
    <section
      aria-label="Buscador con Inteligencia Artificial simulado"
      className="rounded-3xl border border-[#BBD6F5] bg-gradient-to-br from-[#F4F8FC] via-white to-[#EBF3FB] p-5 shadow-sm sm:p-7"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1658B8] text-white shadow-sm">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#0B2545] sm:text-lg">
                Buscador inteligente por lenguaje natural
              </h2>
              <span className="rounded-full bg-[#1658B8]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#1658B8]">
                IA Simulada
              </span>
            </div>
            <p className="text-xs text-[#476484] sm:text-sm">
              Describe lo que busca tu cliente con tus propias palabras: ciudad, presupuesto, estilo o extras.
            </p>
          </div>
        </div>

        {aiResponse && (
          <button
            type="button"
            onClick={() => {
              setInput("");
              onClear();
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#DCE7F3] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#0B2545] transition-colors hover:border-[#1658B8] hover:text-[#1658B8]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Volver al catálogo completo
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-4">
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ej: Busco un ático con terraza amplia en Valencia o Málaga por menos de 900.000€..."
            className="flex-1 rounded-2xl border border-[#C5D8EE] bg-white px-4 py-3.5 text-sm text-[#0B2545] shadow-inner placeholder:text-[#7E98B5] focus:border-[#1658B8] focus:outline-none focus:ring-2 focus:ring-[#1658B8]/20"
          />
          <button
            type="submit"
            disabled={isThinking || !input.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1658B8] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#0F4494] disabled:cursor-not-allowed disabled:opacity-55"
          >
            {isThinking ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analizando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Buscar con IA
              </>
            )}
          </button>
        </div>
      </form>

      {/* Example prompts */}
      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-[#476484]">
          Prueba un ejemplo:
        </span>
        {EXAMPLE_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => handleExampleClick(prompt)}
            className="rounded-full border border-[#DCE7F3] bg-white/90 px-3 py-1 text-left text-xs text-[#0B2545] transition-colors hover:border-[#1658B8] hover:bg-[#EBF3FB] hover:text-[#1658B8]"
          >
            “{prompt}”
          </button>
        ))}
      </div>

      {/* AI Interpretation Result */}
      {aiResponse && !isThinking && (
        <div className="mt-4 rounded-2xl border border-[#C5D8EE] bg-white p-4">
          <p className="text-sm font-medium text-[#0B2545]">
            {aiResponse.summary}
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[#476484]">
              Criterios interpretados:
            </span>
            {aiResponse.interpretedCriteria.map((criterion) => (
              <span
                key={criterion}
                className="rounded-full bg-[#EBF3FB] px-2.5 py-1 text-xs font-semibold text-[#1658B8]"
              >
                {criterion}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
