export interface User {
  id: number;
  username: string;
  name: string;
  photo_url: string;
  description: string;
  email?: string | undefined;
}

export interface Championship {
  id: number;
  name: string;
  type: 'pontos_corridos' | 'mata_mata';
  status: 'ativo' | 'finalizado';
  winner_id: number | null;
  players_count?: number;
  winner_name?: string;
  winner_photo?: string;
}

export interface Match {
  id: number;
  championship_id: number;
  round: number;
  home_user_id: number | null;
  away_user_id: number | null;
  home_score: number | null;
  away_score: number | null;
  played: boolean;
  next_match_id: number | null;
  home_name?: string;
  home_photo?: string;
  away_name?: string;
  away_photo?: string;
}

export interface PlayerStats {
  id: number;
  username: string;
  name: string;
  photo_url: string;
  description: string;
  champs_count: number;
  matches_played: number;
  goals: number;
  championships: string;
  championships_win: string;
  goals_conceded: number;
}

export interface Standings {
  pid: number;
  name: string;
  photo_url: string;
  points: number;
  matches_played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
}

export interface DashboardStats {
  activeChampionships: number;
  totalPlayers: number;
  matchesPlayed: number;
  totalGoals: number;
}

export type TabId = 'auth' | 'dashboard' | 'championships' | 'profiles' | 'console';

export interface ToastState {
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface QueryLog {
  timestamp: string;
  action: string;
  query: string;
}


export interface Permission {
  id: number;
  role_id: number;
  user_id: number;
}