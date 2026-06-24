create table if not exists public.aria_contactos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  email text not null,
  telefono text,
  tipo_proyecto text not null,
  mensaje text not null,
  estado text not null default 'nuevo',
  created_at timestamptz not null default now()
);

alter table public.aria_contactos enable row level security;

drop policy if exists "Cualquier visitante puede crear contactos de Aria" on public.aria_contactos;
create policy "Cualquier visitante puede crear contactos de Aria"
on public.aria_contactos
for insert
to anon
with check (
  length(trim(nombre)) >= 2
  and email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  and length(trim(mensaje)) >= 10
  and tipo_proyecto in ('Residencial', 'Comercial', 'Interiorismo', 'Remodelacion')
);

create index if not exists aria_contactos_created_at_idx
on public.aria_contactos (created_at desc);
