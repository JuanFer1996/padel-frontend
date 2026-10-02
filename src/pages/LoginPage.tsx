import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { setToken } from '../api'; 
import { API_URL } from '../api';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

 async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al iniciar sesión');
      
      // CORRECCIÓN: NestJS suele devolver "access_token"
      const token = data.access_token || data.token;
      
      setToken(token);
      localStorage.setItem('user', JSON.stringify(data.user)); 
      
      navigate('/');
      window.location.reload(); 
    } catch (err: any) { setError(err.message); }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#18181b', padding: '40px', borderRadius: '8px', border: '1px solid #27272a', width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ color: '#f8fafc', margin: '0 0 10px 0', fontSize: '24px', fontWeight: '900', textTransform: 'uppercase' }}>Ingresar</h2>
          <p style={{ color: '#a1a1aa', margin: 0, fontSize: '14px' }}>Bienvenido de nuevo</p>
        </div>

        {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', color: '#f87171', padding: '10px', marginBottom: '20px', fontSize: '14px' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', color: '#a1a1aa', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase' }}>Correo Electrónico</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #3f3f46', background: '#09090b', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', color: '#a1a1aa', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase' }}>Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #3f3f46', background: '#09090b', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <button type="submit" style={{ width: '100%', padding: '14px', background: '#a3e635', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '900', fontSize: '14px', textTransform: 'uppercase', marginTop: '10px' }}>
            Iniciar Sesión
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#a1a1aa' }}>
          ¿No tienes una cuenta? <Link to="/register" style={{ color: '#a3e635', textDecoration: 'none', fontWeight: 'bold' }}>Regístrate aquí</Link>
        </div>
      </div>
    </div>
  );
}