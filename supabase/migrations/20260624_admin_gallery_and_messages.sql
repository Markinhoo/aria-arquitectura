create table if not exists public.aria_proyectos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  tipo text not null,
  lugar text not null,
  descripcion text not null,
  imagen_url text not null,
  storage_path text not null,
  publicado boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.aria_proyectos enable row level security;

drop policy if exists "Visitantes pueden ver proyectos publicados" on public.aria_proyectos;
create policy "Visitantes pueden ver proyectos publicados"
on public.aria_proyectos
for select
to anon
using (publicado = true);

drop policy if exists "Admins autenticados pueden ver proyectos" on public.aria_proyectos;
create policy "Admins autenticados pueden ver proyectos"
on public.aria_proyectos
for select
to authenticated
using (true);

drop policy if exists "Admins autenticados pueden crear proyectos" on public.aria_proyectos;
create policy "Admins autenticados pueden crear proyectos"
on public.aria_proyectos
for insert
to authenticated
with check (
  length(trim(nombre)) >= 2
  and length(trim(lugar)) >= 2
  and length(trim(descripcion)) >= 10
  and tipo in ('Residencial', 'Comercial', 'Interiorismo', 'Remodelacion')
);

drop policy if exists "Admins autenticados pueden editar proyectos" on public.aria_proyectos;
create policy "Admins autenticados pueden editar proyectos"
on public.aria_proyectos
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Admins autenticados pueden eliminar proyectos" on public.aria_proyectos;
create policy "Admins autenticados pueden eliminar proyectos"
on public.aria_proyectos
for delete
to authenticated
using (true);

drop policy if exists "Admins autenticados pueden leer contactos" on public.aria_contactos;
create policy "Admins autenticados pueden leer contactos"
on public.aria_contactos
for select
to authenticated
using (true);

insert into storage.buckets (id, name, public)
values ('aria-proyectos', 'aria-proyectos', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Visitantes pueden ver fotos de proyectos Aria" on storage.objects;
create policy "Visitantes pueden ver fotos de proyectos Aria"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'aria-proyectos');

drop policy if exists "Admins autenticados pueden subir fotos de proyectos Aria" on storage.objects;
create policy "Admins autenticados pueden subir fotos de proyectos Aria"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'aria-proyectos');

drop policy if exists "Admins autenticados pueden actualizar fotos de proyectos Aria" on storage.objects;
create policy "Admins autenticados pueden actualizar fotos de proyectos Aria"
on storage.objects
for update
to authenticated
using (bucket_id = 'aria-proyectos')
with check (bucket_id = 'aria-proyectos');

drop policy if exists "Admins autenticados pueden eliminar fotos de proyectos Aria" on storage.objects;
create policy "Admins autenticados pueden eliminar fotos de proyectos Aria"
on storage.objects
for delete
to authenticated
using (bucket_id = 'aria-proyectos');

create index if not exists aria_proyectos_created_at_idx
on public.aria_proyectos (created_at desc);
