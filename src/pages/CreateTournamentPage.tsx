import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../api';

export function CreateTournamentPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    category: 'QUINTA',
    modality: 'Dobles Masculino' // Valor por defecto
  });

  function setField(key: string, value: string) {
    setForm(current => ({ ...current, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Formateamos las fechas al estándar ISO que espera Prisma
      const payload = {
        ...form,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
      };

      const res = await fetch('http://localhost:3000/api/tournaments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al crear el torneo');
      
      // Si se crea con éxito, volvemos a la pantalla principal
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', padding: '20px', color: '#fff', fontFamily: 'system-ui' }}>
      <button onClick={() => navigate('/')} style={{ background: 'transparent', color: '#34d399', border: 'none', cursor: 'pointer', padding: '0 0 20px 0' }}>← Volver al inicio</button>
      
      <h2 style={{ textAlign: 'center', margin: '0 0 20px 0' }}>🏆 Crear Nuevo Torneo</h2>
      
      {error && <div style={{ background: '#ef4444', padding: '10px', borderRadius: '6px', marginBottom: '15px' }}>{error}</div>}
      
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <label>Nombre del Torneo: 
          <input type="text" value={form.name} onChange={e => setField('name', e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '4px', marginTop: '5px' }} placeholder="Ej: Torneo Apertura 2026" />
        </label>

        <div style={{ display: 'flex', gap: '10px' }}>
          <label style={{ flex: 1 }}>Inicio: 
            <input type="datetime-local" value={form.startDate} onChange={e => setField('startDate', e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '4px', marginTop: '5px' }} />
          </label>
          <label style={{ flex: 1 }}>Fin: 
            <input type="datetime-local" value={form.endDate} onChange={e => setField('endDate', e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '4px', marginTop: '5px' }} />
          </label>
        </div>
        
        <label>Categoría:
          <select value={form.category} onChange={e => setField('category', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', marginTop: '5px' }}>
            <option value="PRIMERA">Primera</option>
            <option value="SEGUNDA">Segunda</option>
            <option value="TERCERA">Tercera</option>
            <option value="CUARTA">Cuarta</option>
            <option value="QUINTA">Quinta</option>
            <option value="SEXTA">Sexta</option>
            <option value="SEPTIMA">Séptima</option>
            <option value="OCTAVA">Octava</option>
          </select>
        </label>

        <label>Modalidad: 
          <input type="text" value={form.modality} onChange={e => setField('modality', e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '4px', marginTop: '5px' }} placeholder="Ej: Dobles Masculino" />
        </label>
        
        <button type="submit" disabled={loading} style={{ padding: '12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '10px', fontWeight: 'bold' }}>
          {loading ? 'Creando...' : 'Guardar Torneo'}
        </button>
      </form>
    </div>
  );
}