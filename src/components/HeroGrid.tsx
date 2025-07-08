
import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ConfirmHeroSelection from './ConfirmHeroSelection';

interface Hero {
  id: string;
  name: string;
  image: string;
  role: string;
}

interface HeroGridProps {
  heroes: Hero[];
  bannedHeroes: string[];
  team1Protected: string[];
  team2Protected: string[];
  onSelect: (heroName: string) => void;
  disabled: boolean;
  currentTeam: string;
  currentAction: 'ban' | 'protect';
}

const HeroGrid: React.FC<HeroGridProps> = ({ 
  heroes, 
  bannedHeroes, 
  team1Protected, 
  team2Protected, 
  onSelect,
  disabled,
  currentTeam,
  currentAction
}) => {
  const [pendingHero, setPendingHero] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const getHeroStatus = (hero: Hero) => {
    if (bannedHeroes.includes(hero.name)) {
      return { status: 'banned', team: '' };
    }
    if (team1Protected.includes(hero.name)) {
      return { status: 'protected', team: 'team1' };
    }
    if (team2Protected.includes(hero.name)) {
      return { status: 'protected', team: 'team2' };
    }
    return { status: 'available', team: '' };
  };

  const handleHeroClick = (hero: Hero) => {
    if (disabled || getHeroStatus(hero).status !== 'available') return;
    
    setPendingHero(hero.name);
    setConfirmDialogOpen(true);
  };

  const handleConfirm = () => {
    if (pendingHero) {
      onSelect(pendingHero);
      setConfirmDialogOpen(false);
      setPendingHero(null);
    }
  };

  const handleCancel = () => {
    setConfirmDialogOpen(false);
    setPendingHero(null);
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
        {heroes.map((hero) => {
          const { status, team } = getHeroStatus(hero);
          
          return (
            <TooltipProvider key={hero.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className={`
                      relative flex flex-col items-center rounded-lg overflow-hidden cursor-pointer transition-all duration-300
                      ${status === 'banned' ? 'opacity-50 grayscale' : ''}
                      ${status === 'protected' && team === 'team1' ? 'ring-2 ring-blue-500' : ''}
                      ${status === 'protected' && team === 'team2' ? 'ring-2 ring-red-500' : ''}
                      ${status === 'available' && !disabled ? 'hover:scale-105 hover:shadow-lg hover:shadow-purple-700/30' : ''}
                      ${disabled ? 'cursor-not-allowed' : status === 'available' ? 'cursor-pointer' : 'cursor-default'}
                      transform-gpu
                    `}
                    onClick={() => handleHeroClick(hero)}
                  >
                    <div className="w-full aspect-square bg-gray-800 overflow-hidden">
                      <img 
                        src={`/heroes/${hero.image}`} 
                        alt={hero.name}
                        className="w-full h-full object-cover transition-transform hover:scale-110 duration-300"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b';
                        }}
                      />
                    </div>
                    <div className="w-full p-3 bg-gray-900 text-center">
                      <p className="text-sm font-medium truncate text-white">{hero.name}</p>
                      <Badge 
                        variant="outline" 
                        className="mt-2 text-xs px-2 py-1 truncate bg-[#FCDF36] text-[#333645] border-[#FCDF36]/50 font-medium"
                      >
                        {hero.role}
                      </Badge>
                    </div>
                    {status === 'banned' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                        <p className="font-bold text-red-500 text-lg tracking-wider">BANNED</p>
                      </div>
                    )}
                    {status === 'protected' && (
                      <div className="absolute top-2 right-2">
                        <Badge className={`${team === 'team1' ? 'bg-blue-600' : 'bg-red-600'} text-white shadow-lg`}>
                          {team === 'team1' ? 'TEAM 1' : 'TEAM 2'}
                        </Badge>
                      </div>
                    )}
                    {!disabled && status === 'available' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/40 opacity-0 hover:opacity-100 transition-all duration-300">
                        <p className={`font-bold ${currentAction === 'ban' ? 'text-yellow-500' : 'text-green-500'} text-lg tracking-wider px-3 py-2 bg-black/80 rounded-full`}>
                          {currentAction === 'ban' ? 'BAN?' : 'PROTECT?'}
                        </p>
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-800 text-white border-gray-700">
                  <p className="font-bold">{hero.name}</p>
                  <p className="text-xs text-gray-400">{hero.role}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
      
      <ConfirmHeroSelection
        isOpen={confirmDialogOpen}
        heroName={pendingHero || ''}
        actionType={currentAction}
        team={currentTeam}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
};

export default HeroGrid;
