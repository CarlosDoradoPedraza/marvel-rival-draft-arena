
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Shield, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import HeroGrid from './HeroGrid';
import DraftPhaseIndicator from './DraftPhaseIndicator';
import DraftHistory from './DraftHistory';
import { heroesData } from '@/data/heroes';

interface DraftRoomProps {
  settings: {
    team1Name: string;
    team2Name: string;
    startingTeam: string;
    bansPerTeam: number;
    protectsPerTeam: number;
    draftMode: 'MRC' | 'MRI';
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
  const [showHistory, setShowHistory] = useState(false);

  // Generate draft sequence based on mode
  const generateDraftSequence = () => {
    if (settings.draftMode === 'MRI') {
      return [
        { team: 'team1', action: 'ban' },
        { team: 'team2', action: 'ban' },
        { team: 'team2', action: 'protect' },
        { team: 'team1', action: 'ban' },
        { team: 'team1', action: 'protect' },
        { team: 'team2', action: 'ban' },
        { team: 'team2', action: 'ban' },
        { team: 'team1', action: 'ban' },
        { team: 'team1', action: 'protect' },
        { team: 'team2', action: 'ban' },
        { team: 'team2', action: 'protect' },
        { team: 'team1', action: 'ban' },
      ];
    } else {
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
    }
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

    if (settings.draftMode === 'MRI' && currentTurn.action === 'protect') {
      const isBannedForCurrentTeam = bannedHeroes.includes(`${heroName}:${currentTurn.team}`);
      if (isBannedForCurrentTeam) {
        toast({
          title: "Cannot Protect",
          description: `${heroName} has been banned for your team and cannot be protected`,
          variant: "destructive",
        });
        return;
      }
    }

    const newAction: Action = {
      team: currentTurn.team,
      type: currentTurn.action as 'ban' | 'protect',
      name: heroName,
      timestamp: new Date(),
    };
    setActions((prev) => [...prev, newAction]);

    if (currentTurn.action === 'ban') {
      if (settings.draftMode === 'MRI') {
        if (currentTurn.team === 'team1') {
          setBannedHeroes((prev) => [...prev, `${heroName}:team2`]);
        } else {
          setBannedHeroes((prev) => [...prev, `${heroName}:team1`]);
        }
      } else {
        setBannedHeroes((prev) => [...prev, heroName]);
      }
    } else if (currentTurn.action === 'protect') {
      if (currentTurn.team === 'team1') {
        setTeam1Protected((prev) => [...prev, heroName]);
      } else {
        setTeam2Protected((prev) => [...prev, heroName]);
      }
    }

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
      title: `${currentTurn.team === 'team1' ? settings.team1Name : settings.team2Name} ${currentTurn.action}ned ${heroName}`,
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

  const redoLastAction = () => {
    if (actions.length === 0 || !draftStarted || draftComplete) return;

    const lastAction = actions[actions.length - 1];
    setActions((prev) => prev.slice(0, -1));

    if (lastAction.type === 'ban') {
      if (settings.draftMode === 'MRI') {
        if (lastAction.team === 'team1') {
          setBannedHeroes((prev) => prev.filter((hero) => hero !== `${lastAction.name}:team2`));
        } else {
          setBannedHeroes((prev) => prev.filter((hero) => hero !== `${lastAction.name}:team1`));
        }
      } else {
        setBannedHeroes((prev) => prev.filter((hero) => hero !== lastAction.name));
      }
    } else if (lastAction.team === 'team1') {
      setTeam1Protected((prev) => prev.filter((hero) => hero !== lastAction.name));
    } else {
      setTeam2Protected((prev) => prev.filter((hero) => hero !== lastAction.name));
    }

    const sequence = generateDraftSequence();
    const previousTurnIndex = turnNumber - 1;
    if (previousTurnIndex >= 0) {
      const previousTurn = sequence[previousTurnIndex];
      setCurrentTeam(previousTurn.team);
      setCurrentAction(previousTurn.action as 'ban' | 'protect');
      setTurnNumber(previousTurnIndex);
      setDraftComplete(false);
    }

    toast({
      title: "Action Undone",
      description: `Reverted ${lastAction.type} of ${lastAction.name}`,
    });
  };

  const filteredHeroes = roleFilter === 'All'
    ? heroesData
    : heroesData.filter((hero) => hero.role === roleFilter);

  return (
    <div className="space-y-6">
      {/* Draft Settings */}
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <Card className="w-full md:w-auto bg-white border shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-[#D53C53]">Draft Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <span className="text-gray-600">Draft Mode:</span>
              <span className={`font-medium flex items-center gap-1 ${
                settings.draftMode === 'MRC' ? 'text-green-600' : 'text-orange-600'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  settings.draftMode === 'MRC' ? 'bg-green-500' : 'bg-orange-500'
                }`}></span>
                {settings.draftMode} Draft
              </span>
              <span className="text-gray-600">Starting Team:</span>
              <span className="font-medium text-gray-800">
                {settings.startingTeam === 'team1' ? settings.team1Name : settings.team2Name}
              </span>
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
          {draftStarted && actions.length > 0 && (
            <Button
              variant="outline"
              className="border-orange-500 text-orange-500 hover:bg-orange-500/10"
              onClick={redoLastAction}
              disabled={draftComplete && actions.length === 0}
            >
              Undo Last
            </Button>
          )}
        </div>
      </div>

      {/* Draft Phase Indicator */}
      {draftStarted && (
        <DraftPhaseIndicator
          currentTeam={currentTeam}
          currentAction={currentAction}
          isComplete={draftComplete}
          isYourTurn={true}
          team1Name={settings.team1Name}
          team2Name={settings.team2Name}
        />
      )}

      {/* Bans and Protections Display */}
      {draftStarted && (
        <div className="grid grid-cols-2 gap-6">
          {/* Team 1 */}
          <Card className="bg-white border shadow-md">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-lg text-center text-blue-600">{settings.team1Name}</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <TooltipProvider>
                <div className="flex flex-wrap gap-2">
                  {actions.filter((action) => action.team === 'team1').map((action, index) => (
                    <Tooltip key={index}>
                      <TooltipTrigger asChild>
                        <div
                          className={`relative w-12 h-12 rounded-lg overflow-hidden bg-gray-800 border-2 cursor-pointer ${
                            action.type === 'ban' ? 'border-red-500' : 'border-green-500'
                          }`}
                        >
                          <img
                            src={`/heroes/${(() => {
                              const hero = heroesData.find((h) => h.name === action.name);
                              return hero
                                ? hero.image
                                : action.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '.jpg';
                            })()}`}
                            alt={action.name}
                            className={`w-full h-full object-cover object-top ${
                              action.type === 'ban' ? 'grayscale' : ''
                            }`}
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b';
                            }}
                          />
                          <div className="absolute bottom-0 right-0 bg-black/80 rounded-tl-md p-1">
                            {action.type === 'ban' ? (
                              <X className="w-3 h-3 text-red-500" />
                            ) : (
                              <Shield className="w-3 h-3 text-green-500" />
                            )}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{action.name} - {action.type === 'ban' ? 'Banned' : 'Protected'}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </TooltipProvider>
            </CardContent>
          </Card>

          {/* Team 2 */}
          <Card className="bg-white border shadow-md">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-lg text-center text-[#D53C53]">{settings.team2Name}</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <TooltipProvider>
                <div className="flex flex-wrap gap-2">
                  {actions.filter((action) => action.team === 'team2').map((action, index) => (
                    <Tooltip key={index}>
                      <TooltipTrigger asChild>
                        <div
                          className={`relative w-12 h-12 rounded-lg overflow-hidden bg-gray-800 border-2 cursor-pointer ${
                            action.type === 'ban' ? 'border-red-500' : 'border-green-500'
                          }`}
                        >
                          <img
                            src={`/heroes/${(() => {
                              const hero = heroesData.find((h) => h.name === action.name);
                              return hero
                                ? hero.image
                                : action.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '.jpg';
                            })()}`}
                            alt={action.name}
                            className={`w-full h-full object-cover object-top ${
                              action.type === 'ban' ? 'grayscale' : ''
                            }`}
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b';
                            }}
                          />
                          <div className="absolute bottom-0 right-0 bg-black/80 rounded-tl-md p-1">
                            {action.type === 'ban' ? (
                              <X className="w-3 h-3 text-red-500" />
                            ) : (
                              <Shield className="w-3 h-3 text-green-500" />
                            )}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{action.name} - {action.type === 'ban' ? 'Banned' : 'Protected'}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </TooltipProvider>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Hero Selection */}
      <Card className="bg-white border shadow-md">
        <CardHeader className="pb-2 border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl text-[#D53C53]">Hero Selection</CardTitle>
            {draftStarted && (
              <Button
                variant="outline"
                size="sm"
                className="border-[#D53C53] text-[#D53C53] hover:bg-[#D53C53]/10"
                onClick={() => setShowHistory(!showHistory)}
              >
                {showHistory ? 'Hide History' : 'Show History'}
              </Button>
            )}
          </div>
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
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className={showHistory ? "lg:col-span-3" : "lg:col-span-4"}>
              <HeroGrid 
                heroes={filteredHeroes}
                bannedHeroes={bannedHeroes}
                team1Protected={team1Protected}
                team2Protected={team2Protected}
                onSelect={makeSelection}
                disabled={!draftStarted || draftComplete}
                currentTeam={currentTeam}
                currentAction={currentAction}
                draftMode={settings.draftMode}
              />
            </div>
            
            {showHistory && (
              <div className="lg:col-span-1">
                <DraftHistory actions={actions} heroes={heroesData} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DraftRoom;