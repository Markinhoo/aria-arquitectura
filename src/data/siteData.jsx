import { FaBuilding, FaLayerGroup, FaRulerCombined } from 'react-icons/fa6';

export const proyectosBase = [
  {
    id: 'casa-lumbre',
    nombre: 'Casa Lumbre',
    tipo: 'Residencial',
    lugar: 'Durango, MX',
    descripcion: 'Volumenes limpios, patio central y materiales de bajo mantenimiento.',
    imagen_url: '',
    imagenes_urls: [],
    color: 'proyecto-terracota'
  },
  {
    id: 'estudio-norte',
    nombre: 'Estudio Norte',
    tipo: 'Comercial',
    lugar: 'Torreon, MX',
    descripcion: 'Espacio flexible para atencion, exhibicion y trabajo colaborativo.',
    imagen_url: '',
    imagenes_urls: [],
    color: 'proyecto-oliva'
  },
  {
    id: 'interior-altura',
    nombre: 'Interior Altura',
    tipo: 'Interiorismo',
    lugar: 'Monterrey, MX',
    descripcion: 'Iluminacion indirecta, carpinteria a medida y atmosfera serena.',
    imagen_url: '',
    imagenes_urls: [],
    color: 'proyecto-carbon'
  }
];

export const servicios = [
  {
    icono: <FaRulerCombined />,
    titulo: 'Proyecto arquitectonico',
    texto: 'Anteproyecto, planos ejecutivos, criterio estructural y coordinacion tecnica.'
  },
  {
    icono: <FaLayerGroup />,
    titulo: 'Interiorismo',
    texto: 'Distribucion, acabados, mobiliario fijo, iluminacion y seleccion de materiales.'
  },
  {
    icono: <FaBuilding />,
    titulo: 'Gestion de obra',
    texto: 'Presupuestos, proveedores, seguimiento de avances y control de calidad.'
  }
];

export const pilaresAria = [
  {
    titulo: 'Arquitectura',
    texto: 'La arquitectura es el punto de partida. Cada proyecto nace de una idea que busca transformar el espacio en una experiencia funcional, estética y duradera.'
  },
  {
    titulo: 'Responsabilidad',
    texto: 'Entendemos que cada obra representa una inversión, un compromiso y un impacto en el entorno. Por ello actuamos con profesionalismo, ética y compromiso en cada etapa del proyecto.'
  },
  {
    titulo: 'Innovación',
    texto: 'Incorporamos nuevas tecnologías, metodologías y tendencias de diseño para ofrecer soluciones eficientes, sostenibles y adaptadas a las necesidades de cada cliente.'
  },
  {
    titulo: 'Armonía',
    texto: 'Creemos que un buen diseño surge del equilibrio entre la funcionalidad, la estética, el contexto y las personas que habitarán el espacio.'
  }
];

export const filosofiaAria = [
  {
    titulo: 'Mision',
    texto: 'Disenar y desarrollar proyectos arquitectonicos que integren funcionalidad, estetica e innovacion, generando espacios de alto valor para nuestros clientes mediante un servicio profesional, responsable y personalizado.'
  },
  {
    titulo: 'Vision',
    texto: 'Consolidarnos como un despacho de arquitectura reconocido por la calidad de sus proyectos, la innovacion en sus procesos y el compromiso con el desarrollo de espacios sostenibles que mejoren la calidad de vida de las personas.'
  }
];

export const initialForm = {
  nombre: '',
  email: '',
  telefono: '',
  tipo_proyecto: 'Residencial',
  mensaje: ''
};

export const publicPages = ['inicio', 'proyectos', 'cotizador', 'contacto'];
