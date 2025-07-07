
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import HeroGrid from './HeroGrid';
import DraftPhaseIndicator from './DraftPhaseIndicator';
import DraftHistory from './DraftHistory';
import { heroesData } from '@/data/heroes';
import { useLocation } from 'react-router-dom';
import { useDraftRoom } from '@/hooks/useDraftRoom';

interface DraftRoomProps {
  settings: {
    startingTeam: string;
    bansPerTeam: number;
    protectsPerTeam: number;
  };
  roomId?: string;
}

const DraftRoom: React.FC<DraftRoomProps> = ({ settings, roomId }) => {
  const { toast } = useToast();
  const location = useLocation();
  const [userTeam, setUserTeam] = useState('team1');
  const [roomLink, setRoomLink] = useState('');

  // Determine user team from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const joinAsTeam2 = searchParams.get('join') === 'team2';
    
    if (joinAsTeam2) {
      setUserTeam('team2');
      console.log('User joining as Team 2');
    } else {
      console.log('User is Team 1');
    }
  }, [location]);

  const {
    room,
    actions,
    loading,
    joinRoom,
    startDraft,
    makeSelection,
    resetDraft,
  } = useDraftRoom(roomId || null, userTeam);

  // Generate room link
  useEffect(() => {
    if (roomId) {
      const link = `${window.location.origin}/?room=${roomId}&join=team2`;
      setRoomLink(link);
      console.log('Generated room link:', link);
    }
  }, [roomId]);

  // Join room if coming from link
  useEffect(() => {
    if (roomId && userTeam === 'team2' && !room?.team2_player_id) {
      console.log('Attempting to join room:', roomId);
      joinRoom(roomId);
    }
  }, [roomId, userTeam, joinRoom, room?.team2_player_id]);

  const copyRoomLink = () => {
    navigator.clipboard.writeText(roomLink);
    toast({
      title: "Link Copied",
      description: "Room link copied to clipboard",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading draft room...</div>
      </div>
    );
  }

  // Use room data if available, otherwise fall back to settings
  const displayRoom = room || {
    settings,
    current_team: settings.startingTeam,
    current_action: 'ban' as const,
    draft_started: false,
    draft_complete: false,
    banned_heroes: [],
    team1_protected: [],
    team2_protected: [],
    team2_player_id: userTeam === 'team2' ? 'local-player' : undefined
  };

  const isWaitingForOpponent = !displayRoom.team2_player_id && userTeam === 'team1';
  const canMakeSelection = displayRoom.draft_started && !displayRoom.draft_complete && 
                           displayRoom.current_team === userTeam && !isWaitingForOpponent;

  console.log('Render state:', {
    userTeam,
    currentTeam: displayRoom.current_team,
    draftStarted: displayRoom.draft_started,
    canMakeSelection,
    isWaitingForOpponent,
    team2Connected: !!displayRoom.team2_player_id
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <Card className="w-full md:w-auto bg-white border shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-[#D53C53]">Room Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <span className="text-gray-600">Room ID:</span>
              <span className="font-medium text-gray-800 text-xs">{roomId?.substring(0, 8)}...</span>
              
              <span className="text-gray-600">Starting Team:</span>
              <span className="font-medium text-gray-800">{displayRoom.settings.startingTeam === 'team1' ? 'Team 1' : 'Team 2'}</span>
              
              <span className="text-gray-600">Your Team:</span>
              <span className={`font-medium ${userTeam === 'team1' ? 'text-blue-600' : 'text-[#D53C53]'}`}>
                {userTeam === 'team1' ? 'Team 1' : 'Team 2'}
              </span>
              
              <span className="text-gray-600">Team 2 Connected:</span>
              <span className={`font-medium ${displayRoom.team2_player_id ? 'text-green-600' : 'text-red-600'}`}>
                {displayRoom.team2_player_id ? 'Yes' : 'No'}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex flex-wrap gap-3">
          <Button 
            className="bg-[#D53C53] hover:bg-[#c02d45] text-white shadow-lg transition-all"
            onClick={startDraft}
            disabled={displayRoom.draft_started || isWaitingForOpponent}
          >
            Start Draft
          </Button>
          
          <Button 
            variant="outline" 
            className="border-[#D53C53] text-[#D53C53] hover:bg-[#D53C53]/10"
            onClick={resetDraft}
          >
            Reset Draft
          </Button>
          
          <Button 
            variant="outline"
            className="border-blue-500 text-blue-500 hover:bg-blue-500/10"
            onClick={copyRoomLink}
          >
            Copy Room Link
          </Button>
        </div>
      </div>
      
      {isWaitingForOpponent && (
        <Alert className="bg-amber-50 border-amber-300 shadow">
          <AlertTitle className="text-amber-700">Waiting for opponent to join</AlertTitle>
          <AlertDescription className="text-amber-600">
            Share the room link with your opponent to continue the draft.
            <div className="mt-2 p-3 bg-white rounded-md text-sm font-mono break-all border border-amber-200">
              {roomLink}
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {displayRoom.draft_started && !isWaitingForOpponent && (
        <DraftPhaseIndicator 
          currentTeam={displayRoom.current_team}
          currentAction={displayRoom.current_action}
          isComplete={displayRoom.draft_complete}
          isYourTurn={displayRoom.current_team === userTeam}
        />
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-white border shadow-md">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-xl text-center text-[#D53C53]">Hero Selection</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <HeroGrid 
                heroes={heroesData}
                bannedHeroes={displayRoom.banned_heroes}
                team1Protected={displayRoom.team1_protected}
                team2Protected={displayRoom.team2_protected}
                onSelect={makeSelection}
                disabled={!canMakeSelection}
                currentTeam={displayRoom.current_team}
                currentAction={displayRoom.current_action}
              />
            </CardContent>
          </Card>
        </div>
        
        <div>
          <DraftHistory actions={actions.map(action => ({
            team: action.team,
            type: action.action_type as 'ban' | 'protect',
            name: action.hero_name,
            timestamp: new Date(action.created_at),
          }))} />
        </div>
      </div>
    </div>
  );
};

export default DraftRoom;
