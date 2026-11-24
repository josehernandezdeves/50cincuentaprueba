import { createClient } from "@supabase/supabase-js";
import { Property } from "@/types/property";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export function getSupabasePublic() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase public environment variables.");
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });
}

export function getSupabaseAdmin() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase service role environment variables.");
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}

export interface DbPropertyRow {
  id: string;
  ref: string;
  title: string;
  subtitle: string;
  operation: "Venta" | "Alquiler";
  category: "Ático" | "Villa" | "Piso" | "Chalet" | "Loft";
  price: number;
  price_formatted: string;
  city: string;
  neighborhood: string;
  address: string;
  area_built: number;
  area_usable: number;
  terrace_area: number | null;
  bedrooms: number;
  bathrooms: number;
  floor: string;
  orientation: string;
  year_built: number;
  energy_rating: "A" | "B" | "C";
  garage_spaces: number;
  has_storage_room: boolean;
  highlights: string[];
  features: string[];
  description: string;
  memoria_calidades: { category: string; details: string[] }[];
  photos: { url: string; caption: string }[];
  badge: string | null;
}

export function mapDbRowToProperty(row: DbPropertyRow): Property {
  return {
    id: row.id,
    ref: row.ref,
    title: row.title,
    subtitle: row.subtitle,
    operation: row.operation,
    category: row.category,
    price: row.price,
    priceFormatted: row.price_formatted,
    city: row.city,
    neighborhood: row.neighborhood,
    address: row.address,
    areaBuilt: row.area_built,
    areaUsable: row.area_usable,
    terraceArea: row.terrace_area ?? undefined,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    floor: row.floor,
    orientation: row.orientation,
    yearBuilt: row.year_built,
    energyRating: row.energy_rating,
    garageSpaces: row.garage_spaces,
    hasStorageRoom: row.has_storage_room,
    highlights: row.highlights || [],
    features: row.features || [],
    description: row.description,
    memoriaCalidades: row.memoria_calidades || [],
    photos: row.photos || [],
    badge: row.badge ?? undefined,
  };
}
