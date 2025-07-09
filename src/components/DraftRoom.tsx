
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import HeroGrid from './HeroGrid';
import DraftPhaseIndicator from './DraftPhaseIndicator';
import DraftHistory from './DraftHistory';
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
  const [roleFilter, setRoleFilter] = useState<string>('All');

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
    setRoleFilter('All');
    
    toast({
      title: "Draft Reset",
      description: "Draft has been reset",
    });
  };

  // Filter heroes based on selected role
  const filteredHeroes = roleFilter === 'All' 
    ? heroesData 
    : heroesData.filter(hero => hero.role === roleFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <Card className="w-full md:w-auto bg-white border shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-[#D53C53]">Draft Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <span className="text-gray-600">Mode:</span>
              <span className="font-medium text-gray-800">Local Simulation</span>
              
              <span className="text-gray-600">Starting Team:</span>
              <span className="font-medium text-gray-800">{settings.startingTeam === 'team1' ? 'Team 1' : 'Team 2'}</span>
              
              <span className="text-gray-600">Bans per Team:</span>
              <span className="font-medium text-gray-800">{settings.bansPerTeam}</span>
              
              <span className="text-gray-600">Protects per Team:</span>
              <span className="font-medium text-gray-800">{settings.protectsPerTeam}</span>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex flex-wrap gap-3">
          <Button 
            className="bg-[#D53C53] hover:bg-[#c02d45] text-white shadow-lg transition-all"
            onClick={startDraft}
            disabled={draftStarted}
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
      
      {/* Bans and Protections Display */}
      {draftStarted && (
        <div className="grid grid-cols-2 gap-6">
          {/* Team 1 */}
          <Card className="bg-white border shadow-md">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-lg text-center text-blue-600">Team 1</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                {actions.filter(action => action.team === 'team1').map((action, index) => (
                  <div 
                    key={index} 
                    className={`w-12 h-12 rounded-lg overflow-hidden bg-gray-800 border-2 ${
                      action.type === 'ban' ? 'border-red-500' : 'border-blue-500'
                    }`}
                  >
                    <img 
                      src={`/heroes/${action.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.jpg`}
                      alt={action.name}
                      className={`w-full h-full object-cover object-top ${
                        action.type === 'ban' ? 'grayscale' : ''
                      }`}
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b';
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Team 2 */}
          <Card className="bg-white border shadow-md">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-lg text-center text-[#D53C53]">Team 2</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                {actions.filter(action => action.team === 'team2').map((action, index) => (
                  <div 
                    key={index} 
                    className={`w-12 h-12 rounded-lg overflow-hidden bg-gray-800 border-2 ${
                      action.type === 'ban' ? 'border-red-500' : 'border-[#D53C53]'
                    }`}
                  >
                    <img 
                      src={`/heroes/${action.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.jpg`}
                      alt={action.name}
                      className={`w-full h-full object-cover object-top ${
                        action.type === 'ban' ? 'grayscale' : ''
                      }`}
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b';
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-white border shadow-md">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-xl text-center text-[#D53C53]">Hero Selection</CardTitle>
              <div className="flex flex-wrap gap-2 justify-center mt-3">
                {['All', 'Vanguard', 'Duelist', 'Strategist'].map((role) => (
                  <Button
                    key={role}
                    variant={roleFilter === role ? "default" : "outline"}
                    size="sm"
                    className={`text-xs ${
                      roleFilter === role 
                        ? 'bg-[#D53C53] text-white hover:bg-[#c02d45]' 
                        : 'border-[#D53C53] text-[#D53C53] hover:bg-[#D53C53]/10'
                    }`}
                    onClick={() => setRoleFilter(role)}
                  >
                    {role}
                    {role !== 'All' && (
                      <span className="ml-1 text-xs opacity-75">
                        ({heroesData.filter(h => h.role === role).length})
                      </span>
                    )}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <HeroGrid 
                heroes={filteredHeroes}
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
        
        <div>
          <DraftHistory actions={actions} heroes={heroesData} />
        </div>
      </div>
    </div>
  );
};

export default DraftRoom;
