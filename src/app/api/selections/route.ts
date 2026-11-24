import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

function generateSlug(length = 7): string {
  const chars = "abcdefghijkmnpqrstuvwxyz23456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const clientName =
      typeof body.clientName === "string" ? body.clientName.trim() : "";
    const customNote =
      typeof body.customNote === "string" ? body.customNote.trim() : "";
    const propertyIds = Array.isArray(body.propertyIds)
      ? body.propertyIds.filter((id: unknown) => typeof id === "string")
      : [];

    if (propertyIds.length === 0) {
      return NextResponse.json(
        { error: "Debes seleccionar al menos una propiedad." },
        { status: 400 }
      );
    }

    const slug = generateSlug(7);
    const supabase = getSupabaseAdmin();

    const { error } = await supabase.from("client_selections").insert({
      slug,
      client_name: clientName,
      custom_note: customNote,
      property_ids: propertyIds,
    });

    if (error) {
      return NextResponse.json(
        {
          error:
            "No se pudo guardar en Supabase. Verifica que la tabla client_selections exista.",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      slug,
      path: `/seleccion/${slug}`,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Error inesperado al crear la selección.",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
