import { AIMatch, AISearchResponse, OperationType, Property, PropertyCategory } from "@/types/property";

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function parseMaxPrice(q: string): number | null {
  // Match patterns like "900.000", "900000", "900k", "1.5 millones", "3500 €/mes", "hasta 3000"
  const millionMatch = q.match(/(\d+(?:[.,]\d+)?)\s*millon(?:es)?/);
  if (millionMatch) {
    return Math.round(parseFloat(millionMatch[1].replace(",", ".")) * 1_000_000);
  }

  const kMatch = q.match(/(\d+(?:[.,]\d+)?)\s*k\b/);
  if (kMatch) {
    return Math.round(parseFloat(kMatch[1].replace(",", ".")) * 1_000);
  }

  const milMatch = q.match(/(\d+(?:[.,]\d+)?)\s*mil\b/);
  if (milMatch) {
    return Math.round(parseFloat(milMatch[1].replace(",", ".")) * 1_000);
  }

  const numMatch = q.match(/(?:hasta|menos de|maximo|max|presupuesto|de)\s*(\d[\d.]*)/);
  if (numMatch) {
    const clean = parseInt(numMatch[1].replace(/\./g, ""), 10);
    if (!Number.isNaN(clean) && clean > 100) return clean;
  }

  const euroMatch = q.match(/(\d[\d.]*)\s*(?:\$|usd|dolares|€|eur|euros)/);
  if (euroMatch) {
    const clean = parseInt(euroMatch[1].replace(/\./g, ""), 10);
    if (!Number.isNaN(clean) && clean > 100) return clean;
  }

  const dollarPrefixMatch = q.match(/\$\s*(\d[\d.]*)/);
  if (dollarPrefixMatch) {
    const clean = parseInt(dollarPrefixMatch[1].replace(/\./g, ""), 10);
    if (!Number.isNaN(clean) && clean > 100) return clean;
  }

  return null;
}

function parseMinBedrooms(q: string): number | null {
  const match = q.match(/(\d+)\s*(?:o mas\s*)?(?:hab|habitacion|habitaciones|dormitorio|dormitorios|cuartos)/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return null;
}

export function runSimulatedAISearch(query: string, properties: Property[]): AISearchResponse {
  const q = normalize(query.trim());
  const interpretedCriteria: string[] = [];

  // 1. Operation
  let desiredOp: OperationType | null = null;
  if (/\b(alquiler|alquilar|renta|arrendar|mes)\b/.test(q)) {
    desiredOp = "Alquiler";
    interpretedCriteria.push("Operación: Alquiler");
  } else if (/\b(compra|comprar|venta|invertir|inversion)\b/.test(q)) {
    desiredOp = "Venta";
    interpretedCriteria.push("Operación: Venta");
  }

  // 2. Category
  const categories: { pattern: RegExp; value: PropertyCategory }[] = [
    { pattern: /\batico(s)?\b/, value: "Ático" },
    { pattern: /\bvilla(s)?\b/, value: "Villa" },
    { pattern: /\bpiso(s)?|apartamento(s)?\b/, value: "Piso" },
    { pattern: /\bchalet(s)?|casa(s)?\b/, value: "Chalet" },
    { pattern: /\bloft(s)?|estudio(s)?\b/, value: "Loft" },
  ];
  const desiredCategories = categories
    .filter((c) => c.pattern.test(q))
    .map((c) => c.value);

  if (desiredCategories.length > 0) {
    interpretedCriteria.push(`Tipología: ${desiredCategories.join(" o ")}`);
  }

  // 3. Cities / Zones in Isla de Margarita
  const cities = [
    { key: "pampatar", label: "Pampatar" },
    { key: "playa el angel", label: "Pampatar" },
    { key: "costa azul", label: "Pampatar" },
    { key: "porlamar", label: "Porlamar" },
    { key: "playa moreno", label: "Porlamar" },
    { key: "bella vista", label: "Porlamar" },
    { key: "la asuncion", label: "La Asunción" },
    { key: "guacuco", label: "La Asunción" },
    { key: "maneiro", label: "Maneiro" },
    { key: "jorge coll", label: "Maneiro" },
    { key: "el yaque", label: "El Yaque" },
    { key: "juan griego", label: "Juan Griego" },
    { key: "playa el agua", label: "Playa El Agua" },
  ];
  const desiredCities = Array.from(
    new Set(cities.filter((c) => q.includes(c.key)).map((c) => c.label))
  );
  if (desiredCities.length > 0) {
    interpretedCriteria.push(`Ubicación: ${desiredCities.join(", ")}`);
  }

  // 4. Budget
  const maxPrice = parseMaxPrice(q);
  if (maxPrice !== null) {
    interpretedCriteria.push(
      `Presupuesto ≤ $${maxPrice.toLocaleString("es-ES")}`
    );
  }

  // 5. Bedrooms
  const minBedrooms = parseMinBedrooms(q);
  if (minBedrooms !== null) {
    interpretedCriteria.push(`Dormitorios: ${minBedrooms}+`);
  }

  // 6. Features & lifestyle keywords
  const featureMatchers: { pattern: RegExp; feature: string; label: string }[] = [
    { pattern: /terraza|solarium|balcon|patio/, feature: "Terraza", label: "Terraza / exterior" },
    { pattern: /piscina|alberca/, feature: "Piscina", label: "Piscina" },
    { pattern: /mar|playa|bahia|puerto|costa|oceano/, feature: "Vistas al mar", label: "Vistas al mar / costa" },
    { pattern: /garaje|parking|coche|aparcamiento/, feature: "Garaje", label: "Plaza de garaje" },
    { pattern: /jardin|parcela|arbolada|verde/, feature: "Jardín", label: "Jardín privado" },
    { pattern: /domotica|inteligente|smart/, feature: "Domótica", label: "Domótica" },
    { pattern: /aerotermia|eficiente|sostenible|solar/, feature: "Aerotermia", label: "Alta eficiencia energética" },
    { pattern: /centro|urbano|salamanca|eixample/, feature: "Centro ciudad", label: "Ubicación céntrica" },
  ];

  const desiredFeatures = featureMatchers.filter((f) => f.pattern.test(q));
  desiredFeatures.forEach((f) => interpretedCriteria.push(f.label));

  const wantsBright = /luminos|luz|sol\b|soleado/.test(q);
  if (wantsBright) interpretedCriteria.push("Alta luminosidad");

  const wantsNew = /obra nueva|estrenar|moderno|contemporane/.test(q);
  if (wantsNew) interpretedCriteria.push("Estilo contemporáneo / reciente");

  // Score every property
  const matches: AIMatch[] = properties
    .map((prop) => {
      let score = 52; // base semantic score
      const reasons: string[] = [];

      // Hard / strong filter penalties
      if (desiredOp) {
        if (prop.operation === desiredOp) {
          score += 18;
          reasons.push(`Disponible en ${prop.operation.toLowerCase()}`);
        } else {
          score -= 45;
        }
      }

      if (desiredCategories.length > 0) {
        if (desiredCategories.includes(prop.category)) {
          score += 16;
          reasons.push(`Encaja como ${prop.category.toLowerCase()}`);
        } else if (
          (desiredCategories.includes("Chalet") && prop.category === "Villa") ||
          (desiredCategories.includes("Villa") && prop.category === "Chalet")
        ) {
          score += 10;
          reasons.push(`Tipología afín (${prop.category})`);
        } else {
          score -= 22;
        }
      }

      if (desiredCities.length > 0) {
        if (desiredCities.includes(prop.city)) {
          score += 18;
          reasons.push(`Ubicada en ${prop.city} (${prop.neighborhood})`);
        } else {
          score -= 30;
        }
      }

      if (maxPrice !== null) {
        if (prop.price <= maxPrice) {
          score += 14;
          reasons.push(`Dentro de presupuesto (${prop.priceFormatted})`);
        } else if (prop.price <= maxPrice * 1.15) {
          score -= 8;
        } else {
          score -= 35;
        }
      }

      if (minBedrooms !== null) {
        if (prop.bedrooms >= minBedrooms) {
          score += 10;
          reasons.push(`${prop.bedrooms} dormitorios`);
        } else {
          score -= 25;
        }
      }

      desiredFeatures.forEach((df) => {
        const hasIt = prop.features.some(
          (pf) => normalize(pf) === normalize(df.feature)
        );
        if (hasIt) {
          score += 9;
          reasons.push(`Incluye ${df.feature.toLowerCase()}`);
        } else {
          score -= 10;
        }
      });

      if (wantsBright && (prop.orientation.includes("Sur") || prop.highlights.some((h) => normalize(h).includes("luminos")))) {
        score += 6;
        reasons.push(`Orientación ${prop.orientation}`);
      }

      if (wantsNew && prop.yearBuilt >= 2021) {
        score += 6;
        reasons.push(`Construcción reciente (${prop.yearBuilt})`);
      }

      // Direct keyword fallback in title/description
      const fullBlob = normalize(
        `${prop.title} ${prop.subtitle} ${prop.description} ${prop.city} ${prop.neighborhood} ${prop.features.join(" ")}`
      );
      const tokens = q.split(/\s+/).filter((t) => t.length > 3);
      let keywordHits = 0;
      tokens.forEach((tok) => {
        if (fullBlob.includes(tok)) keywordHits++;
      });
      score += Math.min(12, keywordHits * 3);

      const clampedScore = Math.max(15, Math.min(99, Math.round(score)));
      const uniqueReasons = Array.from(new Set(reasons)).slice(0, 3);
      if (uniqueReasons.length === 0) {
        uniqueReasons.push(`${prop.areaBuilt} m² · ${prop.city}`);
      }

      return {
        property: prop,
        score: clampedScore,
        reasons: uniqueReasons,
      };
    })
    .filter((m) => m.score >= 58)
    .sort((a, b) => b.score - a.score);

  const summary =
    matches.length > 0
      ? `He encontrado ${matches.length} ${matches.length === 1 ? "propiedad que encaja" : "propiedades que encajan"} con tu búsqueda natural.`
      : "No encontré coincidencias exactas para todos esos requisitos simultáneos. Prueba ampliando el presupuesto o la ciudad.";

  if (interpretedCriteria.length === 0) {
    interpretedCriteria.push("Búsqueda semántica general");
  }

  return {
    interpretedCriteria,
    summary,
    matches,
  };
}
