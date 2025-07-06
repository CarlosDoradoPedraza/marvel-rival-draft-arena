
import { useState, useEffect, useCallback } from 'react'
import { supabase, DraftRoom, DraftAction, generateSimpleId } from '@/services/supabase'
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
      // Generate a simple ID for demo purposes
      const userId = generateSimpleId()
      
      const roomData: Omit<DraftRoom, 'id' | 'created_at'> = {
        settings,
        current_team: settings.startingTeam,
        current_action: 'ban',
        turn_number: 0,
        draft_started: false,
        draft_complete: false,
        banned_heroes: [],
        team1_protected: [],
        team2_protected: [],
        team1_player_id: userId
      }

      const { data, error } = await supabase
        .from('draft_rooms')
        .insert(roomData)
        .select()
        .single()

      if (error) {
        console.error('Supabase error:', error)
        // Fallback to local room creation if Supabase fails
        const localRoom: DraftRoom = {
          id: generateSimpleId(),
          created_at: new Date().toISOString(),
          ...roomData
        }
        setRoom(localRoom)
        setLoading(false)
        return localRoom.id
      }
      
      return data.id
    } catch (error) {
      console.error('Error creating room:', error)
      toast({
        title: "Error",
        description: "Failed to create room, using local mode",
        variant: "destructive",
      })
      
      // Create a local room as fallback
      const localRoom: DraftRoom = {
        id: generateSimpleId(),
        created_at: new Date().toISOString(),
        settings,
        current_team: settings.startingTeam,
        current_action: 'ban',
        turn_number: 0,
        draft_started: false,
        draft_complete: false,
        banned_heroes: [],
        team1_protected: [],
        team2_protected: [],
        team1_player_id: generateSimpleId()
      }
      setRoom(localRoom)
      setLoading(false)
      return localRoom.id
    }
  }

  const joinRoom = async (roomId: string) => {
    try {
      const userId = generateSimpleId()
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
        title: "Info",
        description: "Joined room in local mode",
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

      if (error) {
        // Update local state as fallback
        setRoom(prev => prev ? { ...prev, draft_started: true } : null)
      }
    } catch (error) {
      console.error('Error starting draft:', error)
      // Update local state as fallback
      setRoom(prev => prev ? { ...prev, draft_started: true } : null)
      toast({
        title: "Draft Started",
        description: "Draft started in local mode",
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
      const newAction: DraftAction = {
        id: generateSimpleId(),
        room_id: room.id,
        team: currentTurn.team,
        action_type: currentTurn.action as 'ban' | 'protect',
        hero_name: heroName,
        created_at: new Date().toISOString()
      }

      await supabase
        .from('draft_actions')
        .insert(newAction)

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

      if (error) {
        // Update local state as fallback
        setRoom(prev => prev ? { ...prev, ...updates } : null)
        setActions(prev => [...prev, newAction])
      }
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
      const resetData = {
        current_team: room.settings.startingTeam,
        current_action: 'ban' as const,
        turn_number: 0,
        draft_started: false,
        draft_complete: false,
        banned_heroes: [],
        team1_protected: [],
        team2_protected: [],
      }

      const { error } = await supabase
        .from('draft_rooms')
        .update(resetData)
        .eq('id', room.id)

      if (error) {
        // Update local state as fallback
        setRoom(prev => prev ? { ...prev, ...resetData } : null)
        setActions([])
      }

      // Clear actions
      await supabase
        .from('draft_actions')
        .delete()
        .eq('room_id', room.id)
    } catch (error) {
      console.error('Error resetting draft:', error)
      // Update local state as fallback
      if (room) {
        setRoom({
          ...room,
          current_team: room.settings.startingTeam,
          current_action: 'ban',
          turn_number: 0,
          draft_started: false,
          draft_complete: false,
          banned_heroes: [],
          team1_protected: [],
          team2_protected: [],
        })
        setActions([])
      }
      toast({
        title: "Draft Reset",
        description: "Draft reset in local mode",
      })
    }
  }

  // Subscribe to room changes
  useEffect(() => {
    if (!roomId) {
      setLoading(false)
      return
    }

    const fetchRoom = async () => {
      try {
        const { data, error } = await supabase
          .from('draft_rooms')
          .select('*')
          .eq('id', roomId)
          .single()

        if (!error && data) {
          setRoom(data)
        } else {
          console.error('Room not found:', error)
        }
      } catch (error) {
        console.error('Error fetching room:', error)
      }
      setLoading(false)
    }

    const fetchActions = async () => {
      try {
        const { data, error } = await supabase
          .from('draft_actions')
          .select('*')
          .eq('room_id', roomId)
          .order('created_at', { ascending: true })

        if (!error && data) {
          setActions(data)
        }
      } catch (error) {
        console.error('Error fetching actions:', error)
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
