import { useEffect, useState } from 'react';
import { getToken, getUser } from '../api';
import { Link } from 'react-router-dom';
import { API_URL } from '../api';

export function ProfilePage() {
  const [activity, setActivity] = useState<{ user: any; tournaments: any[]; matches: any[] }>({ user: null, tournaments: [], matches: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'TOURNAMENTS' | 'MATCHES'>('TOURNAMENTS');
  
  const localUser = getUser();

  useEffect(() => {
    fetch(`${API_URL}/tournaments/my/activity`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })
      .then(res => res.json())
      .then(data => {
        setActivity(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div style={{ background: '#09090b', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#a3e635' }}>Cargando tu perfil...</div>;
  }

  // Usamos los datos de la BD si están disponibles, sino caemos en el fallback del localStorage
  const currentUser = activity.user || localUser;

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', color: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Cabecera del Perfil */}
      <div style={{ background: '#18181b', padding: '30px', borderRadius: '8px', border: '1px solid #27272a', marginBottom: '30px', borderLeft: '4px solid #a3e635' }}>
        <h1 style={{ margin: '0 0 5px 0', fontSize: '28px', textTransform: 'uppercase' }}>
          {currentUser?.name} {currentUser?.lastName || ''}
        </h1>
        <p style={{ margin: 0, color: '#a1a1aa', fontSize: '14px' }}>
          {currentUser?.email} • Nivel: <strong style={{ color: '#a3e635' }}>{currentUser?.level || 'No especificado'}</strong> {currentUser?.role === 'ADMIN' && '• (Administrador)'}
        </p>
      </div>

      {/* Selector de pestañas */}
      <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid #27272a', marginBottom: '30px' }}>
        <button 
          onClick={() => setActiveTab('TOURNAMENTS')}
          style={{ background: 'none', border: 'none', color: activeTab === 'TOURNAMENTS' ? '#a3e635' : '#a1a1aa', fontWeight: 'bold', fontSize: '14px', padding: '12px 0', borderBottom: activeTab === 'TOURNAMENTS' ? '2px solid #a3e635' : '2px solid transparent', cursor: 'pointer' }}
        >
          🏆 Mis Torneos ({activity.tournaments.length})
        </button>
        <button 
          onClick={() => setActiveTab('MATCHES')}
          style={{ background: 'none', border: 'none', color: activeTab === 'MATCHES' ? '#a3e635' : '#a1a1aa', fontWeight: 'bold', fontSize: '14px', padding: '12px 0', borderBottom: activeTab === 'MATCHES' ? '2px solid #a3e635' : '2px solid transparent', cursor: 'pointer' }}
        >
          🎾 Mis Partidos ({activity.matches.length})
        </button>
      </div>

      {/* Contenido: Mis Torneos */}
      {activeTab === 'TOURNAMENTS' && (
        <div>
          {activity.tournaments.length === 0 ? (
            <p style={{ color: '#a1a1aa' }}>Todavía no estás inscrito en ningún torneo.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {activity.tournaments.map((t: any) => (
                <div key={t.id} style={{ background: '#18181b', borderRadius: '8px', border: '1px solid #27272a', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ background: '#09090b', color: '#a3e635', padding: '4px 8px', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px', border: '1px solid #3f3f46' }}>
                      {t.category}
                    </span>
                    <h3 style={{ margin: '15px 0 10px 0', fontSize: '18px', textTransform: 'uppercase' }}>{t.name}</h3>
                    <p style={{ color: '#a1a1aa', fontSize: '13px', margin: '0 0 5px 0' }}><strong>Modalidad:</strong> {t.modality}</p>
                    {t.zone && <p style={{ color: '#a3e635', fontSize: '13px', margin: '0 0 15px 0' }}><strong>Zona asignada:</strong> Grupo {t.zone} (Seed #{t.seed})</p>}
                  </div>
                  <Link to={`/tournaments/${t.id}`} style={{ display: 'block', textAlign: 'center', background: '#27272a', color: '#fff', textDecoration: 'none', padding: '10px', borderRadius: '4px', fontWeight: 'bold', fontSize: '13px', border: '1px solid #3f3f46' }}>
                    VER DETALLES
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Contenido: Mis Partidos */}
      {activeTab === 'MATCHES' && (
        <div>
          {activity.matches.length === 0 ? (
            <p style={{ color: '#a1a1aa' }}>No hay partidos programados todavía.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {activity.matches.map((m: any) => {
                const isTeamAUser = m.teamA?.player1Id === currentUser?.id || m.teamA?.player2Id === currentUser?.id;
                const myTeam = isTeamAUser ? m.teamA : m.teamB;
                const rivalTeam = isTeamAUser ? m.teamB : m.teamA;

                return (
                  <div key={m.id} style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    <div style={{ flex: 1, minWidth: '250px' }}>
                      <div style={{ fontSize: '11px', color: '#a3e635', marginBottom: '6px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                        📅 {m.date ? new Date(m.date).toLocaleDateString() : 'Fecha a confirmar'} • 🕒 {m.startTime || 'TBD'} • 🏟️ {m.court?.name || 'Cancha TBD'}
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#f8fafc' }}>
                        {myTeam?.player1?.lastName} / {myTeam?.player2?.lastName} <span style={{ color: '#a1a1aa', fontWeight: 'normal' }}>vs</span> {rivalTeam ? `${rivalTeam.player1?.lastName} / ${rivalTeam.player2?.lastName}` : 'Por definir'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#a1a1aa', marginTop: '4px' }}>
                        Instancia: {m.round.replace('_', ' ')} • Estado: <strong style={{ color: m.state === 'FINALIZADO' ? '#4ade80' : '#f59e0b' }}>{m.state}</strong>
                      </div>
                    </div>
                    
                    <div style={{ background: '#09090b', padding: '12px 20px', borderRadius: '6px', color: '#a3e635', fontWeight: 'bold', fontSize: '16px', border: '1px solid #27272a', minWidth: '80px', textAlign: 'center' }}>
                      {m.score ? m.score : 'vs'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}