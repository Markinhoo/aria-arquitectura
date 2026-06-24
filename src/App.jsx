import { useMemo, useState } from 'react';
import {
  FaArrowRight,
  FaBuilding,
  FaCheck,
  FaEnvelope,
  FaInstagram,
  FaLayerGroup,
  FaLocationDot,
  FaPhone,
  FaRulerCombined,
  FaWhatsapp
} from 'react-icons/fa6';
import { supabase, supabaseReady } from './lib/supabaseClient';

const proyectos = [
  {
    nombre: 'Casa Lumbre',
    tipo: 'Residencial',
    lugar: 'Durango, MX',
    descripcion: 'Volumenes limpios, patio central y materiales de bajo mantenimiento.',
    color: 'proyecto-terracota'
  },
  {
    nombre: 'Estudio Norte',
    tipo: 'Comercial',
    lugar: 'Torreon, MX',
    descripcion: 'Espacio flexible para atencion, exhibicion y trabajo colaborativo.',
    color: 'proyecto-oliva'
  },
  {
    nombre: 'Interior Altura',
    tipo: 'Interiorismo',
    lugar: 'Monterrey, MX',
    descripcion: 'Iluminacion indirecta, carpinteria a medida y atmosfera serena.',
    color: 'proyecto-carbon'
  }
];

const servicios = [
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

const etapas = ['Escucha', 'Concepto', 'Proyecto', 'Obra'];

const initialForm = {
  nombre: '',
  email: '',
  telefono: '',
  tipo_proyecto: 'Residencial',
  mensaje: ''
};

function App() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [sending, setSending] = useState(false);

  const whatsappUrl = useMemo(() => {
    const text = `Hola Aria Arquitectura, me gustaria platicar sobre un proyecto ${form.tipo_proyecto.toLowerCase()}.`;
    return `https://wa.me/520000000000?text=${encodeURIComponent(text)}`;
  }, [form.tipo_proyecto]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSending(true);
    setStatus({ type: 'idle', message: '' });

    if (!supabaseReady) {
      setSending(false);
      setStatus({
        type: 'info',
        message: 'El formulario esta listo. Agrega tus variables de Supabase en Vercel para activar los envios.'
      });
      return;
    }

    const { error } = await supabase.from('aria_contactos').insert({
      nombre: form.nombre.trim(),
      email: form.email.trim(),
      telefono: form.telefono.trim(),
      tipo_proyecto: form.tipo_proyecto,
      mensaje: form.mensaje.trim()
    });

    setSending(false);

    if (error) {
      setStatus({
        type: 'error',
        message: 'No se pudo enviar tu mensaje. Intentalo de nuevo o escribe por WhatsApp.'
      });
      return;
    }

    setForm(initialForm);
    setStatus({
      type: 'success',
      message: 'Gracias. Recibimos tu mensaje y te contactaremos pronto.'
    });
  };

  return (
    <div className="site-shell">
      <header className="topbar">
        <a className="brand" href="#inicio" aria-label="Aria Arquitectura inicio">
          <span className="brand-mark">A</span>
          <span>
            <strong>Aria Arquitectura</strong>
            <small>Arquitectura + interiorismo</small>
          </span>
        </a>

        <nav className="nav-links" aria-label="Navegacion principal">
          <a href="#proyectos">Proyectos</a>
          <a href="#servicios">Servicios</a>
          <a href="#contacto">Contacto</a>
        </nav>
      </header>

      <main>
        <section id="inicio" className="hero">
          <div className="hero-media" aria-hidden="true">
            <img src="/aria-hero.png" alt="" />
          </div>

          <div className="hero-content">
            <p className="eyebrow">Estudio de arquitectura en Mexico</p>
            <h1>Aria Arquitectura</h1>
            <p className="hero-copy">
              Diseñamos espacios habitables, sobrios y luminosos, con una ejecucion clara desde la primera idea hasta la obra.
            </p>

            <div className="hero-actions">
              <a className="button primary" href="#contacto">
                Iniciar proyecto <FaArrowRight aria-hidden="true" />
              </a>
              <a className="button ghost" href={whatsappUrl} target="_blank" rel="noreferrer">
                <FaWhatsapp aria-hidden="true" /> WhatsApp
              </a>
            </div>
          </div>
        </section>

        <section className="metrics" aria-label="Indicadores del estudio">
          <article>
            <strong>12+</strong>
            <span>Años de experiencia</span>
          </article>
          <article>
            <strong>48</strong>
            <span>Proyectos desarrollados</span>
          </article>
          <article>
            <strong>3</strong>
            <span>Lineas de servicio</span>
          </article>
        </section>

        <section id="proyectos" className="section projects-section">
          <div className="section-heading">
            <p className="eyebrow">Portafolio</p>
            <h2>Espacios con calma, proporcion y caracter.</h2>
          </div>

          <div className="project-grid">
            {proyectos.map((proyecto) => (
              <article className={`project-card ${proyecto.color}`} key={proyecto.nombre}>
                <div className="project-visual">
                  <span>{proyecto.tipo}</span>
                </div>
                <div className="project-body">
                  <p>{proyecto.lugar}</p>
                  <h3>{proyecto.nombre}</h3>
                  <span>{proyecto.descripcion}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="servicios" className="section services-section">
          <div className="section-heading">
            <p className="eyebrow">Servicios</p>
            <h2>Del trazo inicial al espacio terminado.</h2>
          </div>

          <div className="service-grid">
            {servicios.map((servicio) => (
              <article className="service-card" key={servicio.titulo}>
                <div className="service-icon">{servicio.icono}</div>
                <h3>{servicio.titulo}</h3>
                <p>{servicio.texto}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="process-band">
          <div>
            <p className="eyebrow">Proceso</p>
            <h2>Una ruta ordenada para decidir mejor.</h2>
          </div>
          <ol className="process-list">
            {etapas.map((etapa, index) => (
              <li key={etapa}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{etapa}</strong>
              </li>
            ))}
          </ol>
        </section>

        <section id="contacto" className="section contact-section">
          <div className="contact-copy">
            <p className="eyebrow">Contacto</p>
            <h2>Cuéntanos que quieres construir.</h2>
            <p>
              Agenda una primera conversacion para revisar alcance, ubicacion, presupuesto y tiempos del proyecto.
            </p>

            <div className="contact-methods">
              <a href="mailto:hola@ariaarquitectura.mx">
                <FaEnvelope aria-hidden="true" /> hola@ariaarquitectura.mx
              </a>
              <a href="tel:+520000000000">
                <FaPhone aria-hidden="true" /> +52 000 000 0000
              </a>
              <span>
                <FaLocationDot aria-hidden="true" /> Mexico
              </span>
              <a href="https://instagram.com" target="_blank" rel="noreferrer">
                <FaInstagram aria-hidden="true" /> Instagram
              </a>
            </div>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <label>
              Nombre
              <input name="nombre" value={form.nombre} onChange={handleChange} required />
            </label>

            <label>
              Correo
              <input name="email" type="email" value={form.email} onChange={handleChange} required />
            </label>

            <label>
              Telefono
              <input name="telefono" value={form.telefono} onChange={handleChange} />
            </label>

            <label>
              Tipo de proyecto
              <select name="tipo_proyecto" value={form.tipo_proyecto} onChange={handleChange}>
                <option>Residencial</option>
                <option>Comercial</option>
                <option>Interiorismo</option>
                <option>Remodelacion</option>
              </select>
            </label>

            <label className="full">
              Mensaje
              <textarea
                name="mensaje"
                rows="5"
                value={form.mensaje}
                onChange={handleChange}
                required
              />
            </label>

            {status.message && <p className={`form-status ${status.type}`}>{status.message}</p>}

            <button className="button primary full" type="submit" disabled={sending}>
              {sending ? 'Enviando...' : 'Enviar mensaje'} <FaCheck aria-hidden="true" />
            </button>
          </form>
        </section>
      </main>

      <footer className="footer">
        <strong>Aria Arquitectura</strong>
        <span>Arquitectura residencial, comercial e interiorismo.</span>
      </footer>
    </div>
  );
}

export default App;
