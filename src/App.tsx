import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';

import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { TournamentDetailsPage } from './pages/TournamentDetailsPage';
import { CreateTournamentPage } from './pages/CreateTournamentPage';
import { ProfilePage } from './pages/ProfilePage';
import { getUser } from './api';

function Navigation() {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  return (
    <nav style={{ background: '#18181b', padding: '15px 40px', borderBottom: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
        <Link to="/" style={{ color: '#f8fafc', textDecoration: 'none', fontSize: '18px', fontWeight: '900', letterSpacing: '-0.5px' }}>
          TORNEOS
        </Link>
        
        {/* 🚀 AGREGAMOS ESTE BLOQUE PARA MOSTRAR "MI PERFIL" SI HAY USUARIO LOGUEADO */}
        {user && (
          <Link to="/perfil" style={{ color: '#a3e635', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>
            MI PERFIL
          </Link>
        )}
      </div>
      
      <div>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ color: '#f8fafc', fontSize: '14px' }}>
              Hola, <strong style={{ color: '#a3e635' }}>{user.name}</strong> {user.role === 'ADMIN' && '(Admin)'}
            </span>
            <button onClick={handleLogout} style={{ background: '#27272a', color: '#fff', border: '1px solid #3f3f46', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', transition: 'all 0.2s' }}>
              CERRAR SESIÓN
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/login" style={{ color: '#fff', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold', padding: '8px 16px' }}>INGRESAR</Link>
            <Link to="/register" style={{ background: '#a3e635', color: '#000', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold', padding: '8px 16px', borderRadius: '4px' }}>REGISTRARSE</Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <div style={{ background: '#09090b', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/tournaments/:id" element={<TournamentDetailsPage />} />
          <Route path="/create-tournament" element={<CreateTournamentPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}