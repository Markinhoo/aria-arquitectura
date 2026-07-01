export function getProjectImages(proyecto) {
  const images = Array.isArray(proyecto.imagenes_urls) && proyecto.imagenes_urls.length
    ? proyecto.imagenes_urls
    : proyecto.imagen_url
      ? [proyecto.imagen_url]
      : [];

  if (proyecto.id === '04416a62-2351-4362-b0a4-b6e998d878c0' && images.length > 1) {
    return [
      images[0],
      '/projects/remodelacion-bano-despues.jpeg',
      ...images.slice(2)
    ];
  }

  return images;
}

export function getProjectAdminImages(proyecto) {
  if (Array.isArray(proyecto.imagenes_urls) && proyecto.imagenes_urls.length) {
    return proyecto.imagenes_urls;
  }

  return proyecto.imagen_url ? [proyecto.imagen_url] : [];
}

export function getPhotoLabel(index) {
  if (index === 0) return 'Antes';
  if (index === 1) return 'Despues';
  return `Detalle ${index + 1}`;
}
