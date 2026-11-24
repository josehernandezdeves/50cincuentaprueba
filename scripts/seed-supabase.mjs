import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

// Load .env.local manually for standalone script execution
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim();
    }
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Faltan variables NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

// Read properties from src/data/properties.ts via dynamic import isn't needed if we keep JSON/TS,
// so let's import via tsx or simple API call. Actually we can hit /api or read JSON.
console.log("Conectando a:", url);
const { error: checkErr } = await supabase.from("properties").select("id").limit(1);
if (checkErr) {
  console.error("La tabla 'properties' aún no existe o no es accesible:", checkErr.message);
  process.exit(2);
}
console.log("Tabla 'properties' accesible correctamente.");
