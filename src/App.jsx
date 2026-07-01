import { useEffect, useState } from 'react';
import AdminApp from './pages/AdminApp';
import PublicSite from './pages/PublicSite';

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

export default App;
