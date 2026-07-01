import { Component, useEffect, useState } from 'react';
import { FaCheck, FaLock, FaPlus, FaRightFromBracket, FaUpload } from 'react-icons/fa6';
import { initialProjectForm } from '../data/adminData';
import { supabase, supabaseReady } from '../lib/supabaseClient';
import { getProjectAdminImages } from '../utils/projects';

class AdminErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Admin render error:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <AdminShell>
          <div className="admin-empty admin-error-panel">
            <strong>No se pudo cargar el panel.</strong>
            <p>Actualiza la pagina o vuelve a iniciar sesion.</p>
            <small>{this.state.error.message}</small>
          </div>
        </AdminShell>
      );
    }

    return this.props.children;
  }
}
function AdminApp() {
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    if (!supabaseReady) {
      setLoadingSession(false);
      return undefined;
    }

    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
      })
      .catch((error) => {
        console.error('Admin session error:', error);
        setSession(null);
      })
      .finally(() => {
        setLoadingSession(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoadingSession(false);
    });

    return () => listener?.subscription?.unsubscribe();
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

  return (
    <AdminErrorBoundary>
      <AdminDashboard userEmail={session.user.email} />
    </AdminErrorBoundary>
  );
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
  const [adminLoadError, setAdminLoadError] = useState('');
  const [uploading, setUploading] = useState(false);

  const cargarAdmin = async () => {
    setAdminLoadError('');

    try {
      const [{ data: proyectosData, error: proyectosError }, { data: mensajesData, error: mensajesError }] = await Promise.all([
        supabase
          .from('aria_proyectos')
          .select('id,nombre,tipo,lugar,descripcion,imagen_url,imagenes_urls,publicado,created_at')
          .order('created_at', { ascending: false }),
        supabase
          .from('aria_contactos')
          .select('id,nombre,email,telefono,tipo_proyecto,mensaje,estado,created_at')
          .order('created_at', { ascending: false })
      ]);

      if (proyectosError || mensajesError) {
        throw new Error(proyectosError?.message || mensajesError?.message || 'No se pudo leer la informacion del admin.');
      }

      setProyectos(proyectosData || []);
      setMensajes(mensajesData || []);
    } catch (error) {
      console.error('Admin data error:', error);
      setAdminLoadError(error.message || 'No se pudo cargar la informacion del admin.');
      setProyectos([]);
      setMensajes([]);
    }
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

        {adminLoadError && (
          <div className="admin-empty admin-error-panel">
            <strong>No se pudo cargar la informacion del admin.</strong>
            <p>{adminLoadError}</p>
            <button className="button admin-secondary" type="button" onClick={cargarAdmin}>Reintentar</button>
          </div>
        )}

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

export default AdminApp;
