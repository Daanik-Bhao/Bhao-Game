export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        /** Only id/username/avatar_url are honoured; a trigger forces every other column. */
        Insert: Pick<Profile, 'id' | 'username'> & Partial<Pick<Profile, 'avatar_url'>>
        /** No direct updates: use the update_my_profile RPC. */
        Update: never
      }
      games: {
        Row: Game
        Insert: Partial<Game> & { host_id: string }
        Update: Partial<Game>
      }
      game_players: {
        Row: GamePlayer
        Insert: Partial<GamePlayer> & { game_id: string; player_id: string }
        Update: Partial<GamePlayer>
      }
      player_cards: {
        Row: PlayerCard
        Insert: Partial<PlayerCard> & { player_id: string; card_id: string }
        Update: Partial<PlayerCard>
      }
      matches: {
        Row: Match
        Insert: never
        Update: never
      }
      match_results: {
        Row: MatchResult
        Insert: never
        Update: never
      }
      daily_contracts: {
        Row: DailyContract
        Insert: Partial<DailyContract>
        Update: Partial<DailyContract>
      }
      player_contracts: {
        Row: PlayerContract
        Insert: Partial<PlayerContract> & { player_id: string; contract_id: string }
        Update: Partial<PlayerContract>
      }
      daanik_stocks: {
        Row: DaanikStock
        Insert: Partial<DaanikStock>
        Update: Partial<DaanikStock>
      }
      stock_holdings: {
        Row: StockHolding
        Insert: Partial<StockHolding> & { player_id: string; stock_id: string }
        Update: Partial<StockHolding>
      }
      guilds: {
        Row: Guild
        Insert: Partial<Guild> & { name: string; tag: string; owner_id: string }
        Update: Partial<Guild>
      }
      guild_members: {
        Row: GuildMember
        Insert: Partial<GuildMember> & { guild_id: string; player_id: string }
        Update: Partial<GuildMember>
      }
    }
  }
}

export interface Profile {
  id: string
  username: string
  avatar_url: string | null
  rank_points: number
  daanik_coins: number
  total_xp: number
  games_played: number
  games_won: number
  win_streak: number
  max_win_streak: number
  current_season_rank_points: number
  placement_games_done: number
  guild_id: string | null
  last_login_date: string | null
  login_streak: number
  created_at: string
  updated_at: string
}

export type MatchMode = 'ranked' | 'practice' | 'campaign' | 'multiplayer'

/** `matches` row (owner can read; written only by start_match / apply_match_result). */
export interface Match {
  id: string
  user_id: string
  mode: MatchMode
  room_id: string | null
  level_id: string | null
  total_players: number | null
  started_at: string
  finished_at: string | null
  result: MatchResultSummary | { expired: true } | null
}

/** `match_results` row (owner can read). */
export interface MatchResult {
  id: string
  match_id: string
  user_id: string
  mode: MatchMode
  won: boolean
  placement: number
  total_players: number
  final_wealth: number
  forfeit: boolean
  rp_change: number
  rp_capped: boolean
  xp_gained: number
  coins_gained: number
  contract_coins: number
  stats: Record<string, unknown>
  created_at: string
}

/** Return value of `apply_match_result` (and the save-game-result function's `result`). */
export interface MatchResultSummary {
  match_id: string
  mode: MatchMode
  won: boolean
  placement: number
  total_players: number
  forfeit: boolean
  rp_change: number
  rp_capped: boolean
  xp_gained: number
  coins_gained: number
  contract_coins: number
  rank_points?: number
  already_applied: boolean
}

/** Return value of the `claim_daily_reward` RPC. */
export interface DailyRewardResult {
  reward: number
  streak: number
  already_claimed: boolean
}

export interface Game {
  id: string
  host_id: string
  season_id: string | null
  status: 'waiting' | 'in_progress' | 'completed'
  game_mode: 'casual' | 'ranked' | 'tutorial'
  player_count: number
  max_players: number
  winner_id: string | null
  final_state: Record<string, unknown> | null
  started_at: string | null
  ended_at: string | null
  created_at: string
}

export interface GamePlayer {
  id: string
  game_id: string
  player_id: string
  seat_order: number
  final_wealth: number | null
  rp_change: number
  placement: number | null
  is_bot: boolean
  created_at: string
}

export interface PlayerCard {
  id: string
  player_id: string
  card_id: string
  card_tier: 'common' | 'rare' | 'epic' | 'legendary'
  quantity: number
  acquired_at: string
}

export interface DailyContract {
  id: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  reward_dc: number
  reward_card_tier: string | null
  requirement_type: string
  requirement_value: number
  contract_date: string
  is_weekly: boolean
  created_at: string
}

export interface PlayerContract {
  id: string
  player_id: string
  contract_id: string
  progress: number
  completed: boolean
  completed_at: string | null
  created_at: string
}

export interface DaanikStock {
  id: string
  ticker: string
  name: string
  description: string
  base_price: number
  current_price: number
  price_change_pct: number
  trend: 'up' | 'down' | 'stable'
  created_at: string
  updated_at: string
}

export interface StockHolding {
  id: string
  player_id: string
  stock_id: string
  shares: number
  avg_buy_price: number
  created_at: string
  updated_at: string
}

export interface Guild {
  id: string
  name: string
  tag: string
  description: string | null
  owner_id: string
  treasury_dc: number
  max_members: number
  season_wins: number
  created_at: string
  updated_at: string
}

export interface GuildMember {
  id: string
  guild_id: string
  player_id: string
  role: 'owner' | 'officer' | 'member'
  contribution_dc: number
  joined_at: string
}
