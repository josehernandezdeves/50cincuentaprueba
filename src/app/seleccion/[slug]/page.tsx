import React, { Suspense } from "react";
import Link from "next/link";
import { PROPERTIES } from "@/data/properties";
import {
  getSupabasePublic,
  mapDbRowToProperty,
  DbPropertyRow,
} from "@/lib/supabase";
import { SelectionClientView } from "@/components/SelectionClientView";

async function SelectionLoader({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  try {
    const supabase = getSupabasePublic();
    const { data: selection, error } = await supabase
      .from("client_selections")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error || !selection) {
      return (
        <div className="flex min-h-dvh flex-col items-center justify-center bg-[#F4F8FC] p-6 text-center">
          <div className="max-w-md rounded-3xl border border-[#DCE7F3] bg-white p-8 shadow-sm">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0B2545] text-sm font-bold text-white">
              50
            </div>
            <h1 className="mt-4 text-xl font-bold text-[#0B2545]">
              Selección no encontrada
            </h1>
            <p className="mt-2 text-sm text-[#476484]">
              El enlace que abriste no existe o ha expirado. Puedes explorar todo el catálogo de propiedades disponibles.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[#1658B8] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0F4494]"
            >
              Ir a 50cincuenta catálogo
            </Link>
          </div>
        </div>
      );
    }

    const ids: string[] = Array.isArray(selection.property_ids)
      ? selection.property_ids
      : [];

    const { data: dbProps } = await supabase
      .from("properties")
      .select("*")
      .in("id", ids);

    const resolvedProperties =
      dbProps && dbProps.length > 0
        ? (dbProps as DbPropertyRow[]).map(mapDbRowToProperty)
        : PROPERTIES.filter((p) => ids.includes(p.id));

    return (
      <SelectionClientView
        clientName={selection.client_name || ""}
        customNote={selection.custom_note || ""}
        properties={resolvedProperties}
      />
    );
  } catch {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-[#F4F8FC] p-6 text-center">
        <div className="max-w-md rounded-3xl border border-[#DCE7F3] bg-white p-8 shadow-sm">
          <h1 className="text-xl font-bold text-[#0B2545]">
            No pudimos cargar esta selección
          </h1>
          <p className="mt-2 text-sm text-[#476484]">
            Verifica la conexión con la base de datos o vuelve al catálogo principal.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[#1658B8] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Ir al catálogo
          </Link>
        </div>
      </div>
    );
  }
}

export default function SelectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-[#F4F8FC] p-6">
          <div className="rounded-2xl border border-[#DCE7F3] bg-white px-6 py-4 text-sm font-semibold text-[#0B2545] shadow-sm">
            Cargando selección personalizada...
          </div>
        </div>
      }
    >
      <SelectionLoader params={params} />
    </Suspense>
  );
}
