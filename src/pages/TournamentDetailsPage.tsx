import { useEffect, useState, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getToken, getUser } from '../api';
import { API_URL } from '../api';

export function TournamentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [partnerDni, setPartnerDni] = useState(''); 
  
  // Tabs Navigation
  const [activeMainTab, setActiveMainTab] = useState<'INFO' | 'FIXTURE'>('INFO');
  const [activeZoneTab, setActiveZoneTab] = useState<string>('');
  const [fixtureView, setFixtureView] = useState<'ZONAS' | 'CUADRO'>('ZONAS');

  // Admin States
  const [adminP1Dni, setAdminP1Dni] = useState('');
  const [adminP2Dni, setAdminP2Dni] = useState('');
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [courtInput, setCourtInput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [timeInput, setTimeInput] = useState('');
  const [scoreInput, setScoreInput] = useState('');
  const [winnerInput, setWinnerInput] = useState('');
  

  // Edición de Torneo
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', category: '', modality: '', startDate: '', endDate: '' });

  const currentUser = getUser();
  const isAdmin = currentUser?.role === 'ADMIN';

  function fetchTournament() {
    fetch(`${API_URL}/tournaments/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
      .then(res => res.json())
      .then(data => {
        setTournament(data);
        
        setEditForm({
          name: data.name,
          category: data.category,
          modality: data.modality || '',
          startDate: data.startDate ? new Date(data.startDate).toISOString().slice(0, 16) : '',
          endDate: data.endDate ? new Date(data.endDate).toISOString().slice(0, 16) : ''
        });

        if (!activeZoneTab && data.registrations) {
          const zones = Array.from(new Set(data.registrations.map((r: any) => r.zone).filter(Boolean))).sort();
          if (zones.length > 0) {
            setActiveZoneTab(zones[0] as string);
            setActiveMainTab('FIXTURE'); 
          }
        }
        setLoading(false);
      })
      .catch(err => { console.error(err); setLoading(false); });
  }

  useEffect(() => { fetchTournament(); }, [id]);

  async function handleUpdateTournament(e: FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/tournaments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify(editForm)
      });
      if (!res.ok) throw new Error('Error al actualizar el torneo');
      setIsEditing(false);
      fetchTournament();
    } catch (error: any) { alert(error.message); }
  }

  async function handleCloseInscriptions() {
    if (!window.confirm('¿Cerrar inscripciones?')) return;
    try {
      await fetch(`${API_URL}/tournaments/${id}/close-inscriptions`, { method: 'PATCH', headers: { 'Authorization': `Bearer ${getToken()}` } });
      fetchTournament();
    } catch (error) {}
  }

  async function handleGenerateZones() {
    if (!window.confirm('¿Generar zonas?')) return;
    try {
      await fetch(`${API_URL}/tournaments/${id}/generate-zones`, { method: 'POST', headers: { 'Authorization': `Bearer ${getToken()}` } });
      fetchTournament();
    } catch (error: any) { alert(error.message); }
  }

  async function handleGenerateMatches() {
    if (!window.confirm('¿Generar partidos?')) return;
    try {
      await fetch(`${API_URL}/tournaments/${id}/generate-matches`, { method: 'POST', headers: { 'Authorization': `Bearer ${getToken()}` } });
      fetchTournament();
    } catch (error: any) { alert(error.message); }
  }

  async function handleGeneratePlayoffs() {
    if (!window.confirm('¿Generar Llave Campeonato?')) return;
    try {
      await fetch(`${API_URL}/tournaments/${id}/generate-playoffs`, { method: 'POST', headers: { 'Authorization': `Bearer ${getToken()}` } });
      fetchTournament();
      setFixtureView('CUADRO');
    } catch (error: any) { alert(error.message); }
  }

  async function handleAdminRegister(e: FormEvent) {
    e.preventDefault();
    if (!adminP1Dni.trim() || !adminP2Dni.trim()) return;
    try {
      const res = await fetch(`${API_URL}/tournaments/${id}/admin-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ player1Dni: adminP1Dni, player2Dni: adminP2Dni })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al inscribir');
      }
      setAdminP1Dni(''); setAdminP2Dni('');
      fetchTournament();
    } catch (error: any) { alert(error.message); }
  }

  const handleUserRegistration = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    const token = localStorage.getItem('token'); // O la forma en que obtengas tu token
    
    // Cambia el final de la URL si tu backend usa otra ruta para inscribirse
    const response = await fetch(`${API_URL}/registrations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      // Solo enviamos el DNI del compañero. El backend saca tus datos del Token.
      body: JSON.stringify({ partnerDni }) 
    });

    if (response.ok) {
      alert('¡Inscripción exitosa! Ya están en el torneo.');
      setPartnerDni('');
      // Aquí puedes recargar los datos del torneo si tienes una función para eso
    } else {
      const errorData = await response.json();
      alert(`Error al inscribirse: ${errorData.message || 'Inténtalo de nuevo'}`);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error de conexión con el servidor.');
  }
};

  async function handleSaveResult(matchId: string) {
    try {
      const res = await fetch(`${API_URL}/tournaments/${id}/matches/${matchId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ 
          score: scoreInput || undefined, 
          winnerId: winnerInput || undefined, 
          courtId: courtInput || undefined, 
          date: dateInput || undefined, 
          startTime: timeInput || undefined 
        })
      });
      if (!res.ok) throw new Error('Error al guardar');
      setEditingMatchId(null); 
      setScoreInput(''); 
      setWinnerInput('');
      fetchTournament();
    } catch (error) { alert('Error al guardar'); }
  }

  function calculateStats(teamId: string, matches: any[]) {
    let stats = { pj: 0, pg: 0, pp: 0, sf: 0, sc: 0, gf: 0, gc: 0, pts: 0 };
    matches.forEach(m => {
      if (m.state !== 'FINALIZADO' || (m.teamAId !== teamId && m.teamBId !== teamId)) return;
      stats.pj += 1;
      const isTeamA = m.teamAId === teamId;
      const isWinner = m.winnerId === teamId;
      if (isWinner) { stats.pg += 1; stats.pts += 2; } 
      else { stats.pp += 1; stats.pts += 1; }
      
      if (m.score) {
        m.score.trim().split(/\s+/).forEach((set: string) => {
          const games = set.split(/[\/-]/);
          if (games.length === 2) {
            const gA = parseInt(games[0]) || 0; const gB = parseInt(games[1]) || 0;
            if (isTeamA) { stats.gf += gA; stats.gc += gB; if (gA > gB) stats.sf += 1; if (gA < gB) stats.sc += 1; } 
            else { stats.gf += gB; stats.gc += gA; if (gB > gA) stats.sf += 1; if (gB < gA) stats.sc += 1; }
          }
        });
      }
    });
    return stats;
  }

  if (loading) return <div style={{ background: '#09090b', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#a3e635' }}>Cargando...</div>;
  if (!tournament) return <div style={{ background: '#09090b', minHeight: '100vh', color: '#fff', padding: '20px' }}>Torneo no encontrado.</div>;

  const isClosed = tournament.state === 'INSCRIPCION_CERRADA';
  const zonesList = Array.from(new Set((tournament.registrations || []).map((r: any) => r.zone).filter(Boolean))).sort();
  const allPlayoffs = tournament.matches?.filter((m: any) => m.round !== 'FASE_GRUPOS') || [];

  return (
    <div style={{ background: '#09090b', minHeight: '100vh', color: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      
      <div style={{ background: 'linear-gradient(180deg, #1e293b 0%, #09090b 100%)', padding: '40px 20px 0 20px', borderBottom: '1px solid #27272a' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', color: '#a3e635', border: 'none', cursor: 'pointer', fontSize: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            ← VOLVER
          </button>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ background: '#a3e635', color: '#000', padding: '4px 8px', fontSize: '12px', fontWeight: 'bold', borderRadius: '4px' }}>
              CATEGORÍA {tournament.category}
            </span>
          </div>
          
          <h1 style={{ fontSize: '48px', fontWeight: '900', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '-1px' }}>
            {tournament.name}
          </h1>
          <p style={{ color: '#a1a1aa', margin: '0 0 30px 0', fontSize: '16px' }}>
            {tournament.modality} • Inicio: {new Date(tournament.startDate).toLocaleDateString()}
          </p>

          <div style={{ display: 'flex', gap: '30px' }}>
            {['INFO', 'FIXTURE'].map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveMainTab(tab as any)}
                style={{ background: 'none', border: 'none', color: activeMainTab === tab ? '#a3e635' : '#a1a1aa', fontSize: '14px', fontWeight: 'bold', padding: '10px 0', cursor: 'pointer', borderBottom: activeMainTab === tab ? '3px solid #a3e635' : '3px solid transparent', transition: 'all 0.2s' }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px' }}>
        
        {/* TAB: INFO */}
        {activeMainTab === 'INFO' && (
          <div style={{ display: 'grid', gap: '20px' }}>
            {isAdmin && (
              <div style={{ background: '#18181b', padding: '20px', borderRadius: '8px', border: '1px solid #27272a', borderLeft: '4px solid #a3e635' }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#a3e635', fontSize: '16px' }}>⚙️ Panel de Control Admin</h3>
                
                {isEditing ? (
                  <div style={{ background: '#09090b', padding: '15px', borderRadius: '6px', border: '1px solid #27272a', marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 15px 0', color: '#f8fafc', fontSize: '14px' }}>Editar Información del Torneo</h4>
                    <form onSubmit={handleUpdateTournament} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <input type="text" placeholder="Nombre del Torneo" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #3f3f46', background: '#27272a', color: '#fff', outline: 'none' }} />
                      
                      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                        <select value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #3f3f46', background: '#27272a', color: '#fff', outline: 'none' }}>
                          <option value="PRIMERA">Primera</option>
                          <option value="SEGUNDA">Segunda</option>
                          <option value="TERCERA">Tercera</option>
                          <option value="CUARTA">Cuarta</option>
                          <option value="QUINTA">Quinta</option>
                          <option value="SEXTA">Sexta</option>
                          <option value="SEPTIMA">Séptima</option>
                          <option value="OCTAVA">Octava</option>
                        </select>
                        <input type="text" placeholder="Modalidad (Ej: Dobles Femenino)" value={editForm.modality} onChange={e => setEditForm({...editForm, modality: e.target.value})} required style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #3f3f46', background: '#27272a', color: '#fff', outline: 'none' }} />
                      </div>

                      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <label style={{ fontSize: '12px', color: '#a1a1aa', marginBottom: '5px' }}>Fecha de Inicio</label>
                          <input type="datetime-local" value={editForm.startDate} onChange={e => setEditForm({...editForm, startDate: e.target.value})} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #3f3f46', background: '#27272a', color: '#fff', outline: 'none', colorScheme: 'dark' }} />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <label style={{ fontSize: '12px', color: '#a1a1aa', marginBottom: '5px' }}>Fecha de Fin</label>
                          <input type="datetime-local" value={editForm.endDate} onChange={e => setEditForm({...editForm, endDate: e.target.value})} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #3f3f46', background: '#27272a', color: '#fff', outline: 'none', colorScheme: 'dark' }} />
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button type="submit" style={{ flex: 1, padding: '10px', background: '#a3e635', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Guardar Cambios</button>
                        <button type="button" onClick={() => setIsEditing(false)} style={{ flex: 1, padding: '10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Cancelar</button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
                    <button onClick={() => setIsEditing(true)} style={{ padding: '8px 16px', background: '#3f3f46', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Editar Torneo</button>
                    {!isClosed && <button onClick={handleCloseInscriptions} style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Cerrar Inscripciones</button>}
                    {isClosed && (!tournament.registrations || !tournament.registrations.some((r: any) => r.zone)) && (
                      <button onClick={handleGenerateZones} style={{ padding: '8px 16px', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Generar Zonas</button>
                    )}
                    {isClosed && tournament.registrations?.some((r: any) => r.zone) && (!tournament.matches || !tournament.matches.some((m: any) => m.round === 'FASE_GRUPOS')) && (
                      <button onClick={handleGenerateMatches} style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Generar Partidos</button>
                    )}
                    {(() => {
                      const groupMatches = tournament.matches?.filter((m: any) => m.round === 'FASE_GRUPOS') || [];
                      const allFinished = groupMatches.length > 0 && groupMatches.every((m: any) => m.state === 'FINALIZADO');
                      const playoffsExist = tournament.matches?.some((m: any) => m.round !== 'FASE_GRUPOS');
                      if (allFinished && !playoffsExist) {
                        return <button onClick={handleGeneratePlayoffs} style={{ padding: '8px 16px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Generar Llave Campeonato</button>
                      }
                      return null;
                    })()}
                  </div>
                )}

                {!isClosed && (
                  <div style={{ padding: '15px', background: '#09090b', borderRadius: '6px', border: '1px solid #27272a' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#f8fafc', fontSize: '14px' }}>Inscripción Manual (Por DNI)</h4>
                    <form onSubmit={handleAdminRegister} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input type="text" placeholder="DNI Jugador 1" value={adminP1Dni} onChange={e => setAdminP1Dni(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #3f3f46', background: '#27272a', color: '#fff', outline: 'none' }} />
                      <span style={{ color: '#a1a1aa' }}>+</span>
                      <input type="text" placeholder="DNI Jugador 2" value={adminP2Dni} onChange={e => setAdminP2Dni(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #3f3f46', background: '#27272a', color: '#fff', outline: 'none' }} />
                      <button type="submit" style={{ padding: '10px 20px', background: '#a3e635', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Inscribir</button>
                    </form>
                  </div>
                )}
              </div>
            )}

            {!isAdmin && !isClosed && (
              <div style={{ padding: '20px', background: '#09090b', borderRadius: '8px', border: '1px solid #27272a', marginTop: '20px' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#f8fafc', fontSize: '16px', textAlign: 'center' }}>
                  🎾 Inscribir a mi pareja
                </h4>
                
                <form onSubmit={handleUserRegistration} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: '#a1a1aa', marginBottom: '5px', display: 'block' }}>
                      DNI de tu compañero/a
                    </label>
                    <input 
                      type="text" 
                      placeholder="Ej: 35123456" 
                      value={partnerDni} 
                      onChange={e => setPartnerDni(e.target.value)} 
                      required 
                      style={{ 
                        width: '100%', 
                        padding: '12px', 
                        borderRadius: '6px', 
                        border: '1px solid #3f3f46', 
                        background: '#27272a', 
                        color: '#fff', 
                        outline: 'none',
                        boxSizing: 'border-box'
                      }} 
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    style={{ 
                      width: '100%', 
                      padding: '15px', 
                      background: '#a3e635', 
                      color: '#000', 
                      border: 'none', 
                      borderRadius: '6px', 
                      cursor: 'pointer', 
                      fontWeight: 'bold', 
                      fontSize: '15px',
                      textTransform: 'uppercase'
                    }}
                  >
                    Confirmar Inscripción
                  </button>
                </form>
              </div>
            )}

            <div style={{ background: '#18181b', padding: '20px', borderRadius: '8px', border: '1px solid #27272a' }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#f8fafc' }}>Equipos Inscritos ({tournament.registrations?.length || 0})</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '10px' }}>
                {tournament.registrations?.map((reg: any) => (
                  <div key={reg.id} style={{ background: '#09090b', padding: '15px', borderRadius: '6px', border: '1px solid #27272a', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{reg.team.player1.lastName} / {reg.team.player2.lastName}</div>
                      <div style={{ fontSize: '12px', color: '#a1a1aa', marginTop: '4px' }}>Seed #{reg.seed} {reg.zone && `• Zona ${reg.zone}`}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: FIXTURE */}
        {activeMainTab === 'FIXTURE' && (
          <div>
            <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid #27272a', marginBottom: '20px' }}>
              <button onClick={() => setFixtureView('ZONAS')} style={{ background: 'none', border: 'none', color: fixtureView === 'ZONAS' ? '#a3e635' : '#a1a1aa', fontWeight: 'bold', fontSize: '12px', padding: '10px 0', borderBottom: fixtureView === 'ZONAS' ? '2px solid #a3e635' : '2px solid transparent', cursor: 'pointer' }}>FASE DE GRUPOS</button>
              {allPlayoffs.length > 0 && (
                <button onClick={() => setFixtureView('CUADRO')} style={{ background: 'none', border: 'none', color: fixtureView === 'CUADRO' ? '#a3e635' : '#a1a1aa', fontWeight: 'bold', fontSize: '12px', padding: '10px 0', borderBottom: fixtureView === 'CUADRO' ? '2px solid #a3e635' : '2px solid transparent', cursor: 'pointer' }}>LLAVE CAMPEONATO</button>
              )}
            </div>

            {fixtureView === 'ZONAS' && zonesList.length > 0 && (
              <div style={{ background: '#18181b', borderRadius: '8px', border: '1px solid #27272a', overflow: 'hidden' }}>
                <div style={{ display: 'flex', background: '#09090b', padding: '0 20px', borderBottom: '1px solid #27272a' }}>
                  {zonesList.map((z: any) => (
                    <button key={z} onClick={() => setActiveZoneTab(z)} style={{ background: 'none', border: 'none', color: activeZoneTab === z ? '#a3e635' : '#a1a1aa', fontWeight: 'bold', fontSize: '13px', padding: '15px 20px', borderBottom: activeZoneTab === z ? '2px solid #a3e635' : '2px solid transparent', cursor: 'pointer' }}>
                      GRUPO {z}
                    </button>
                  ))}
                </div>

                <div style={{ padding: '20px', overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'center' }}>
                    <thead>
                      <tr style={{ color: '#52525b', borderBottom: '1px solid #27272a', textTransform: 'uppercase' }}>
                        <th style={{ padding: '10px', textAlign: 'left' }}>#</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Pareja</th>
                        <th>PJ</th><th>PG</th><th>PP</th><th style={{ color: '#a3e635' }}>PTS</th>
                        <th>SF</th><th>SC</th><th>DS</th><th>GF</th><th>GC</th><th>DG</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const teamsInZone = tournament.registrations.filter((r: any) => r.zone === activeZoneTab);
                        const zoneMatches = (tournament.matches || []).filter((m: any) => m.round === 'FASE_GRUPOS' && teamsInZone.some((t:any) => t.team.id === m.teamAId || t.team.id === m.teamBId));
                        const rankedTeams = [...teamsInZone].map(reg => ({ ...reg, stats: calculateStats(reg.team.id, zoneMatches) }))
                                            .sort((a, b) => b.stats.pts - a.stats.pts || (b.stats.sf - b.stats.sc) - (a.stats.sf - a.stats.sc));
                        
                        return rankedTeams.map((reg: any, i: number) => (
                          <tr key={reg.id} style={{ borderBottom: '1px solid #27272a', background: i < 2 ? 'rgba(163, 230, 53, 0.05)' : 'transparent' }}>
                            <td style={{ padding: '12px', textAlign: 'left', color: '#a3e635', fontWeight: 'bold' }}>{i + 1}</td>
                            <td style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#f8fafc' }}>
                              {reg.team.player1.lastName} / {reg.team.player2.lastName}
                            </td>
                            <td style={{ color: '#a1a1aa' }}>{reg.stats.pj}</td><td style={{ color: '#a1a1aa' }}>{reg.stats.pg}</td><td style={{ color: '#a1a1aa' }}>{reg.stats.pp}</td>
                            <td style={{ color: '#a3e635', fontWeight: 'bold' }}>{reg.stats.pts}</td>
                            <td style={{ color: '#a1a1aa' }}>{reg.stats.sf}</td><td style={{ color: '#a1a1aa' }}>{reg.stats.sc}</td>
                            <td style={{ color: reg.stats.sf - reg.stats.sc > 0 ? '#4ade80' : reg.stats.sf - reg.stats.sc < 0 ? '#ef4444' : '#a1a1aa' }}>{reg.stats.sf - reg.stats.sc > 0 ? `+${reg.stats.sf - reg.stats.sc}` : reg.stats.sf - reg.stats.sc}</td>
                            <td style={{ color: '#a1a1aa' }}>{reg.stats.gf}</td><td style={{ color: '#a1a1aa' }}>{reg.stats.gc}</td>
                            <td style={{ color: reg.stats.gf - reg.stats.gc > 0 ? '#4ade80' : reg.stats.gf - reg.stats.gc < 0 ? '#ef4444' : '#a1a1aa' }}>{reg.stats.gf - reg.stats.gc > 0 ? `+${reg.stats.gf - reg.stats.gc}` : reg.stats.gf - reg.stats.gc}</td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>

                <div style={{ background: '#09090b', padding: '20px', borderTop: '1px solid #27272a' }}>
                  <h4 style={{ margin: '0 0 15px 0', fontSize: '13px', color: '#a1a1aa', textTransform: 'uppercase' }}>Partidos Programados - Grupo {activeZoneTab}</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '15px' }}>
                    {(() => {
                      const teamsInZoneIds = tournament.registrations.filter((r: any) => r.zone === activeZoneTab).map((r:any) => r.teamId);
                      const matches = (tournament.matches || []).filter((m: any) => m.round === 'FASE_GRUPOS' && teamsInZoneIds.includes(m.teamAId));
                      
                      return matches.map((match: any) => (
                        <div key={match.id} style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '6px', padding: '15px' }}>
                           {editingMatchId === match.id ? (
                              <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                                  <input type="date" value={dateInput} onChange={e => setDateInput(e.target.value)} style={{ flex: 1, padding: '8px', background: '#09090b', color: '#fff', border: '1px solid #3f3f46', borderRadius: '4px' }} />
                                  <input type="time" value={timeInput} onChange={e => setTimeInput(e.target.value)} style={{ flex: 1, padding: '8px', background: '#09090b', color: '#fff', border: '1px solid #3f3f46', borderRadius: '4px' }} />
                                  <select value={courtInput} onChange={e => setCourtInput(e.target.value)} style={{ flex: 1, padding: '8px', background: '#09090b', color: '#fff', border: '1px solid #3f3f46', borderRadius: '4px' }}>
                                    <option value="">Cancha...</option>
                                    {tournament.clubs?.[0]?.courts?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                  </select>
                                </div>
                                <input type="text" placeholder="Ej: 6/4 7/6" value={scoreInput} onChange={e => setScoreInput(e.target.value)} style={{ padding: '8px', background: '#09090b', border: '1px solid #3f3f46', color: '#fff', borderRadius: '4px' }} />
                                <select value={winnerInput} onChange={e => setWinnerInput(e.target.value)} style={{ padding: '8px', background: '#09090b', border: '1px solid #3f3f46', color: '#fff', borderRadius: '4px' }}>
                                  <option value="">Ganador...</option>
                                  <option value={match.teamA?.id}>{match.teamA?.player1?.lastName} / {match.teamA?.player2?.lastName}</option>
                                  <option value={match.teamB?.id}>{match.teamB?.player1?.lastName} / {match.teamB?.player2?.lastName}</option>
                                </select>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                  <button onClick={() => handleSaveResult(match.id)} style={{ flex: 1, padding: '8px', background: '#a3e635', border: 'none', color: '#000', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Guardar</button>
                                  <button onClick={() => setEditingMatchId(null)} style={{ flex: 1, padding: '8px', background: '#3f3f46', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div style={{ fontSize: '11px', color: '#a3e635', marginBottom: '8px', textTransform: 'uppercase' }}>
                                  📅 {match.date ? new Date(match.date).toLocaleDateString() : 'Sin Fecha'} • 🕒 {match.startTime || 'TBD'} • 🏟️ {match.court?.name || 'Cancha TBD'}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: match.winnerId === match.teamA?.id ? '#ea580c' : '#f8fafc' }}>
                                      <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{match.teamA?.player1?.lastName} / {match.teamA?.player2?.lastName}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: match.winnerId === match.teamB?.id ? '#ea580c' : '#f8fafc' }}>
                                      <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{match.teamB?.player1?.lastName} / {match.teamB?.player2?.lastName}</span>
                                    </div>
                                  </div>
                                  <div style={{ background: '#09090b', padding: '10px', borderRadius: '4px', marginLeft: '15px', color: '#a3e635', fontWeight: 'bold', fontSize: '14px', border: '1px solid #27272a', minWidth: '60px', textAlign: 'center' }}>
                                    {match.score ? match.score : 'vs'}
                                  </div>
                                  {isAdmin && match.state !== 'FINALIZADO' && (
                                    <button onClick={() => { 
                                      setEditingMatchId(match.id); 
                                      setScoreInput(match.score || ''); 
                                      setWinnerInput(match.winnerId || ''); 
                                      setCourtInput(match.courtId || '');
                                      setDateInput(match.date ? new Date(match.date).toISOString().split('T')[0] : '');
                                      setTimeInput(match.startTime || '');
                                    }} style={{ marginLeft: '10px', padding: '6px 12px', background: '#3f3f46', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Editar</button>
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            )}

            {fixtureView === 'CUADRO' && (
              <div style={{ display: 'flex', gap: '40px', overflowX: 'auto', padding: '20px 0' }}>
                {['CUARTOS', 'SEMIFINAL', 'FINAL'].map(round => {
                  const roundMatches = allPlayoffs.filter((m: any) => m.round === round);
                  if (roundMatches.length === 0) return null;
                  
                  return (
                    <div key={round} style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: '320px' }}>
                      <h4 style={{ color: '#ea580c', textAlign: 'center', margin: '0 0 10px 0', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>{round}</h4>
                      
                      {roundMatches.map((match: any) => (
                        <div key={match.id} style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', padding: '15px', position: 'relative' }}>
                          
                          {editingMatchId === match.id ? (
                            <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                              <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                                <input type="date" value={dateInput} onChange={e => setDateInput(e.target.value)} style={{ flex: 1, padding: '8px', background: '#09090b', color: '#fff', border: '1px solid #3f3f46', borderRadius: '4px' }} />
                                <input type="time" value={timeInput} onChange={e => setTimeInput(e.target.value)} style={{ flex: 1, padding: '8px', background: '#09090b', color: '#fff', border: '1px solid #3f3f46', borderRadius: '4px' }} />
                                <select value={courtInput} onChange={e => setCourtInput(e.target.value)} style={{ flex: 1, padding: '8px', background: '#09090b', color: '#fff', border: '1px solid #3f3f46', borderRadius: '4px' }}>
                                  <option value="">Cancha...</option>
                                  {tournament.clubs?.[0]?.courts?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                              </div>

                              <input type="text" placeholder="Ej: 6/4 7/6" value={scoreInput} onChange={e => setScoreInput(e.target.value)} style={{ padding: '8px', background: '#09090b', border: '1px solid #3f3f46', color: '#fff', borderRadius: '4px' }} />
                              <select value={winnerInput} onChange={e => setWinnerInput(e.target.value)} style={{ padding: '8px', background: '#09090b', border: '1px solid #3f3f46', color: '#fff', borderRadius: '4px' }}>
                                <option value="">Ganador...</option>
                                <option value={match.teamA?.id}>{match.teamA?.player1?.lastName} / {match.teamA?.player2?.lastName}</option>
                                <option value={match.teamB?.id}>{match.teamB?.player1?.lastName} / {match.teamB?.player2?.lastName}</option>
                              </select>
                              
                              <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={() => handleSaveResult(match.id)} style={{ flex: 1, padding: '8px', background: '#a3e635', border: 'none', color: '#000', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Guardar</button>
                                <button onClick={() => setEditingMatchId(null)} style={{ flex: 1, padding: '8px', background: '#3f3f46', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div style={{ fontSize: '11px', color: '#a3e635', marginBottom: '8px', textTransform: 'uppercase' }}>
                                📅 {match.date ? new Date(match.date).toLocaleDateString() : 'Sin Fecha'} • 🕒 {match.startTime || 'TBD'} • 🏟️ {match.court?.name || 'Cancha TBD'}
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid #27272a', marginBottom: '10px' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '14px', color: match.winnerId === match.teamA?.id ? '#ea580c' : '#f8fafc' }}>
                                  {match.teamA?.player1?.lastName} / {match.teamA?.player2?.lastName}
                                </span>
                                {match.score && (
                                  <div style={{ display: 'flex', gap: '4px' }}>
                                    {match.score.split(' ').map((set: string, idx: number) => {
                                      const g = set.split(/[\/-]/);
                                      return <div key={idx} style={{ background: '#27272a', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', color: '#fff' }}>{g[0] || 0}</div>;
                                    })}
                                  </div>
                                )}
                              </div>
                              
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '14px', color: match.winnerId === match.teamB?.id ? '#ea580c' : '#f8fafc' }}>
                                  {match.teamB?.player1?.lastName} / {match.teamB?.player2?.lastName}
                                </span>
                                {match.score && (
                                  <div style={{ display: 'flex', gap: '4px' }}>
                                    {match.score.split(' ').map((set: string, idx: number) => {
                                      const g = set.split(/[\/-]/);
                                      return <div key={idx} style={{ background: '#27272a', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', color: '#fff' }}>{g[1] || 0}</div>;
                                    })}
                                  </div>
                                )}
                              </div>

                              {isAdmin && match.state !== 'FINALIZADO' && (
                                <button onClick={() => { 
                                  setEditingMatchId(match.id); 
                                  setScoreInput(match.score || ''); 
                                  setWinnerInput(match.winnerId || ''); 
                                  setCourtInput(match.courtId || '');
                                  setDateInput(match.date ? new Date(match.date).toISOString().split('T')[0] : '');
                                  setTimeInput(match.startTime || '');
                                }} style={{ position: 'absolute', top: '15px', right: '15px', padding: '4px 8px', background: '#3f3f46', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Editar</button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}