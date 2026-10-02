import { useEffect, useState } from 'react';
import { API_URL } from '../api';

const ROUNDS = ['OCTAVOS', 'CUARTOS', 'SEMIFINAL', 'FINAL'] as const;

// Helper para evitar errores si un equipo está vacío
const teamLabel = (team: any) => team && team.player1 ? `${team.player1.lastName} / ${team.player2.lastName}` : 'TBD';

function RoundColumn({ title, matches }: { title: string; matches: any[] }) {
  const boxes = matches.length > 0 ? matches : [{ id: `${title}-empty` }];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', minWidth: '220px' }}>
      <h3 style={{ color: '#ea580c', textAlign: 'center', margin: '0 0 10px 0', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</h3>
      {boxes.map((match) => (
        <div key={match.id} style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '6px', padding: '10px' }}>
          <div style={{ padding: '5px', borderRadius: '4px', marginBottom: '4px', color: match.winnerId && match.winnerId === match.teamA?.id ? '#a3e635' : '#f8fafc', fontWeight: match.winnerId && match.winnerId === match.teamA?.id ? 'bold' : 'normal', background: match.winnerId && match.winnerId === match.teamA?.id ? 'rgba(163, 230, 53, 0.1)' : 'transparent' }}>
            {teamLabel(match.teamA)}
          </div>
          <div style={{ padding: '5px', borderRadius: '4px', color: match.winnerId && match.winnerId === match.teamB?.id ? '#a3e635' : '#f8fafc', fontWeight: match.winnerId && match.winnerId === match.teamB?.id ? 'bold' : 'normal', background: match.winnerId && match.winnerId === match.teamB?.id ? 'rgba(163, 230, 53, 0.1)' : 'transparent' }}>
            {teamLabel(match.teamB)}
          </div>
        </div>
      ))}
    </div>
  );
}

export function BracketPage() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [detail, setDetail] = useState<any | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/tournaments`)
      .then(res => res.json())
      .then((items) => {
        const list = Array.isArray(items) ? items : items.tournaments || [];
        setTournaments(list);
        if (list.length > 0) setSelectedId(list[0].id);
      }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    fetch(`${API_URL}/tournaments/${selectedId}`)
      .then(res => res.json())
      .then(setDetail).catch(() => {});
  }, [selectedId]);

  const matches = detail?.matches ?? [];

  return (
    <section style={{ maxWidth: '1000px', margin: '40px auto', padding: '20px', color: '#f8fafc' }}>
      <h1 style={{ fontSize: '32px', margin: '0 0 10px 0', textTransform: 'uppercase' }}>Cuadro <span style={{ color: '#a3e635' }}>Play-Off</span></h1>
      <p style={{ color: '#a1a1aa', marginBottom: '30px' }}>Visor global de llaves de campeonato.</p>
      
      {tournaments.length === 0 ? (
        <p style={{ color: '#ef4444' }}>Todavía no hay torneos registrados.</p>
      ) : (
        <div style={{ background: '#09090b', padding: '20px', borderRadius: '8px', border: '1px solid #27272a' }}>
          <label style={{ color: '#a1a1aa', fontSize: '12px', fontWeight: 'bold', marginRight: '10px' }}>SELECCIONAR TORNEO</label>
          <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #3f3f46', background: '#18181b', color: '#fff', outline: 'none', width: '300px' }}>
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
            ))}
          </select>

          <div style={{ display: 'flex', gap: '30px', overflowX: 'auto', marginTop: '40px', paddingBottom: '20px' }}>
            {ROUNDS.map((round) => (
              <RoundColumn
                key={round}
                title={round.replace('_', ' ')}
                matches={matches.filter((match: any) => match.round === round)}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}