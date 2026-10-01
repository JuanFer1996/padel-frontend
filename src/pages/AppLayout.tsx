import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { getUser } from '../api';

export function AppLayout() {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  return (
    <div style={{ background: '#09090b', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      {/* BARRA DE NAVEGACIÓN SUPERIOR */}
      <header style={{ background: '#18181b', padding: '15px 40px', borderBottom: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
          <NavLink to="/" style={{ color: '#f8fafc', textDecoration: 'none', fontSize: '18px', fontWeight: '900', letterSpacing: '-0.5px' }}>
            TORNEOS
          </NavLink>
          
          {user && (
            <NavLink to="/perfil" style={({ isActive }) => ({ color: isActive ? '#a3e635' : '#f8fafc', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' })}>
              MI PERFIL
            </NavLink>
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
              <NavLink to="/login" style={{ color: '#fff', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold', padding: '8px 16px' }}>INGRESAR</NavLink>
              <NavLink to="/register" style={{ background: '#a3e635', color: '#000', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold', padding: '8px 16px', borderRadius: '4px' }}>REGISTRARSE</NavLink>
            </div>
          )}
        </div>
      </header>

      {/* CONTENIDO DINÁMICO DE LAS PÁGINAS */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}