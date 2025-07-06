
import { useState, useEffect, useCallback } from 'react'
import { supabase, DraftRoom, DraftAction } from '@/services/supabase'
import { useToast } from '@/hooks/use-toast'

export const useDraftRoom = (roomId: string | null, userTeam: string) => {
  const [room, setRoom] = useState<DraftRoom | null>(null)
  const [actions, setActions] = useState<DraftAction[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Generate draft sequence
  const generateDraftSequence = () => {
    return [
      { team: 'team1', action: 'ban' },
      { team: 'team2', action: 'ban' },
      { team: 'team2', action: 'protect' },
      { team: 'team1', action: 'protect' },
      { team: 'team1', action: 'ban' },
      { team: 'team2', action: 'ban' },
      { team: 'team2', action: 'protect' },
      { team: 'team1', action: 'protect' },
      { team: 'team1', action: 'ban' },
      { team: 'team2', action: 'ban' },
    ]
  }

  const createRoom = async (settings: any) => {
    try {
      const { data, error } = await supabase
        .from('draft_rooms')
        .insert({
          settings,
          current_team: settings.startingTeam,
          current_action: 'ban',
          turn_number: 0,
          draft_started: false,
          draft_complete: false,
          banned_heroes: [],
          team1_protected: [],
          team2_protected: [],
          team1_player_id: supabase.auth.getUser().then(u => u.data.user?.id)
        })
        .select()
        .single()

      if (error) throw error
      return data.id
    } catch (error) {
      console.error('Error creating room:', error)
      toast({
        title: "Error",
        description: "Failed to create room",
        variant: "destructive",
      })
      return null
    }
  }

  const joinRoom = async (roomId: string) => {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id
      const { error } = await supabase
        .from('draft_rooms')
        .update({ team2_player_id: userId })
        .eq('id', roomId)

      if (error) throw error
      
      toast({
        title: "Joined Room",
        description: "Successfully joined as Team 2",
      })
    } catch (error) {
      console.error('Error joining room:', error)
      toast({
        title: "Error",
        description: "Failed to join room",
        variant: "destructive",
      })
    }
  }

  const startDraft = async () => {
    if (!room) return

    try {
      const { error } = await supabase
        .from('draft_rooms')
        .update({ draft_started: true })
        .eq('id', room.id)

      if (error) throw error
    } catch (error) {
      console.error('Error starting draft:', error)
      toast({
        title: "Error",
        description: "Failed to start draft",
        variant: "destructive",
      })
    }
  }

  const makeSelection = async (heroName: string) => {
    if (!room || !room.draft_started || room.draft_complete) return

    const sequence = generateDraftSequence()
    const currentTurn = sequence[room.turn_number]

    if (currentTurn.team !== userTeam) {
      toast({
        title: "Not Your Turn",
        description: `It's ${currentTurn.team === 'team1' ? 'Team 1' : 'Team 2'}'s turn`,
        variant: "destructive",
      })
      return
    }

    try {
      // Add action to history
      await supabase
        .from('draft_actions')
        .insert({
          room_id: room.id,
          team: currentTurn.team,
          action_type: currentTurn.action,
          hero_name: heroName,
        })

      // Update room state
      const updates: Partial<DraftRoom> = {}
      
      if (currentTurn.action === 'ban') {
        updates.banned_heroes = [...room.banned_heroes, heroName]
      } else if (currentTurn.team === 'team1') {
        updates.team1_protected = [...room.team1_protected, heroName]
      } else {
        updates.team2_protected = [...room.team2_protected, heroName]
      }

      const nextTurnIndex = room.turn_number + 1
      if (nextTurnIndex < sequence.length) {
        const nextTurn = sequence[nextTurnIndex]
        updates.current_team = nextTurn.team
        updates.current_action = nextTurn.action as 'ban' | 'protect'
        updates.turn_number = nextTurnIndex
      } else {
        updates.draft_complete = true
      }

      const { error } = await supabase
        .from('draft_rooms')
        .update(updates)
        .eq('id', room.id)

      if (error) throw error
    } catch (error) {
      console.error('Error making selection:', error)
      toast({
        title: "Error",
        description: "Failed to make selection",
        variant: "destructive",
      })
    }
  }

  const resetDraft = async () => {
    if (!room) return

    try {
      const { error } = await supabase
        .from('draft_rooms')
        .update({
          current_team: room.settings.startingTeam,
          current_action: 'ban',
          turn_number: 0,
          draft_started: false,
          draft_complete: false,
          banned_heroes: [],
          team1_protected: [],
          team2_protected: [],
        })
        .eq('id', room.id)

      if (error) throw error

      // Clear actions
      await supabase
        .from('draft_actions')
        .delete()
        .eq('room_id', room.id)
    } catch (error) {
      console.error('Error resetting draft:', error)
      toast({
        title: "Error",
        description: "Failed to reset draft",
        variant: "destructive",
      })
    }
  }

  // Subscribe to room changes
  useEffect(() => {
    if (!roomId) return

    const fetchRoom = async () => {
      const { data, error } = await supabase
        .from('draft_rooms')
        .select('*')
        .eq('id', roomId)
        .single()

      if (!error && data) {
        setRoom(data)
      }
      setLoading(false)
    }

    const fetchActions = async () => {
      const { data, error } = await supabase
        .from('draft_actions')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })

      if (!error && data) {
        setActions(data)
      }
    }

    fetchRoom()
    fetchActions()

    // Subscribe to room updates
    const roomSubscription = supabase
      .channel(`room_${roomId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'draft_rooms',
        filter: `id=eq.${roomId}`,
      }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          setRoom(payload.new as DraftRoom)
        }
      })
      .subscribe()

    // Subscribe to action updates
    const actionsSubscription = supabase
      .channel(`actions_${roomId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'draft_actions',
        filter: `room_id=eq.${roomId}`,
      }, (payload) => {
        setActions(prev => [...prev, payload.new as DraftAction])
      })
      .subscribe()

    return () => {
      roomSubscription.unsubscribe()
      actionsSubscription.unsubscribe()
    }
  }, [roomId])

  return {
    room,
    actions,
    loading,
    createRoom,
    joinRoom,
    startDraft,
    makeSelection,
    resetDraft,
  }
}
