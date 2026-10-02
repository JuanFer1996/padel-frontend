import { useEffect, useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { getToken, getUser } from '../api';
import { API_URL } from '../api';


export function HomePage() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  
  const [clubs, setClubs] = useState<any[]>([]);
  const [clubId, setClubId] = useState('');

  // Estados del formulario
  const [name, setName] = useState('');
  const [category, setCategory] = useState('QUINTA');
  const [modality, setModality] = useState('Dobles Masculino');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const user = getUser();
  const isAdmin = user?.role === 'ADMIN';

  function fetchTournaments() {
    fetch(`${API_URL}/tournaments`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })
      .then(res => res.json())
      .then((data: any) => {
        if (Array.isArray(data)) {
          setTournaments(data);
        } else if (data && Array.isArray(data.tournaments)) {
          setTournaments(data.tournaments);
        } else {
          setTournaments([]);
        }
      })
      .catch(err => console.error("Error al cargar torneos:", err));
  }

  useEffect(() => { 
  fetchTournaments(); 
  fetch(`${API_URL}/clubs`, { headers: { 'Authorization': `Bearer ${getToken()}` } })
    .then(res => res.json()).then(data => { setClubs(data); if (data.length > 0) setClubId(data[0].id); }).catch(console.error);
}, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/tournaments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ 
          name, 
          category, 
          modality, 
          clubId,
          startDate: new Date(startDate).toISOString(), 
          endDate: new Date(endDate).toISOString() 
          
        })
      });
      if (res.ok) { 
        setName(''); 
        setModality('Dobles Masculino');
        setStartDate('');
        setEndDate('');
        fetchTournaments(); 
      } else {
        const data = await res.json();
        alert(data.message || 'Error al crear el torneo');
      }
    } catch (error) { 
      console.error(error); 
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('¿Estás seguro de eliminar este torneo? Esta acción borrará todos los partidos e inscripciones y no se puede deshacer.')) return;
    try {
      const res = await fetch(`${API_URL}/tournaments/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) fetchTournaments();
      else alert('Error al eliminar el torneo');
    } catch (error) { console.error(error); }
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', color: '#f8fafc' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '-1px', margin: 0 }}>
          Torneos <span style={{ color: '#a3e635' }}>Disponibles</span>
        </h1>
      </div>

      {isAdmin && (
        <div style={{ background: '#18181b', padding: '20px', borderRadius: '8px', border: '1px solid #27272a', borderLeft: '4px solid #a3e635', marginBottom: '40px' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#a3e635', fontSize: '16px', textTransform: 'uppercase' }}>+ Crear Nuevo Torneo</h3>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            {/* Fila 1: Nombre, Categoría y Modalidad */}
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <input type="text" placeholder="Nombre (Ej: Torneo Apertura)" value={name} onChange={e => setName(e.target.value)} required style={{ flex: 2, minWidth: '200px', padding: '12px', borderRadius: '4px', border: '1px solid #3f3f46', background: '#09090b', color: '#fff', outline: 'none' }} />
              <select value={category} onChange={e => setCategory(e.target.value)} style={{ flex: 1, minWidth: '150px', padding: '12px', borderRadius: '4px', border: '1px solid #3f3f46', background: '#09090b', color: '#fff', outline: 'none' }}>
                 <option value="PRIMERA">Primera</option>
                 <option value="SEGUNDA">Segunda</option>
                 <option value="TERCERA">Tercera</option>
                 <option value="CUARTA">Cuarta</option>
                 <option value="QUINTA">Quinta</option>
                 <option value="SEXTA">Sexta</option>
                 <option value="SEPTIMA">Séptima</option>
                 <option value="OCTAVA">Octava</option>
              </select>
              <input type="text" placeholder="Modalidad (Ej: Dobles Femenino)" value={modality} onChange={e => setModality(e.target.value)} required style={{ flex: 1, minWidth: '150px', padding: '12px', borderRadius: '4px', border: '1px solid #3f3f46', background: '#09090b', color: '#fff', outline: 'none' }} />
            </div>

            <select value={clubId} onChange={e => setClubId(e.target.value)} required style={{ flex: 1, padding: '12px', borderRadius: '4px', border: '1px solid #3f3f46', background: '#09090b', color: '#fff' }}>
              <option value="">Seleccionar Complejo...</option>
                   {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            {/* Fila 2: Fechas y Botón */}
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ color: '#a1a1aa', fontSize: '13px', fontWeight: 'bold' }}>Inicio:</label>
                <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} required style={{ flex: 1, padding: '12px', borderRadius: '4px', border: '1px solid #3f3f46', background: '#09090b', color: '#fff', outline: 'none', colorScheme: 'dark' }} />
              </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ color: '#a1a1aa', fontSize: '13px', fontWeight: 'bold' }}>Fin:</label>
                <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} required style={{ flex: 1, padding: '12px', borderRadius: '4px', border: '1px solid #3f3f46', background: '#09090b', color: '#fff', outline: 'none', colorScheme: 'dark' }} />
              </div>
              <button type="submit" style={{ padding: '12px 24px', background: '#a3e635', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                Crear Torneo
              </button>
            </div>

          </form>
        </div>
      )}

      {/* GRILLA DE TORNEOS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
        {tournaments.map((t: any) => (
          <div key={t.id} style={{ background: '#18181b', borderRadius: '8px', border: '1px solid #27272a', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: '#27272a', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ background: '#09090b', color: '#a3e635', padding: '4px 8px', fontSize: '12px', fontWeight: 'bold', borderRadius: '4px', border: '1px solid #3f3f46' }}>
                {t.category}
              </span>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: t.state === 'INSCRIPCION_ABIERTA' ? '#4ade80' : '#ef4444', textTransform: 'uppercase' }}>
                {t.state === 'INSCRIPCION_ABIERTA' ? '● Inscripciones Abiertas' : '● Torneo en Curso'}
              </span>
            </div>
            <div style={{ padding: '20px', flex: 1 }}>
              <h2 style={{ margin: '0 0 10px 0', fontSize: '20px', fontWeight: 'bold', textTransform: 'uppercase' }}>{t.name}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <p style={{ margin: 0, color: '#a1a1aa', fontSize: '13px' }}><strong>Modalidad:</strong> {t.modality || 'Dobles'}</p>
                {t.startDate && <p style={{ margin: 0, color: '#a1a1aa', fontSize: '13px' }}><strong>Inicio:</strong> {new Date(t.startDate).toLocaleDateString()}</p>}
              </div>
            </div>
            <div style={{ padding: '15px 20px', borderTop: '1px solid #27272a', background: '#09090b', display: 'flex', gap: '10px' }}>
              <Link to={`/tournaments/${t.id}`} style={{ flex: 1, display: 'block', textAlign: 'center', background: '#a3e635', color: '#000', textDecoration: 'none', padding: '10px', borderRadius: '4px', fontWeight: 'bold', fontSize: '14px' }}>
                VER DETALLES
              </Link>
              {isAdmin && (
                <button onClick={() => handleDelete(t.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Eliminar Torneo">
                  X
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}