import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { setToken } from '../api';

export function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', lastName: '', dni: '', email: '', password: '', phone: '', level: 'QUINTA'
  });

  function setField(key: string, value: string) {
    setForm(current => ({ ...current, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al registrar usuario');
      
      // Guardamos el token (dependiendo de cómo lo devuelva tu backend)
      setToken(data.access_token || data.token);
      
      // Si el backend devuelve los datos del usuario, los guardamos para el Navbar
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      navigate('/');
      window.location.reload(); // Recarga para actualizar la barra de navegación
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: '#09090b' }}>
      <div style={{ background: '#18181b', padding: '40px', borderRadius: '8px', border: '1px solid #27272a', width: '100%', maxWidth: '450px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ color: '#f8fafc', margin: '0 0 10px 0', fontSize: '24px', fontWeight: '900', textTransform: 'uppercase' }}>Registro</h2>
          <p style={{ color: '#a1a1aa', margin: 0, fontSize: '14px' }}>Crea tu cuenta de jugador</p>
        </div>

        {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', color: '#f87171', padding: '10px', marginBottom: '20px', fontSize: '14px' }}>{error}</div>}
        
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', color: '#a1a1aa', fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase' }}>Nombre</label>
              <input type="text" value={form.name} onChange={e => setField('name', e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #3f3f46', background: '#09090b', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', color: '#a1a1aa', fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase' }}>Apellido</label>
              <input type="text" value={form.lastName} onChange={e => setField('lastName', e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #3f3f46', background: '#09090b', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
             <div style={{ flex: 1 }}>
              <label style={{ display: 'block', color: '#a1a1aa', fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase' }}>DNI</label>
              <input type="text" value={form.dni} onChange={e => setField('dni', e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #3f3f46', background: '#09090b', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', color: '#a1a1aa', fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase' }}>Teléfono</label>
              <input type="text" value={form.phone} onChange={e => setField('phone', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #3f3f46', background: '#09090b', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: '#a1a1aa', fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase' }}>Email</label>
            <input type="email" value={form.email} onChange={e => setField('email', e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #3f3f46', background: '#09090b', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ display: 'block', color: '#a1a1aa', fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase' }}>Contraseña</label>
            <input type="password" value={form.password} onChange={e => setField('password', e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #3f3f46', background: '#09090b', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          
          <div>
            <label style={{ display: 'block', color: '#a1a1aa', fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase' }}>Categoría / Nivel</label>
            <select value={form.level} onChange={e => setField('level', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #3f3f46', background: '#09090b', color: '#fff', outline: 'none', boxSizing: 'border-box' }}>
              <option value="PRIMERA">Primera</option>
              <option value="SEGUNDA">Segunda</option>
              <option value="TERCERA">Tercera</option>
              <option value="CUARTA">Cuarta</option>
              <option value="QUINTA">Quinta</option>
              <option value="SEXTA">Sexta</option>
              <option value="SEPTIMA">Séptima</option>
              <option value="OCTAVA">Octava</option>
            </select>
          </div>
          
          <button type="submit" style={{ width: '100%', padding: '14px', background: '#a3e635', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '900', fontSize: '14px', textTransform: 'uppercase', marginTop: '10px' }}>
            Completar Registro
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#a1a1aa' }}>
          ¿Ya tienes cuenta? <Link to="/login" style={{ color: '#a3e635', textDecoration: 'none', fontWeight: 'bold' }}>Inicia sesión aquí</Link>
        </div>
      </div>
    </div>
  );
}