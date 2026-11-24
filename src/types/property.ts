export type OperationType = "Venta" | "Alquiler";

export type PropertyCategory =
  | "Ático"
  | "Villa"
  | "Piso"
  | "Chalet"
  | "Loft";

export interface PropertyPhoto {
  url: string;
  caption: string;
}

export interface QualitySpecSection {
  category: string;
  details: string[];
}

export interface Property {
  id: string;
  ref: string;
  title: string;
  subtitle: string;
  operation: OperationType;
  category: PropertyCategory;
  price: number;
  priceFormatted: string;
  city: string;
  neighborhood: string;
  address: string;
  areaBuilt: number;
  areaUsable: number;
  terraceArea?: number;
  bedrooms: number;
  bathrooms: number;
  floor: string;
  orientation: string;
  yearBuilt: number;
  energyRating: "A" | "B" | "C";
  garageSpaces: number;
  hasStorageRoom: boolean;
  highlights: string[];
  features: string[];
  description: string;
  memoriaCalidades: QualitySpecSection[];
  photos: PropertyPhoto[];
  badge?: string;
}

export interface FilterState {
  query: string;
  operation: "Todas" | OperationType;
  category: "Todas" | PropertyCategory;
  maxPrice: number | null;
  minBedrooms: number;
  requiredFeatures: string[];
}

export interface AIMatch {
  property: Property;
  score: number;
  reasons: string[];
}

export interface AISearchResponse {
  interpretedCriteria: string[];
  summary: string;
  matches: AIMatch[];
}
