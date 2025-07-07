
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import HeroGrid from './HeroGrid';
import DraftPhaseIndicator from './DraftPhaseIndicator';
import BanPickDisplay from './BanPickDisplay';
import { heroesData } from '@/data/heroes';

interface DraftRoomProps {
  settings: {
    startingTeam: string;
    bansPerTeam: number;
    protectsPerTeam: number;
  };
}

interface Action {
  team: string;
  type: 'ban' | 'protect';
  name: string;
  timestamp: Date;
}

const DraftRoom: React.FC<DraftRoomProps> = ({ settings }) => {
  const { toast } = useToast();
  const [currentTeam, setCurrentTeam] = useState(settings.startingTeam);
  const [currentAction, setCurrentAction] = useState<'ban' | 'protect'>('ban');
  const [turnNumber, setTurnNumber] = useState(0);
  const [draftStarted, setDraftStarted] = useState(false);
  const [draftComplete, setDraftComplete] = useState(false);
  const [bannedHeroes, setBannedHeroes] = useState<string[]>([]);
  const [team1Protected, setTeam1Protected] = useState<string[]>([]);
  const [team2Protected, setTeam2Protected] = useState<string[]>([]);
  const [actions, setActions] = useState<Action[]>([]);

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
    ];
  };

  const startDraft = () => {
    setDraftStarted(true);
    toast({
      title: "Draft Started",
      description: "Begin with the first ban",
    });
  };

  const makeSelection = (heroName: string) => {
    if (!draftStarted || draftComplete) return;

    const sequence = generateDraftSequence();
    const currentTurn = sequence[turnNumber];

    // Add action to history
    const newAction: Action = {
      team: currentTurn.team,
      type: currentTurn.action as 'ban' | 'protect',
      name: heroName,
      timestamp: new Date(),
    };
    setActions(prev => [...prev, newAction]);

    // Update game state
    if (currentTurn.action === 'ban') {
      setBannedHeroes(prev => [...prev, heroName]);
    } else if (currentTurn.team === 'team1') {
      setTeam1Protected(prev => [...prev, heroName]);
    } else {
      setTeam2Protected(prev => [...prev, heroName]);
    }

    // Move to next turn
    const nextTurnIndex = turnNumber + 1;
    if (nextTurnIndex < sequence.length) {
      const nextTurn = sequence[nextTurnIndex];
      setCurrentTeam(nextTurn.team);
      setCurrentAction(nextTurn.action as 'ban' | 'protect');
      setTurnNumber(nextTurnIndex);
    } else {
      setDraftComplete(true);
      toast({
        title: "Draft Complete",
        description: "All selections have been made",
      });
    }

    toast({
      title: `${currentTurn.team === 'team1' ? 'Team 1' : 'Team 2'} ${currentTurn.action}ned ${heroName}`,
      description: `Selection confirmed`,
    });
  };

  const resetDraft = () => {
    setCurrentTeam(settings.startingTeam);
    setCurrentAction('ban');
    setTurnNumber(0);
    setDraftStarted(false);
    setDraftComplete(false);
    setBannedHeroes([]);
    setTeam1Protected([]);
    setTeam2Protected([]);
    setActions([]);
    
    toast({
      title: "Draft Reset",
      description: "Draft has been reset",
    });
  };

  return (
    <div className="space-y-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen p-4">
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <Card className="w-full md:w-auto bg-gradient-to-br from-slate-800 to-slate-900 border-slate-600/50 shadow-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl bg-gradient-to-r from-red-500 via-yellow-500 to-red-600 bg-clip-text text-transparent">
              Draft Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <span className="text-slate-300">Mode:</span>
              <span className="font-medium text-white">Local Simulation</span>
              
              <span className="text-slate-300">Starting Team:</span>
              <span className="font-medium text-white">{settings.startingTeam === 'team1' ? 'Team 1' : 'Team 2'}</span>
              
              <span className="text-slate-300">Bans per Team:</span>
              <span className="font-medium text-white">{settings.bansPerTeam}</span>
              
              <span className="text-slate-300">Protects per Team:</span>
              <span className="font-medium text-white">{settings.protectsPerTeam}</span>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex flex-wrap gap-3">
          <Button 
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg transition-all font-bold px-6"
            onClick={startDraft}
            disabled={draftStarted}
          >
            Start Draft
          </Button>
          
          <Button 
            variant="outline" 
            className="border-red-500 text-red-400 hover:bg-red-500/10 bg-transparent backdrop-blur-sm"
            onClick={resetDraft}
          >
            Reset Draft
          </Button>
        </div>
      </div>
      
      {draftStarted && (
        <DraftPhaseIndicator 
          currentTeam={currentTeam}
          currentAction={currentAction}
          isComplete={draftComplete}
          isYourTurn={true}
        />
      )}
      
      <div className="space-y-6">
        <BanPickDisplay actions={actions} />
        
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-600/50 shadow-2xl">
          <CardHeader className="pb-2 border-b border-slate-600/50">
            <CardTitle className="text-xl text-center bg-gradient-to-r from-red-500 via-yellow-500 to-red-600 bg-clip-text text-transparent">
              Hero Selection
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <HeroGrid 
              heroes={heroesData}
              bannedHeroes={bannedHeroes}
              team1Protected={team1Protected}
              team2Protected={team2Protected}
              onSelect={makeSelection}
              disabled={!draftStarted || draftComplete}
              currentTeam={currentTeam}
              currentAction={currentAction}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DraftRoom;
