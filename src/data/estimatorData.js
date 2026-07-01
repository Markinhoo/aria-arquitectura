export const estimateProfiles = {
  residencial: { label: 'Casa habitacion', low: 12500, high: 20500, note: 'Obra nueva con estructura, instalaciones y acabados habitacionales.' },
  remodelacion: { label: 'Remodelacion integral', low: 5200, high: 14500, note: 'Actualizacion de espacios existentes con demoliciones moderadas.' },
  banoCocina: { label: 'Bano o cocina', low: 9500, high: 22000, note: 'Zonas con instalaciones, recubrimientos, muebles y accesorios.' },
  comercial: { label: 'Local comercial', low: 11000, high: 19000, note: 'Adecuacion o construccion comercial con imagen, instalaciones y acabados.' },
  interiorismo: { label: 'Interiorismo', low: 3800, high: 11500, note: 'Acabados, iluminacion, mobiliario fijo y ambientacion interior.' }
};

export const finishLevels = {
  funcional: { label: 'Funcional', low: 0.88, high: 0.96 },
  medio: { label: 'Medio', low: 1, high: 1.08 },
  premium: { label: 'Premium', low: 1.18, high: 1.38 }
};

export const estimateBreakdown = [
  ['Materiales', 0.52],
  ['Mano de obra', 0.28],
  ['Instalaciones y equipo', 0.12],
  ['Imprevistos', 0.08]
];
