
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type DraftRoom = {
  id: string
  created_at: string
  settings: {
    startingTeam: string
    bansPerTeam: number
    protectsPerTeam: number
  }
  current_team: string
  current_action: 'ban' | 'protect'
  turn_number: number
  draft_started: boolean
  draft_complete: boolean
  banned_heroes: string[]
  team1_protected: string[]
  team2_protected: string[]
  team1_player_id?: string
  team2_player_id?: string
}

export type DraftAction = {
  id: string
  room_id: string
  team: string
  action_type: 'ban' | 'protect'
  hero_name: string
  created_at: string
}
