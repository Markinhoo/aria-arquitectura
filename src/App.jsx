import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FaArrowRight,
  FaArrowUp,
  FaBuilding,
  FaCheck,
  FaChevronLeft,
  FaChevronRight,
  FaEnvelope,
  FaInstagram,
  FaLayerGroup,
  FaLocationDot,
  FaLock,
  FaMoon,
  FaPhone,
  FaImages,
  FaPlus,
  FaRulerCombined,
  FaRightFromBracket,
  FaSun,
  FaUpload,
  FaWhatsapp
} from 'react-icons/fa6';
import { supabase, supabaseReady } from './lib/supabaseClient';

const proyectosBase = [
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

const pilaresAria = [
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

const initialForm = {
  nombre: '',
  email: '',
  telefono: '',
  tipo_proyecto: 'Residencial',
  mensaje: ''
};

const initialProjectForm = {
  nombre: '',
  tipo: 'Residencial',
  lugar: '',
  descripcion: '',
  imagenes: []
};

function getProjectImages(proyecto) {
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

function getProjectAdminImages(proyecto) {
  if (Array.isArray(proyecto.imagenes_urls) && proyecto.imagenes_urls.length) {
    return proyecto.imagenes_urls;
  }

  return proyecto.imagen_url ? [proyecto.imagen_url] : [];
}

function getPhotoLabel(index) {
  if (index === 0) return 'Antes';
  if (index === 1) return 'Despues';
  return `Detalle ${index + 1}`;
}

function App() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const updatePath = () => setPath(window.location.pathname);
    window.addEventListener('popstate', updatePath);
    return () => window.removeEventListener('popstate', updatePath);
  }, []);

  if (path.startsWith('/admin')) {
    return <AdminApp />;
  }

  return <PublicSite />;
}

function PublicSite() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [sending, setSending] = useState(false);
  const [proyectos, setProyectos] = useState(proyectosBase);
  const [activeSlides, setActiveSlides] = useState({});
  const [showScrollTop, setShowScrollTop] = useState(false);
  const touchStartX = useRef(null);
  const serviceGridRef = useRef(null);
  const serviceAutoPaused = useRef(false);
  const [theme, setTheme] = useState(() => {
    const storedTheme = window.localStorage.getItem('aria-theme');
    if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    let active = true;

    const cargarProyectos = async () => {
      if (!supabaseReady) return;

      const { data, error } = await supabase
        .from('aria_proyectos')
        .select('id,nombre,tipo,lugar,descripcion,imagen_url,imagenes_urls')
        .eq('publicado', true)
        .order('created_at', { ascending: false });

      if (!active || error || !data?.length) return;
      setProyectos(data);
    };

    cargarProyectos();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 520);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem('aria-theme', theme);
  }, [theme]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const grid = serviceGridRef.current;
      if (!grid || serviceAutoPaused.current || !window.matchMedia('(max-width: 620px)').matches) return;

      const cards = Array.from(grid.children);
      if (cards.length < 2) return;

      const currentIndex = cards.reduce((closestIndex, card, index) => {
        const currentDistance = Math.abs(card.offsetLeft - grid.scrollLeft);
        const closestDistance = Math.abs(cards[closestIndex].offsetLeft - grid.scrollLeft);
        return currentDistance < closestDistance ? index : closestIndex;
      }, 0);
      const nextIndex = currentIndex >= cards.length - 1 ? 0 : currentIndex + 1;

      grid.scrollTo({
        left: cards[nextIndex].offsetLeft,
        behavior: 'smooth'
      });
    }, 3200);

    return () => window.clearInterval(intervalId);
  }, []);

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

  const changeProjectSlide = (projectKey, total, direction) => {
    setActiveSlides((current) => {
      const currentIndex = current[projectKey] || 0;
      return {
        ...current,
        [projectKey]: (currentIndex + direction + total) % total
      };
    });
  };

  const setProjectSlide = (projectKey, index) => {
    setActiveSlides((current) => ({
      ...current,
      [projectKey]: index
    }));
  };

  const handleProjectTouchStart = (event) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleProjectTouchEnd = (event, projectKey, total) => {
    if (touchStartX.current === null || total < 2) return;

    const touchEndX = event.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(deltaX) < 42) return;
    changeProjectSlide(projectKey, total, deltaX < 0 ? 1 : -1);
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

        <div className="topbar-actions">
          <nav className="nav-links" aria-label="Navegacion principal">
            <a href="#inicio">Inicio</a>
            <a href="#proyectos">Proyectos</a>
            <a href="#servicios">Servicios</a>
            <a href="#nosotros">Nosotros</a>
            <a href="#contacto">Contacto</a>
          </nav>

          <button
            className="theme-toggle"
            type="button"
            aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            onClick={() => setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))}
          >
            {theme === 'dark' ? <FaSun aria-hidden="true" /> : <FaMoon aria-hidden="true" />}
          </button>
        </div>
      </header>

      <main>
        <section id="inicio" className="hero">
          <div className="hero-media" aria-hidden="true">
            <img src="/aria-hero.png" alt="" />
          </div>

          <div className="hero-content">
            <p className="eyebrow">Arquitectura · Responsabilidad · Innovación · Armonía</p>
            <h1>ARIA</h1>
            <p className="hero-copy">
              "Diseñamos espacios que inspiran, construimos lugares que perduran."
            </p>

            <div className="hero-actions">
              <a className="button primary" href="#contacto">
                Iniciar proyecto <FaArrowRight aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        <section id="proyectos" className="section projects-section">
          <div className="section-heading">
            <h2>Proyectos</h2>
            <p className="section-lede">Espacios con calma, proporcion y caracter.</p>
          </div>

          <div className="project-grid">
            {proyectos.map((proyecto, index) => {
              const projectKey = proyecto.id || proyecto.nombre;
              const images = getProjectImages(proyecto);
              const activeIndex = Math.min(activeSlides[projectKey] || 0, Math.max(images.length - 1, 0));

              return (
                <article className={`project-card ${proyecto.color || proyectosBase[index % proyectosBase.length].color}`} key={projectKey}>
                  <div
                    className="project-visual"
                    onTouchStart={handleProjectTouchStart}
                    onTouchEnd={(event) => handleProjectTouchEnd(event, projectKey, images.length)}
                  >
                    {images[activeIndex] ? (
                      <img
                        className="project-carousel-image"
                        src={images[activeIndex]}
                        alt={`${proyecto.nombre} - ${getPhotoLabel(activeIndex)}`}
                        key={`${projectKey}-${activeIndex}`}
                      />
                    ) : null}

                    {images.length > 0 && (
                      <small className="project-stage-label">{getPhotoLabel(activeIndex)}</small>
                    )}

                    {images.length > 1 && (
                      <>
                        <small className="project-photo-count">
                          <FaImages aria-hidden="true" /> {activeIndex + 1}/{images.length}
                        </small>
                        <button
                          className="project-carousel-control prev"
                          type="button"
                          aria-label={`Ver foto anterior de ${proyecto.nombre}`}
                          onClick={() => changeProjectSlide(projectKey, images.length, -1)}
                        >
                          <FaChevronLeft aria-hidden="true" />
                        </button>
                        <button
                          className="project-carousel-control next"
                          type="button"
                          aria-label={`Ver siguiente foto de ${proyecto.nombre}`}
                          onClick={() => changeProjectSlide(projectKey, images.length, 1)}
                        >
                          <FaChevronRight aria-hidden="true" />
                        </button>
                        <div className="project-carousel-dots" aria-label={`Fotos de ${proyecto.nombre}`}>
                          {images.map((image, imageIndex) => (
                            <button
                              className={imageIndex === activeIndex ? 'active' : ''}
                              type="button"
                              key={image}
                              aria-label={`Ver ${getPhotoLabel(imageIndex)} de ${proyecto.nombre}`}
                              onClick={() => setProjectSlide(projectKey, imageIndex)}
                            />
                          ))}
                        </div>
                      </>
                    )}
                    <div className="project-overlay-copy">
                      <h3>{proyecto.nombre}</h3>
                      <span>{proyecto.descripcion}</span>
                      <p>{proyecto.lugar} / {proyecto.tipo}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section id="servicios" className="section services-section">
          <div className="section-heading">
            <h2>Servicios</h2>
            <p className="section-lede">Del trazo inicial al espacio terminado.</p>
          </div>

          <div
            className="service-grid"
            ref={serviceGridRef}
            onMouseEnter={() => { serviceAutoPaused.current = true; }}
            onMouseLeave={() => { serviceAutoPaused.current = false; }}
            onTouchStart={() => { serviceAutoPaused.current = true; }}
            onTouchEnd={() => { serviceAutoPaused.current = false; }}
          >
            {servicios.map((servicio) => (
              <article className="service-card" key={servicio.titulo}>
                <div className="service-icon">{servicio.icono}</div>
                <h3>{servicio.titulo}</h3>
                <p>{servicio.texto}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="nosotros" className="about-band">
          <div className="about-heading">
            <h2>Nosotros</h2>
            <img src="/brand/aria-logo.png" alt="Logo de Aria Arquitectura" />
          </div>
          <div className="about-grid">
            {pilaresAria.map((pilar, index) => (
              <article className="about-item" key={pilar.titulo}>
                <h3>{pilar.titulo}</h3>
                <p>{pilar.texto}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="contacto" className="section contact-section">
          <div className="contact-copy">
            <h2>Contacto</h2>
            <p className="section-lede">Cuéntanos que quieres construir.</p>
            <p>
              Agenda una primera conversación para revisar alcance, ubicación, presupuesto y tiempos del proyecto.
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

      <div className="floating-actions" aria-label="Acciones rapidas">
        <button
          className={`floating-button scroll-top-button ${showScrollTop ? 'is-visible' : ''}`}
          type="button"
          aria-label="Volver arriba"
          aria-hidden={!showScrollTop}
          tabIndex={showScrollTop ? 0 : -1}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <FaArrowUp aria-hidden="true" />
        </button>
        <a
          className="floating-button whatsapp-floating"
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="Contactar por WhatsApp"
        >
          <FaWhatsapp aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}

function AdminApp() {
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    if (!supabaseReady) {
      setLoadingSession(false);
      return undefined;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoadingSession(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoadingSession(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (!supabaseReady) {
    return (
      <AdminShell>
        <div className="admin-empty">
          Configura las variables de Supabase para activar el panel de administracion.
        </div>
      </AdminShell>
    );
  }

  if (loadingSession) {
    return (
      <AdminShell>
        <div className="admin-empty">Cargando panel...</div>
      </AdminShell>
    );
  }

  if (!session) {
    return <AdminLogin />;
  }

  return <AdminDashboard userEmail={session.user.email} />;
}

function AdminShell({ children }) {
  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <a className="brand admin-brand" href="/">
          <span className="brand-mark">A</span>
          <span>
            <strong>Aria Arquitectura</strong>
            <small>Panel administrativo</small>
          </span>
        </a>
      </header>
      {children}
    </div>
  );
}

function AdminLogin() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSending(true);
    setStatus('');

    const { error } = await supabase.auth.signInWithPassword(credentials);
    setSending(false);

    if (error) {
      setStatus('No se pudo iniciar sesion. Revisa correo y contraseña.');
    }
  };

  return (
    <AdminShell>
      <main className="admin-login">
        <form className="admin-card admin-login-card" onSubmit={handleSubmit}>
          <div className="admin-card-heading">
            <span className="service-icon"><FaLock aria-hidden="true" /></span>
            <div>
              <p className="eyebrow">Admin</p>
              <h1>Acceso privado</h1>
            </div>
          </div>

          <label>
            Correo
            <input
              type="email"
              value={credentials.email}
              onChange={(event) => setCredentials((current) => ({ ...current, email: event.target.value }))}
              required
            />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              value={credentials.password}
              onChange={(event) => setCredentials((current) => ({ ...current, password: event.target.value }))}
              required
            />
          </label>

          {status && <p className="form-status error">{status}</p>}

          <button className="button primary" disabled={sending} type="submit">
            {sending ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </main>
    </AdminShell>
  );
}

function AdminDashboard({ userEmail }) {
  const [projectForm, setProjectForm] = useState(initialProjectForm);
  const [proyectos, setProyectos] = useState([]);
  const [mensajes, setMensajes] = useState([]);
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [uploading, setUploading] = useState(false);

  const cargarAdmin = async () => {
    const [{ data: proyectosData }, { data: mensajesData }] = await Promise.all([
      supabase
        .from('aria_proyectos')
        .select('id,nombre,tipo,lugar,descripcion,imagen_url,imagenes_urls,publicado,created_at')
        .order('created_at', { ascending: false }),
      supabase
        .from('aria_contactos')
        .select('id,nombre,email,telefono,tipo_proyecto,mensaje,estado,created_at')
        .order('created_at', { ascending: false })
    ]);

    setProyectos(proyectosData || []);
    setMensajes(mensajesData || []);
  };

  useEffect(() => {
    cargarAdmin();
  }, []);

  const handleProjectChange = (event) => {
    const { name, value, files } = event.target;
    setProjectForm((current) => ({
      ...current,
      [name]: files ? Array.from(files) : value
    }));
  };

  const handleProjectSubmit = async (event) => {
    event.preventDefault();
    setUploading(true);
    setStatus({ type: 'idle', message: '' });

    if (!projectForm.imagenes.length) {
      setUploading(false);
      setStatus({ type: 'error', message: 'Selecciona al menos una foto para el proyecto.' });
      return;
    }

    const { error: schemaError } = await supabase
      .from('aria_proyectos')
      .select('imagenes_urls,storage_paths')
      .limit(1);

    if (schemaError) {
      setUploading(false);
      setStatus({
        type: 'error',
        message: 'Falta actualizar Supabase. Ejecuta la migracion de multiples imagenes antes de publicar proyectos.'
      });
      return;
    }

    const safeName = projectForm.nombre
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const uploadedImages = [];
    const uploadedPaths = [];

    for (const [index, file] of projectForm.imagenes.entries()) {
      const extension = file.name.split('.').pop();
      const filePath = `${Date.now()}-${safeName || 'proyecto'}-${index + 1}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from('aria-proyectos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        setUploading(false);
        setStatus({ type: 'error', message: 'No se pudieron subir todas las fotos. Revisa el bucket de Supabase.' });
        return;
      }

      const { data: publicData } = supabase.storage
        .from('aria-proyectos')
        .getPublicUrl(filePath);

      uploadedImages.push(publicData.publicUrl);
      uploadedPaths.push(filePath);
    }

    const { error: insertError } = await supabase.from('aria_proyectos').insert({
      nombre: projectForm.nombre.trim(),
      tipo: projectForm.tipo,
      lugar: projectForm.lugar.trim(),
      descripcion: projectForm.descripcion.trim(),
      imagen_url: uploadedImages[0],
      imagenes_urls: uploadedImages,
      storage_path: uploadedPaths[0],
      storage_paths: uploadedPaths,
      publicado: true
    });

    setUploading(false);

    if (insertError) {
      if (uploadedPaths.length) {
        await supabase.storage.from('aria-proyectos').remove(uploadedPaths);
      }

      setStatus({
        type: 'error',
        message: `Las fotos subieron, pero no se pudo guardar el proyecto: ${insertError.message}`
      });
      return;
    }

    setProjectForm(initialProjectForm);
    event.target.reset();
    setStatus({ type: 'success', message: 'Proyecto publicado en la galeria con sus fotos.' });
    cargarAdmin();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AdminShell>
      <main className="admin-dashboard">
        <div className="admin-dashboard-heading">
          <div>
            <p className="eyebrow">Panel</p>
            <h1>Gestion de Aria</h1>
            <span>{userEmail}</span>
          </div>
          <button className="button admin-secondary" type="button" onClick={handleLogout}>
            <FaRightFromBracket aria-hidden="true" /> Salir
          </button>
        </div>

        <section className="admin-grid">
          <form className="admin-card admin-form" onSubmit={handleProjectSubmit}>
            <div className="admin-card-heading">
              <span className="service-icon"><FaUpload aria-hidden="true" /></span>
              <div>
                <p className="eyebrow">Galeria</p>
                <h2>Subir proyecto</h2>
              </div>
            </div>

            <label>
              Nombre del proyecto
              <input name="nombre" value={projectForm.nombre} onChange={handleProjectChange} required />
            </label>

            <label>
              Tipo
              <select name="tipo" value={projectForm.tipo} onChange={handleProjectChange}>
                <option>Residencial</option>
                <option>Comercial</option>
                <option>Interiorismo</option>
                <option>Remodelacion</option>
              </select>
            </label>

            <label>
              Ubicacion
              <input name="lugar" value={projectForm.lugar} onChange={handleProjectChange} required />
            </label>

            <label>
              Fotos
              <input name="imagenes" type="file" accept="image/*" multiple onChange={handleProjectChange} required />
            </label>

            {projectForm.imagenes.length > 0 && (
              <p className="selected-files full">
                {projectForm.imagenes.length} archivo{projectForm.imagenes.length === 1 ? '' : 's'} seleccionado{projectForm.imagenes.length === 1 ? '' : 's'}
              </p>
            )}

            <label className="full">
              Descripcion
              <textarea name="descripcion" rows="4" value={projectForm.descripcion} onChange={handleProjectChange} required />
            </label>

            {status.message && <p className={`form-status ${status.type}`}>{status.message}</p>}

            <button className="button primary full" disabled={uploading} type="submit">
              {uploading ? 'Publicando...' : 'Publicar proyecto'} <FaPlus aria-hidden="true" />
            </button>
          </form>

          <section className="admin-card">
            <div className="admin-card-heading">
              <div>
                <p className="eyebrow">Contacto</p>
                <h2>Mensajes recibidos</h2>
              </div>
            </div>

            <div className="message-list">
              {mensajes.length ? mensajes.map((mensaje) => (
                <article className="message-item" key={mensaje.id}>
                  <div>
                    <strong>{mensaje.nombre}</strong>
                    <span>{new Date(mensaje.created_at).toLocaleDateString('es-MX')}</span>
                  </div>
                  <p>{mensaje.mensaje}</p>
                  <small>{mensaje.email} {mensaje.telefono ? `- ${mensaje.telefono}` : ''} - {mensaje.tipo_proyecto}</small>
                </article>
              )) : <p className="admin-muted">Aun no hay mensajes.</p>}
            </div>
          </section>
        </section>

        <section className="admin-card">
          <div className="admin-card-heading">
            <div>
              <p className="eyebrow">Publicados</p>
              <h2>Proyectos visibles</h2>
            </div>
          </div>

          <div className="admin-project-list">
            {proyectos.length ? proyectos.map((proyecto) => (
              <article className="admin-project-item" key={proyecto.id}>
                <img src={getProjectAdminImages(proyecto)[0]} alt={proyecto.nombre} />
                <div>
                  <strong>{proyecto.nombre}</strong>
                  <span>{proyecto.tipo} - {proyecto.lugar}</span>
                  <small>{getProjectAdminImages(proyecto).length} foto{getProjectAdminImages(proyecto).length === 1 ? '' : 's'}</small>
                </div>
              </article>
            )) : <p className="admin-muted">Aun no hay proyectos subidos.</p>}
          </div>
        </section>
      </main>
    </AdminShell>
  );
}

export default App;
