import { NextResponse } from "next/server";
import { PROPERTIES } from "@/data/properties";
import {
  getSupabaseAdmin,
  getSupabasePublic,
  mapDbRowToProperty,
  DbPropertyRow,
} from "@/lib/supabase";

function mapPropertyToDbRow(p: (typeof PROPERTIES)[number]): DbPropertyRow {
  return {
    id: p.id,
    ref: p.ref,
    title: p.title,
    subtitle: p.subtitle,
    operation: p.operation,
    category: p.category,
    price: p.price,
    price_formatted: p.priceFormatted,
    city: p.city,
    neighborhood: p.neighborhood,
    address: p.address,
    area_built: p.areaBuilt,
    area_usable: p.areaUsable,
    terrace_area: p.terraceArea ?? null,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    floor: p.floor,
    orientation: p.orientation,
    year_built: p.yearBuilt,
    energy_rating: p.energyRating,
    garage_spaces: p.garageSpaces,
    has_storage_room: p.hasStorageRoom,
    highlights: p.highlights,
    features: p.features,
    description: p.description,
    memoria_calidades: p.memoriaCalidades,
    photos: p.photos,
    badge: p.badge ?? null,
  };
}

export async function GET() {
  try {
    const supabase = getSupabasePublic();
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .order("ref", { ascending: true });

    if (error) {
      return NextResponse.json({
        source: "fallback",
        properties: PROPERTIES,
      });
    }

    // Auto-seed if table exists and is empty
    if (!data || data.length === 0) {
      try {
        const admin = getSupabaseAdmin();
        const rows = PROPERTIES.map(mapPropertyToDbRow);
        const { error: upsertErr } = await admin
          .from("properties")
          .upsert(rows, { onConflict: "id" });

        if (!upsertErr) {
          return NextResponse.json({
            source: "supabase-seeded",
            properties: PROPERTIES,
          });
        }
      } catch {
        // Fallback silently if service role fails
      }

      return NextResponse.json({
        source: "fallback",
        properties: PROPERTIES,
      });
    }

    return NextResponse.json({
      source: "supabase",
      properties: (data as DbPropertyRow[]).map(mapDbRowToProperty),
    });
  } catch {
    return NextResponse.json({
      source: "fallback",
      properties: PROPERTIES,
    });
  }
}
