import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FaArrowRight,
  FaArrowUp,
  FaBuilding,
  FaCalculator,
  FaCheck,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaEnvelope,
  FaImages,
  FaInstagram,
  FaLocationDot,
  FaMoon,
  FaPhone,
  FaSun,
  FaWhatsapp
} from 'react-icons/fa6';
import CostEstimatorChatbot from '../components/CostEstimatorChatbot';
import { filosofiaAria, initialForm, pilaresAria, proyectosBase, publicPages, servicios } from '../data/siteData';
import { supabase, supabaseReady } from '../lib/supabaseClient';
import { getPhotoLabel, getProjectImages } from '../utils/projects';

export default function PublicSite() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [sending, setSending] = useState(false);
  const [proyectos, setProyectos] = useState(proyectosBase);
  const [activeSlides, setActiveSlides] = useState({});
  const [activePage, setActivePage] = useState(() => {
    const hashPage = window.location.hash.replace('#', '');
    return publicPages.includes(hashPage) ? hashPage : 'inicio';
  });
  const [selectedProjectIndex, setSelectedProjectIndex] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const touchStartX = useRef(null);
  const pageTouchStart = useRef(null);
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
    const handleHashChange = () => {
      const hashPage = window.location.hash.replace('#', '');
      setActivePage(publicPages.includes(hashPage) ? hashPage : 'inicio');
      setSelectedProjectIndex(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
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
    return `https://wa.me/526182066391?text=${encodeURIComponent(text)}`;
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

  const navigateToPage = (page) => {
    setActivePage(page);
    setSelectedProjectIndex(null);
    window.history.pushState(null, '', `#${page}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const shouldIgnorePageSwipe = (target) => (
    target.closest('input, textarea, select, button, a, .instagram-viewer-overlay, .instagram-media-carousel, .service-grid, .quote-chatbot')
  );

  const handlePageTouchStart = (event) => {
    if (selectedProject || shouldIgnorePageSwipe(event.target)) return;

    const touch = event.touches[0];
    pageTouchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const handlePageTouchEnd = (event) => {
    if (!pageTouchStart.current || selectedProject || shouldIgnorePageSwipe(event.target)) {
      pageTouchStart.current = null;
      return;
    }

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - pageTouchStart.current.x;
    const deltaY = touch.clientY - pageTouchStart.current.y;
    pageTouchStart.current = null;

    if (Math.abs(deltaX) < 70 || Math.abs(deltaX) < Math.abs(deltaY) * 1.4) return;

    const currentIndex = publicPages.indexOf(activePage);
    const nextIndex = deltaX < 0
      ? Math.min(currentIndex + 1, publicPages.length - 1)
      : Math.max(currentIndex - 1, 0);

    if (nextIndex !== currentIndex) navigateToPage(publicPages[nextIndex]);
  };

  const navigateInicioSection = () => {
    const sectionIds = ['inicio', 'servicios', 'nosotros', 'mision-vision'];
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    const currentY = window.scrollY + window.innerHeight * 0.42;
    const nextSection = sections.find((section) => section.offsetTop > currentY) || sections[0];

    nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  const selectedProject = selectedProjectIndex !== null ? proyectos[selectedProjectIndex] : null;

  return (
    <div className={`site-shell page-${activePage}`} onTouchStart={handlePageTouchStart} onTouchEnd={handlePageTouchEnd}>
      <header className="topbar">
        <button className="brand brand-button" type="button" onClick={() => navigateToPage('inicio')} aria-label="Aria Arquitectura inicio">
          <span className="brand-mark">A</span>
          <span>
            <strong>Aria Arquitectura</strong>
            <small>Arquitectura + interiorismo</small>
          </span>
        </button>

        <div className="topbar-actions">
          <nav className="nav-links" aria-label="Navegacion principal">
            <button className={activePage === 'inicio' ? 'active' : ''} type="button" onClick={() => navigateToPage('inicio')}>Inicio</button>
            <button className={activePage === 'proyectos' ? 'active' : ''} type="button" onClick={() => navigateToPage('proyectos')}>Proyectos</button>
            <button className={activePage === 'cotizador' ? 'active' : ''} type="button" onClick={() => navigateToPage('cotizador')}>Cotizador</button>
            <button className={activePage === 'contacto' ? 'active' : ''} type="button" onClick={() => navigateToPage('contacto')}>Contacto</button>
          </nav>
          <span className="topbar-title">Aria Arquitectura</span>

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
              <button className="button primary" type="button" onClick={() => navigateToPage('contacto')}>
                Iniciar proyecto <FaArrowRight aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>

        {activePage === 'inicio' && (
          <button className="home-section-jump" type="button" onClick={navigateInicioSection} aria-label="Avanzar a la siguiente seccion">
            <FaChevronDown aria-hidden="true" />
          </button>
        )}

        <section id="proyectos" className="section projects-section">
          <div className="section-heading">
            <h2>Proyectos</h2>
            <p className="section-lede">Espacios con calma, proporcion y caracter.</p>
          </div>

          <div className="instagram-grid">
            {proyectos.map((proyecto, index) => {
              const images = getProjectImages(proyecto);
              return (
                <button
                  className="instagram-tile"
                  type="button"
                  key={proyecto.id || proyecto.nombre}
                  onClick={() => setSelectedProjectIndex(index)}
                  aria-label={`Abrir proyecto ${proyecto.nombre}`}
                >
                  {images[0] ? <img src={images[0]} alt={proyecto.nombre} /> : <span>{proyecto.nombre}</span>}
                  {images.length > 1 && <small><FaImages aria-hidden="true" /> {images.length}</small>}
                </button>
              );
            })}
          </div>

          {selectedProject && (
            <div className="instagram-viewer-overlay" role="dialog" aria-modal="true">
              <header className="instagram-feed-header">
                <button
                  type="button"
                  className="instagram-feed-back"
                  onClick={() => setSelectedProjectIndex(null)}
                  aria-label="Regresar a la galeria"
                >
                  <FaChevronLeft aria-hidden="true" />
                </button>
                <div>
                  <strong>Aria Arquitectura</strong>
                  <span>Proyectos</span>
                </div>
                <span className="instagram-feed-header-spacer" aria-hidden="true" />
              </header>

              <div className="instagram-feed">
                {[selectedProject, ...proyectos.filter((proyecto) => proyecto !== selectedProject)].map((proyecto) => {
                  const projectKey = proyecto.id || proyecto.nombre;
                  const images = getProjectImages(proyecto);
                  const activeIndex = Math.min(activeSlides[projectKey] || 0, Math.max(images.length - 1, 0));

                  return (
                    <article className="instagram-post-viewer" key={projectKey}>
                      <header className="instagram-post-header">
                        <div>
                          <strong>Aria Arquitectura</strong>
                          <span>{proyecto.tipo}</span>
                        </div>
                      </header>

                      <div className="instagram-media-shell">
                        <div
                          className="instagram-media-carousel"
                          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                          onTouchStart={handleProjectTouchStart}
                          onTouchEnd={(event) => handleProjectTouchEnd(event, projectKey, images.length)}
                        >
                          {images.map((image, imageIndex) => (
                            <div className="instagram-media-slide" key={`${projectKey}-${image}`}>
                              <img src={image} alt={`${proyecto.nombre} - ${getPhotoLabel(imageIndex)}`} />
                            </div>
                          ))}
                        </div>

                        {images.length > 1 && (
                          <>
                            <button
                              type="button"
                              className="instagram-media-nav previous"
                              onClick={() => changeProjectSlide(projectKey, images.length, -1)}
                              aria-label="Foto anterior"
                            >
                              <FaChevronLeft aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              className="instagram-media-nav next"
                              onClick={() => changeProjectSlide(projectKey, images.length, 1)}
                              aria-label="Foto siguiente"
                            >
                              <FaChevronRight aria-hidden="true" />
                            </button>
                          </>
                        )}
                      </div>

                      {images.length > 1 && (
                        <div className="instagram-media-dots">
                          {images.map((image, imageIndex) => (
                            <button
                              type="button"
                              key={`${projectKey}-dot-${image}`}
                              className={imageIndex === activeIndex ? 'active' : ''}
                              onClick={() => setProjectSlide(projectKey, imageIndex)}
                              aria-label={`Mostrar foto ${imageIndex + 1}`}
                            />
                          ))}
                        </div>
                      )}

                      <div className="instagram-post-copy">
                        <p><strong>{proyecto.nombre}</strong></p>
                        <p>{proyecto.descripcion}</p>
                        <time>{proyecto.lugar} / {proyecto.tipo}</time>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}
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

        <section id="mision-vision" className="section philosophy-section">
          <div className="section-heading">
            <h2>Mision y Vision</h2>
            <p className="section-lede">El rumbo profesional que guia cada proyecto.</p>
          </div>

          <div className="philosophy-grid">
            {filosofiaAria.map((item) => (
              <article className="philosophy-card" key={item.titulo}>
                <h3>{item.titulo}</h3>
                <p>{item.texto}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="cotizador" className="section quote-section">
          <div className="section-heading">
            <h2>Cotizador</h2>
            <p className="section-lede">Calcula un rango preliminar para tu proyecto en Durango.</p>
          </div>
          <CostEstimatorChatbot />
        </section>

        <section id="contacto" className="section contact-section">
          <div className="contact-copy">
            <h2>Contacto</h2>
            <p>Agenda una primera conversaci&oacute;n para revisar alcance, ubicaci&oacute;n, presupuesto y tiempos del proyecto.</p>
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

          <div className="location-card full">
            <div className="contact-map">
              <iframe
                title="Ubicacion de Aria Arquitectura"
                src="https://www.google.com/maps?q=24.0011709,-104.6614576&z=19&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="location-copy">
              <p className="eyebrow">Visitanos</p>
              <h2>Ubicacion de ARIA</h2>
              <p>Encuentra nuestra oficina y abre la ruta desde tu ubicacion para llegar facilmente.</p>
              <div className="location-address">
                <span><FaLocationDot aria-hidden="true" /></span>
                <p><strong>Aria Arquitectura</strong><br />Cancer 139, Sahop<br />Durango, Durango</p>
              </div>
              <a href="https://maps.app.goo.gl/mfGNuPTV8sZBWJ156" target="_blank" rel="noreferrer">
                <FaLocationDot aria-hidden="true" /> Abrir ubicacion en Google Maps
              </a>
            </div>
          </div>

          <div className="contact-methods full">
            <a href="mailto:hola@ariaarquitectura.mx">
              <FaEnvelope aria-hidden="true" /> hola@ariaarquitectura.mx
            </a>
            <a href="tel:+526182066391">
              <FaPhone aria-hidden="true" /> +52 618 206 6391
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer">
              <FaInstagram aria-hidden="true" /> Instagram
            </a>
          </div>
        </section>
      </main>


      <nav className="app-nav" aria-label="Navegacion principal">
        <button className={activePage === 'inicio' ? 'active' : ''} type="button" onClick={() => navigateToPage('inicio')}>
          <FaBuilding aria-hidden="true" /> Inicio
        </button>
        <button className={activePage === 'proyectos' ? 'active' : ''} type="button" onClick={() => navigateToPage('proyectos')}>
          <FaImages aria-hidden="true" /> Proyectos
        </button>
        <button className={activePage === 'cotizador' ? 'active' : ''} type="button" onClick={() => navigateToPage('cotizador')}>
          <FaCalculator aria-hidden="true" /> Cotizador
        </button>
        <button className={activePage === 'contacto' ? 'active' : ''} type="button" onClick={() => navigateToPage('contacto')}>
          <FaEnvelope aria-hidden="true" /> Contacto
        </button>
        <a href={whatsappUrl} target="_blank" rel="noreferrer" aria-label="Contactar por WhatsApp">
          <FaWhatsapp aria-hidden="true" /> WhatsApp
        </a>
      </nav>

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
