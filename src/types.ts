export type Role = 'ADMIN' | 'ORGANIZER' | 'PLAYER';

export type PublicUser = {
  id: string;
  dni: string;
  email: string;
  name: string;
  lastName: string;
  phone: string | null;
  role: Role;
  categoryValue: number | null;
  rankingPoints: number;
};

export type AuthResponse = {
  accessToken: string;
  user: PublicUser;
};

export type Tournament = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  location: string | null;
  state: string;
  modality: string;
  categories?: { id: string; name: string }[];
  matches?: Match[];
};

export type Match = {
  id: string;
  round: string;
  state: string;
  date: string | null;
  startTime: string | null;
  score: string | null;
  tournament?: { name: string };
  category?: { name: string };
  court?: { name: string } | null;
  teamA?: TeamSummary | null;
  teamB?: TeamSummary | null;
  winnerId?: string | null;
};

export type TeamSummary = {
  id: string;
  player1?: { name: string; lastName: string };
  player2?: { name: string; lastName: string };
};

export function teamLabel(team?: TeamSummary | null) {
  if (!team?.player1 || !team?.player2) return 'A definir';
  return `${team.player1.lastName} / ${team.player2.lastName}`;
}
