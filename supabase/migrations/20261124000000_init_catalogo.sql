-- Tabla de propiedades del catálogo
create table if not exists public.properties (
  id text primary key,
  ref text not null,
  title text not null,
  subtitle text not null,
  operation text not null,
  category text not null,
  price integer not null,
  price_formatted text not null,
  city text not null,
  neighborhood text not null,
  address text not null,
  area_built integer not null,
  area_usable integer not null,
  terrace_area integer,
  bedrooms integer not null,
  bathrooms integer not null,
  floor text not null,
  orientation text not null,
  year_built integer not null,
  energy_rating text not null,
  garage_spaces integer not null,
  has_storage_room boolean not null default false,
  highlights jsonb not null default '[]'::jsonb,
  features jsonb not null default '[]'::jsonb,
  description text not null,
  memoria_calidades jsonb not null default '[]'::jsonb,
  photos jsonb not null default '[]'::jsonb,
  badge text,
  created_at timestamptz not null default now()
);

-- Tabla de selecciones personalizadas para clientes
create table if not exists public.client_selections (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  client_name text not null default '',
  custom_note text not null default '',
  property_ids text[] not null,
  created_at timestamptz not null default now()
);

-- Seguridad RLS
alter table public.properties enable row level security;
alter table public.client_selections enable row level security;

drop policy if exists "Lectura publica de propiedades" on public.properties;
create policy "Lectura publica de propiedades"
  on public.properties for select
  using (true);

drop policy if exists "Lectura publica de selecciones" on public.client_selections;
create policy "Lectura publica de selecciones"
  on public.client_selections for select
  using (true);
