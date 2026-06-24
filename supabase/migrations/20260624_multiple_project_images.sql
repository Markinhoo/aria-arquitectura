alter table public.aria_proyectos
add column if not exists imagenes_urls text[] not null default '{}',
add column if not exists storage_paths text[] not null default '{}';

update public.aria_proyectos
set
  imagenes_urls = array[imagen_url],
  storage_paths = array[storage_path]
where
  cardinality(imagenes_urls) = 0
  and imagen_url is not null
  and storage_path is not null;
