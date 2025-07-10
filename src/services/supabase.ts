
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type DraftRoom = {
  id: string
  created_at: string
  settings: {
    startingTeam: string
    bansPerTeam: number
    protectsPerTeam: number
    draftSystem: 'MRC' | 'MRI'
    team1Name: string
    team2Name: string
  }
  current_team: string
  current_action: 'ban' | 'protect'
  turn_number: number
  draft_started: boolean
  draft_complete: boolean
  banned_heroes: string[]
  team1_protected: string[]
  team2_protected: string[]
  team1_bans?: string[]
  team2_bans?: string[]
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

// Helper function to generate a simple UUID-like string for demo purposes
export const generateSimpleId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}
