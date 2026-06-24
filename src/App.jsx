import { useEffect, useMemo, useState } from 'react';
import {
  FaArrowRight,
  FaBuilding,
  FaCheck,
  FaEnvelope,
  FaInstagram,
  FaLayerGroup,
  FaLocationDot,
  FaLock,
  FaPhone,
  FaPlus,
  FaRulerCombined,
  FaRightFromBracket,
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
    color: 'proyecto-terracota'
  },
  {
    id: 'estudio-norte',
    nombre: 'Estudio Norte',
    tipo: 'Comercial',
    lugar: 'Torreon, MX',
    descripcion: 'Espacio flexible para atencion, exhibicion y trabajo colaborativo.',
    imagen_url: '',
    color: 'proyecto-oliva'
  },
  {
    id: 'interior-altura',
    nombre: 'Interior Altura',
    tipo: 'Interiorismo',
    lugar: 'Monterrey, MX',
    descripcion: 'Iluminacion indirecta, carpinteria a medida y atmosfera serena.',
    imagen_url: '',
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

const initialProjectForm = {
  nombre: '',
  tipo: 'Residencial',
  lugar: '',
  descripcion: '',
  imagen: null
};

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

  useEffect(() => {
    let active = true;

    const cargarProyectos = async () => {
      if (!supabaseReady) return;

      const { data, error } = await supabase
        .from('aria_proyectos')
        .select('id,nombre,tipo,lugar,descripcion,imagen_url')
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
            <strong>{proyectos.length}</strong>
            <span>Proyectos en galeria</span>
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
            {proyectos.map((proyecto, index) => (
              <article className={`project-card ${proyecto.color || proyectosBase[index % proyectosBase.length].color}`} key={proyecto.id || proyecto.nombre}>
                <div className="project-visual">
                  {proyecto.imagen_url ? (
                    <img src={proyecto.imagen_url} alt={proyecto.nombre} />
                  ) : null}
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
        .select('id,nombre,tipo,lugar,descripcion,imagen_url,publicado,created_at')
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
      [name]: files ? files[0] : value
    }));
  };

  const handleProjectSubmit = async (event) => {
    event.preventDefault();
    setUploading(true);
    setStatus({ type: 'idle', message: '' });

    if (!projectForm.imagen) {
      setUploading(false);
      setStatus({ type: 'error', message: 'Selecciona una foto para el proyecto.' });
      return;
    }

    const extension = projectForm.imagen.name.split('.').pop();
    const safeName = projectForm.nombre
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const filePath = `${Date.now()}-${safeName || 'proyecto'}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from('aria-proyectos')
      .upload(filePath, projectForm.imagen, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      setUploading(false);
      setStatus({ type: 'error', message: 'No se pudo subir la foto. Revisa el bucket de Supabase.' });
      return;
    }

    const { data: publicData } = supabase.storage
      .from('aria-proyectos')
      .getPublicUrl(filePath);

    const { error: insertError } = await supabase.from('aria_proyectos').insert({
      nombre: projectForm.nombre.trim(),
      tipo: projectForm.tipo,
      lugar: projectForm.lugar.trim(),
      descripcion: projectForm.descripcion.trim(),
      imagen_url: publicData.publicUrl,
      storage_path: filePath,
      publicado: true
    });

    setUploading(false);

    if (insertError) {
      setStatus({ type: 'error', message: 'La foto subio, pero no se pudo guardar el proyecto.' });
      return;
    }

    setProjectForm(initialProjectForm);
    event.target.reset();
    setStatus({ type: 'success', message: 'Proyecto publicado en la galeria.' });
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
              Foto
              <input name="imagen" type="file" accept="image/*" onChange={handleProjectChange} required />
            </label>

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
                <img src={proyecto.imagen_url} alt={proyecto.nombre} />
                <div>
                  <strong>{proyecto.nombre}</strong>
                  <span>{proyecto.tipo} - {proyecto.lugar}</span>
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
