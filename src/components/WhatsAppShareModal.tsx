"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  X,
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  Link2,
  Loader2,
} from "lucide-react";
import { Property } from "@/types/property";

interface WhatsAppShareModalProps {
  properties: Property[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveProperty: (id: string) => void;
  forceMobile?: boolean;
}

export function WhatsAppShareModal({
  properties,
  isOpen,
  onClose,
  onRemoveProperty,
  forceMobile = false,
}: WhatsAppShareModalProps) {
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [customNote, setCustomNote] = useState(
    "Te preparé esta selección exclusiva de propiedades en Isla de Margarita según lo que estás buscando:"
  );
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Reset generated link if selection changes
  useEffect(() => {
    setGeneratedUrl(null);
    setErrorMsg(null);
    setCopiedLink(false);
  }, [properties, clientName, customNote]);

  const message = useMemo(() => {
    const greeting = clientName.trim()
      ? `Hola ${clientName.trim()}, esta es tu selección de propiedades:`
      : "Hola, esta es tu selección de propiedades:";

    const linkLine = generatedUrl
      ? `\n\n👉 *Ver selección completa con fotos y memoria:*\n${generatedUrl}`
      : "";

    const lines = properties.map((p, idx) => {
      return (
        `*${idx + 1}. ${p.title}* (Ref. ${p.ref})\n` +
        `📍 ${p.neighborhood}, ${p.city}\n` +
        `💵 ${p.priceFormatted} (${p.operation}) · ${p.areaBuilt} m² · ${p.bedrooms} hab.`
      );
    });

    return `${greeting}\n\n${customNote.trim()}\n\n${lines.join("\n\n")}${linkLine}`;
  }, [clientName, customNote, properties, generatedUrl]);

  if (!isOpen || properties.length === 0) return null;

  const cleanPhone = clientPhone.replace(/[^\d]/g, "");

  const createSelectionLink = async (): Promise<string | null> => {
    if (generatedUrl) return generatedUrl;
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/selections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: clientName.trim(),
          customNote: customNote.trim(),
          propertyIds: properties.map((p) => p.id),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.path) {
        setErrorMsg(
          data.error || "No se pudo generar el enlace en la base de datos."
        );
        return null;
      }

      const fullUrl = `${window.location.origin}${data.path}`;
      setGeneratedUrl(fullUrl);

      try {
        await navigator.clipboard.writeText(fullUrl);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 3000);
      } catch {
        // Clipboard permission might be blocked
      }

      return fullUrl;
    } catch {
      setErrorMsg("Error de conexión al guardar la selección.");
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    const url = await createSelectionLink();
    if (url) {
      try {
        await navigator.clipboard.writeText(url);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      } catch {
        // ignore
      }
    }
  };

  const handleOpenWhatsApp = async () => {
    const url = await createSelectionLink();
    const greeting = clientName.trim()
      ? `Hola ${clientName.trim()}, esta es tu selección de propiedades:`
      : "Hola, esta es tu selección de propiedades:";

    const linkLine = url
      ? `\n\n👉 *Ver selección completa con fotos y memoria:*\n${url}`
      : "";

    const lines = properties.map((p, idx) => {
      return (
        `*${idx + 1}. ${p.title}* (Ref. ${p.ref})\n` +
        `📍 ${p.neighborhood}, ${p.city}\n` +
        `💵 ${p.priceFormatted} (${p.operation}) · ${p.areaBuilt} m² · ${p.bedrooms} hab.`
      );
    });

    const finalMsg = `${greeting}\n\n${customNote.trim()}\n\n${lines.join("\n\n")}${linkLine}`;
    const whatsappUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(finalMsg)}`
      : `https://wa.me/?text=${encodeURIComponent(finalMsg)}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center bg-[#0B2545]/60 backdrop-blur-sm ${
        forceMobile ? "" : "sm:items-center sm:p-4"
      }`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Compartir selección por WhatsApp"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`flex max-h-[92%] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-[#DCE7F3] bg-white shadow-2xl ${
          forceMobile ? "" : "sm:rounded-3xl"
        }`}
      >
        {/* Mobile drag handle */}
        <div
          className={`flex justify-center bg-[#F4F8FC] pt-2.5 ${
            forceMobile ? "" : "sm:hidden"
          }`}
        >
          <div className="h-1 w-10 rounded-full bg-[#C5D8EE]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#DCE7F3] bg-[#F4F8FC] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1658B8] text-white">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#0B2545] sm:text-base">
                Enviar selección al cliente
              </h2>
              <p className="text-xs text-[#476484]">
                {properties.length}{" "}
                {properties.length === 1
                  ? "propiedad seleccionada"
                  : "propiedades seleccionadas"}{" "}
                · Genera enlace único
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-full border border-[#DCE7F3] bg-white p-2 text-[#0B2545] hover:bg-[#EBF3FB]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div
          className="flex-1 space-y-4 overflow-y-auto p-5"
          style={{ overscrollBehavior: "contain" }}
        >
          {/* Selected properties pills */}
          <div>
            <label className="text-xs font-semibold text-[#476484]">
              Propiedades incluidas
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {properties.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 rounded-xl border border-[#DCE7F3] bg-[#F4F8FC] py-1.5 pl-2 pr-2.5 text-xs"
                >
                  <img
                    src={p.photos[0]?.url}
                    alt={p.title}
                    className="h-7 w-7 rounded-lg object-cover"
                  />
                  <span className="max-w-[160px] truncate font-medium text-[#0B2545]">
                    {p.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveProperty(p.id)}
                    aria-label={`Quitar ${p.title}`}
                    className="text-[#476484] hover:text-[#1658B8]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Client fields */}
          <div className={`grid gap-3.5 ${forceMobile ? "" : "sm:grid-cols-2"}`}>
            <div>
              <label
                htmlFor="wa-client-name"
                className="block text-xs font-semibold text-[#0B2545]"
              >
                Nombre del cliente (para el saludo)
              </label>
              <input
                id="wa-client-name"
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ej. José"
                className="mt-1.5 w-full rounded-xl border border-[#DCE7F3] bg-[#F4F8FC] px-3.5 py-2.5 text-sm text-[#0B2545] placeholder:text-[#7E98B5] focus:border-[#1658B8] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="wa-client-phone"
                className="block text-xs font-semibold text-[#0B2545]"
              >
                WhatsApp del cliente (opcional)
              </label>
              <input
                id="wa-client-phone"
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="Ej. 584121234567"
                className="mt-1.5 w-full rounded-xl border border-[#DCE7F3] bg-[#F4F8FC] px-3.5 py-2.5 text-sm text-[#0B2545] placeholder:text-[#7E98B5] focus:border-[#1658B8] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Intro Note */}
          <div>
            <label
              htmlFor="wa-custom-note"
              className="block text-xs font-semibold text-[#0B2545]"
            >
              Nota personalizada
            </label>
            <textarea
              id="wa-custom-note"
              rows={2}
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#DCE7F3] bg-[#F4F8FC] px-3.5 py-2.5 text-sm text-[#0B2545] focus:border-[#1658B8] focus:bg-white focus:outline-none"
            />
          </div>

          {/* Generated Link Box */}
          {generatedUrl && (
            <div className="rounded-2xl border border-[#1658B8]/30 bg-[#EBF3FB] p-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1658B8]">
                  <Link2 className="h-3.5 w-3.5" />
                  {copiedLink
                    ? "¡Enlace copiado al portapapeles!"
                    : "Enlace listo para compartir"}
                </span>
                <a
                  href={generatedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#0B2545] underline"
                >
                  Abrir vista
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <p className="mt-1.5 break-all font-mono text-xs text-[#0B2545]">
                {generatedUrl}
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">
              {errorMsg}
            </div>
          )}

          {/* Preview */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#0B2545]">
                Vista previa del mensaje
              </span>
              <button
                type="button"
                onClick={handleCopyText}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1658B8] hover:underline"
              >
                {copiedText ? (
                  <>
                    <Check className="h-3 w-3" />
                    Texto copiado
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    Copiar texto
                  </>
                )}
              </button>
            </div>
            <pre className="mt-1.5 max-h-44 overflow-y-auto whitespace-pre-wrap rounded-2xl border border-[#DCE7F3] bg-[#F4F8FC] p-3.5 font-sans text-xs leading-relaxed text-[#0B2545]">
              {message}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-[#DCE7F3] bg-white px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3.5">
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleCopyLink}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#DCE7F3] bg-[#F4F8FC] px-3.5 py-2.5 text-xs font-semibold text-[#0B2545] transition-colors hover:border-[#1658B8] hover:bg-[#EBF3FB] disabled:opacity-50 sm:flex-none sm:text-sm"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin text-[#1658B8]" />
            ) : copiedLink ? (
              <Check className="h-4 w-4 text-[#1658B8]" />
            ) : (
              <Link2 className="h-4 w-4 text-[#1658B8]" />
            )}
            <span>{copiedLink ? "¡Enlace copiado!" : "Copiar enlace"}</span>
          </button>

          <button
            type="button"
            disabled={isGenerating}
            onClick={handleOpenWhatsApp}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1658B8] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#0F4494] disabled:opacity-50 sm:flex-none sm:text-sm"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Enviar por WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}
