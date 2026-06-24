# Aria Arquitectura

Aplicacion web para un estudio de arquitectura, hecha con Vite, React y Supabase.

## Desarrollo local

```bash
cd aria-arquitectura
npm install
npm run dev
```

## Supabase

1. Crea un proyecto en Supabase.
2. Ejecuta la migracion de `supabase/migrations/20260624_create_aria_contactos.sql`.
3. Ejecuta la migracion de `supabase/migrations/20260624_admin_gallery_and_messages.sql`.
4. Ejecuta la migracion de `supabase/migrations/20260624_multiple_project_images.sql`.
5. En Authentication crea un usuario administrador con correo y contraseña.
6. Copia `.env.example` a `.env` y agrega:

```bash
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
```

La tabla `aria_contactos` acepta inserciones anonimas para el formulario publico y mantiene RLS activo.
La tabla `aria_proyectos` y el bucket `aria-proyectos` permiten que el publico vea proyectos publicados y que usuarios autenticados suban una o varias fotos por proyecto desde `/admin`.

## Vercel

1. Sube el repo a GitHub.
2. En Vercel importa el proyecto y selecciona `aria-arquitectura` como Root Directory.
3. Agrega las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
4. Build command: `npm run build`.
5. Output directory: `dist`.

## Personalizacion rapida

- Cambia telefono y WhatsApp en `src/App.jsx`.
- Cambia correo e Instagram en `src/App.jsx`.
- Reemplaza la imagen hero en `public/aria-hero.png`.
- Entra a `/admin` para subir proyectos y revisar mensajes de contacto.
