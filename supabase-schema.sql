-- Esquema de base de datos para Battery Analyzer con Supabase
-- Copia y ejecuta este SQL en el SQL Editor de Supabase

-- 1) Extensiones útiles
create extension if not exists "uuid-ossp";

-- 2) Tabla de perfiles (1:1 con auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  display_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3) Tabla de reportes (battery reports)
create table if not exists public.reports (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  payload jsonb not null,      -- snapshot del reporte (resultado parseado)
  source text,                 -- origen: imazing, 3utools, manual
  device_model text,
  quality_class text,          -- OEM_ORIGINAL | OEM_SERVICE_GOOD | AFTERMARKET_FAKE | UNKNOWN
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  local_rev text               -- hash o monotonic local para reconciliar
);

-- 4) Tabla de brand mapping (opcional, compartida por usuario)
create table if not exists public.brand_map (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  brand text not null,
  quality_class text not null,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, brand)
);

-- 5) Triggers updated_at
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end; $$ language plpgsql;

create trigger trg_reports_updated_at
before update on public.reports
for each row execute function set_updated_at();

create trigger trg_brand_map_updated_at
before update on public.brand_map
for each row execute function set_updated_at();

-- 6) RLS
alter table public.profiles enable row level security;
alter table public.reports  enable row level security;
alter table public.brand_map enable row level security;

-- 7) Políticas RLS
create policy "profiles self" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles self upsert" on public.profiles
  for insert with check (true);
create policy "profiles self update" on public.profiles
  for update using (auth.uid() = id);

create policy "reports owner read" on public.reports
  for select using (auth.uid() = user_id);
create policy "reports owner write" on public.reports
  for insert with check (auth.uid() = user_id);
create policy "reports owner update" on public.reports
  for update using (auth.uid() = user_id);
create policy "reports owner delete" on public.reports
  for delete using (auth.uid() = user_id);

create policy "brand map owner read" on public.brand_map
  for select using (auth.uid() = user_id);
create policy "brand map owner write" on public.brand_map
  for insert with check (auth.uid() = user_id);
create policy "brand map owner update" on public.brand_map
  for update using (auth.uid() = user_id);
create policy "brand map owner delete" on public.brand_map
  for delete using (auth.uid() = user_id);
