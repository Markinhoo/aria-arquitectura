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
3. Copia `.env.example` a `.env` y agrega:

```bash
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
```

La tabla `aria_contactos` acepta inserciones anonimas para el formulario publico y mantiene RLS activo.

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
