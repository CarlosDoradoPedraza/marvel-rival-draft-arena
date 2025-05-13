
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import HeroGrid from './HeroGrid';
import DraftPhaseIndicator from './DraftPhaseIndicator';
import DraftHistory from './DraftHistory';
import { heroesData } from '@/data/heroes';
import { mapsData } from '@/data/maps';
import { useLocation } from 'react-router-dom';

interface DraftRoomProps {
  settings: {
    startingTeam: string;
    bansPerTeam: number;
    protectsPerTeam: number;
  };
}

type Action = {
  team: string;
  type: 'ban' | 'protect';
  name: string;
  timestamp: Date;
};

const DraftRoom: React.FC<DraftRoomProps> = ({ settings }) => {
  const { toast } = useToast();
  const location = useLocation();
  const [currentTeam, setCurrentTeam] = useState(settings.startingTeam);
  const [currentAction, setCurrentAction] = useState<'ban' | 'protect'>('ban');
  const [bannedHeroes, setBannedHeroes] = useState<string[]>([]);
  const [team1Protected, setTeam1Protected] = useState<string[]>([]);
  const [team2Protected, setTeam2Protected] = useState<string[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [draftStarted, setDraftStarted] = useState(false);
  const [draftComplete, setDraftComplete] = useState(false);
  const [turnNumber, setTurnNumber] = useState(0);
  const [roomLink, setRoomLink] = useState('');
  const [userTeam, setUserTeam] = useState('team1'); // Default: creator is team1
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);
  const [opponentJoined, setOpponentJoined] = useState(false);

  // Check if user is joining as a second player
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const joinAsTeam2 = searchParams.get('join') === 'team2';
    
    if (joinAsTeam2) {
      setUserTeam('team2');
      setOpponentJoined(true);
      toast({
        title: "Joined as Team 2",
        description: "You've joined the draft room as Team 2",
      });
    }
  }, [location, toast]);
  
  // Create a sequence of turns based on settings
  const generateDraftSequence = () => {
    // Default Marvel Rivals draft sequence
    const sequence = [];
    
    // Team 1 bans
    sequence.push({ team: 'team1', action: 'ban' });
    
    // Team 2 bans + protects
    sequence.push({ team: 'team2', action: 'ban' });
    sequence.push({ team: 'team2', action: 'protect' });
    
    // Team 1 protects + bans
    sequence.push({ team: 'team1', action: 'protect' });
    sequence.push({ team: 'team1', action: 'ban' });
    
    // Team 2 bans + protects
    sequence.push({ team: 'team2', action: 'ban' });
    sequence.push({ team: 'team2', action: 'protect' });
    
    // Team 1 protects + bans
    sequence.push({ team: 'team1', action: 'protect' });
    sequence.push({ team: 'team1', action: 'ban' });
    
    // Team 2 bans
    sequence.push({ team: 'team2', action: 'ban' });
    
    return sequence;
  };

  const draftSequence = generateDraftSequence();

  useEffect(() => {
    // Generate a room link with team2 join parameter when component mounts
    const roomId = Math.random().toString(36).substring(2, 8);
    setRoomLink(`${window.location.origin}/?room=${roomId}&join=team2`);
  }, []);

  const startDraft = () => {
    setDraftStarted(true);
    const firstTurn = draftSequence[0];
    setCurrentTeam(firstTurn.team);
    setCurrentAction(firstTurn.action as 'ban' | 'protect');
    
    // If we're in single player mode, proceed normally
    // If we're in multiplayer mode and the other player hasn't joined, show waiting status
    if (userTeam === 'team1' && !opponentJoined) {
      setWaitingForOpponent(true);
      toast({
        title: "Waiting for opponent",
        description: "Share the room link for Team 2 to join",
      });
    } else {
      toast({
        title: "Draft Started",
        description: `${firstTurn.team === 'team1' ? 'Team 1' : 'Team 2'} ${firstTurn.action === 'ban' ? 'bans' : 'protects'} first`,
      });
    }
  };

  const resetDraft = () => {
    setBannedHeroes([]);
    setTeam1Protected([]);
    setTeam2Protected([]);
    setActions([]);
    setDraftStarted(false);
    setDraftComplete(false);
    setTurnNumber(0);
    setWaitingForOpponent(false);
    toast({
      title: "Draft Reset",
      description: "All selections have been cleared",
    });
  };

  const copyRoomLink = () => {
    navigator.clipboard.writeText(roomLink);
    toast({
      title: "Link Copied",
      description: "Room link copied to clipboard",
    });
  };

  const handleSelection = (heroName: string) => {
    if (!draftStarted || draftComplete) return;
    
    const currentTurn = draftSequence[turnNumber];
    
    // Only allow selection if it's user's team turn
    if (currentTurn.team !== userTeam) {
      toast({
        title: "Not Your Turn",
        description: `It's ${currentTurn.team === 'team1' ? 'Team 1' : 'Team 2'}'s turn now`,
        variant: "destructive",
      });
      return;
    }
    
    if (waitingForOpponent) {
      toast({
        title: "Waiting for Opponent",
        description: "Share the room link for your opponent to join",
        variant: "destructive",
      });
      return;
    }
    
    // Check if hero is already banned or protected
    if (bannedHeroes.includes(heroName) || 
        team1Protected.includes(heroName) || 
        team2Protected.includes(heroName)) {
      toast({
        title: "Invalid Selection",
        description: "This hero is already banned or protected",
        variant: "destructive",
      });
      return;
    }
    
    // Record the action
    const newAction = {
      team: currentTeam,
      type: currentAction,
      name: heroName,
      timestamp: new Date(),
    };
    setActions([...actions, newAction]);
    
    // Update the appropriate state
    if (currentAction === 'ban') {
      setBannedHeroes([...bannedHeroes, heroName]);
    } else {
      if (currentTeam === 'team1') {
        setTeam1Protected([...team1Protected, heroName]);
      } else {
        setTeam2Protected([...team2Protected, heroName]);
      }
    }
    
    // Move to next turn
    const nextTurnIndex = turnNumber + 1;
    if (nextTurnIndex < draftSequence.length) {
      const nextTurn = draftSequence[nextTurnIndex];
      setCurrentTeam(nextTurn.team);
      setCurrentAction(nextTurn.action as 'ban' | 'protect');
      setTurnNumber(nextTurnIndex);
      toast({
        title: "Next Turn",
        description: `${nextTurn.team === 'team1' ? 'Team 1' : 'Team 2'} ${nextTurn.action === 'ban' ? 'bans' : 'protects'} next`,
      });
    } else {
      setDraftComplete(true);
      toast({
        title: "Draft Complete",
        description: "All selections have been made",
      });
    }
  };

  const simulateOpponentJoining = () => {
    setOpponentJoined(true);
    setWaitingForOpponent(false);
    toast({
      title: "Opponent Joined",
      description: "Team 2 has joined the draft room",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <Card className="w-full md:w-auto bg-gray-800 border-gray-700 shadow-lg shadow-purple-700/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-purple-400">Room Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <span className="text-gray-400">Starting Team:</span>
              <span className="font-medium">{settings.startingTeam === 'team1' ? 'Team 1' : 'Team 2'}</span>
              
              <span className="text-gray-400">Bans per Team:</span>
              <span className="font-medium">{settings.bansPerTeam}</span>
              
              <span className="text-gray-400">Protects per Team:</span>
              <span className="font-medium">{settings.protectsPerTeam}</span>
              
              <span className="text-gray-400">Your Team:</span>
              <span className={`font-medium ${userTeam === 'team1' ? 'text-blue-400' : 'text-red-400'}`}>
                {userTeam === 'team1' ? 'Team 1' : 'Team 2'}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex flex-wrap gap-3">
          <Button 
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-purple-500/50 transition-all"
            onClick={startDraft}
            disabled={draftStarted}
          >
            Start Draft
          </Button>
          
          <Button 
            variant="outline" 
            className="border-purple-600 text-purple-400 hover:bg-purple-600/20"
            onClick={resetDraft}
          >
            Reset Draft
          </Button>
          
          <Button 
            variant="outline"
            className="border-blue-500 text-blue-400 hover:bg-blue-500/20"
            onClick={copyRoomLink}
          >
            Copy Room Link
          </Button>
          
          {/* For demo purposes only - in a real app this would use WebSockets/Supabase */}
          {userTeam === 'team1' && waitingForOpponent && (
            <Button 
              variant="outline"
              className="border-green-500 text-green-400 hover:bg-green-500/20"
              onClick={simulateOpponentJoining}
            >
              Simulate Opponent Join
            </Button>
          )}
        </div>
      </div>
      
      {waitingForOpponent && (
        <Alert className="bg-yellow-900/20 border-yellow-600 shadow-lg">
          <AlertTitle className="text-yellow-400">Waiting for opponent to join</AlertTitle>
          <AlertDescription>
            Share the room link with your opponent to continue the draft.
            <div className="mt-2 p-3 bg-gray-800 rounded-md text-sm font-mono break-all border border-yellow-600/30">
              {roomLink}
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {draftStarted && !waitingForOpponent && (
        <DraftPhaseIndicator 
          currentTeam={currentTeam}
          currentAction={currentAction}
          isComplete={draftComplete}
          isYourTurn={currentTeam === userTeam}
        />
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-gray-800 border-gray-700 shadow-xl">
            <CardHeader className="pb-2 border-b border-gray-700">
              <CardTitle className="text-xl text-center text-purple-400">Hero Selection</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <HeroGrid 
                heroes={heroesData}
                bannedHeroes={bannedHeroes}
                team1Protected={team1Protected}
                team2Protected={team2Protected}
                onSelect={handleSelection}
                disabled={!draftStarted || draftComplete || currentTeam !== userTeam || waitingForOpponent}
                currentTeam={currentTeam}
                currentAction={currentAction}
              />
            </CardContent>
          </Card>
        </div>
        
        <div>
          <DraftHistory actions={actions} />
        </div>
      </div>
    </div>
  );
};

export default DraftRoom;
