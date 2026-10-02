import { useEffect, useState } from 'react';
import { API_URL } from '../api';

const teamLabel = (team: any) => team && team.player1 ? `${team.player1.lastName} / ${team.player2.lastName}` : 'TBD';

export function GroupsPage() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [detail, setDetail] = useState<any | null>(null);

  useEffect(() => {
    fetch('http://localhost:3000/api/tournaments')
      .then(res => res.json())
      .then((items) => {
        const list = Array.isArray(items) ? items : items.tournaments || [];
        setTournaments(list);
        if (list.length > 0) setSelectedId(list[0].id);
      }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    fetch(`http://localhost:3000/api/tournaments/${selectedId}`)
      .then(res => res.json())
      .then(setDetail).catch(() => {});
  }, [selectedId]);

  const groupMatches = (detail?.matches ?? []).filter((match: any) => match.round === 'FASE_GRUPOS');

  return (
    <section style={{ maxWidth: '1000px', margin: '40px auto', padding: '20px', color: '#f8fafc' }}>
      <h1 style={{ fontSize: '32px', margin: '0 0 10px 0', textTransform: 'uppercase' }}>Fase de <span style={{ color: '#a3e635' }}>Grupos</span></h1>
      <p style={{ color: '#a1a1aa', marginBottom: '30px' }}>Visor global de partidos de zonas.</p>
      
      {tournaments.length === 0 ? (
        <p style={{ color: '#ef4444' }}>No hay torneos registrados.</p>
      ) : (
        <div style={{ background: '#09090b', padding: '20px', borderRadius: '8px', border: '1px solid #27272a' }}>
          <label style={{ color: '#a1a1aa', fontSize: '12px', fontWeight: 'bold', marginRight: '10px' }}>SELECCIONAR TORNEO</label>
          <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #3f3f46', background: '#18181b', color: '#fff', outline: 'none', width: '300px', marginBottom: '20px' }}>
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
            ))}
          </select>
          
          <h2 style={{ marginTop: '20px', fontSize: '20px', borderBottom: '1px solid #27272a', paddingBottom: '10px' }}>{detail?.name}</h2>
          
          {groupMatches.length === 0 ? (
            <p style={{ color: '#a1a1aa', marginTop: '20px' }}>Este torneo todavía no tiene partidos de grupos generados.</p>
          ) : (
            <div style={{ overflowX: 'auto', marginTop: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#18181b', color: '#a1a1aa', textTransform: 'uppercase', fontSize: '12px' }}>
                    <th style={{ padding: '12px' }}>Pareja A</th>
                    <th style={{ padding: '12px' }}>Pareja B</th>
                    <th style={{ padding: '12px' }}>Estado</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Resultado</th>
                  </tr>
                </thead>
                <tbody>
                  {groupMatches.map((match: any, i: number) => (
                    <tr key={match.id} style={{ borderBottom: '1px solid #27272a', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                      <td style={{ padding: '12px', fontWeight: 'bold', color: match.winnerId === match.teamA?.id ? '#a3e635' : '#f8fafc' }}>
                        {teamLabel(match.teamA)}
                      </td>
                      <td style={{ padding: '12px', fontWeight: 'bold', color: match.winnerId === match.teamB?.id ? '#a3e635' : '#f8fafc' }}>
                        {teamLabel(match.teamB)}
                      </td>
                      <td style={{ padding: '12px', color: match.state === 'FINALIZADO' ? '#4ade80' : '#f59e0b' }}>
                        {match.state}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#ea580c' }}>
                        {match.score ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}