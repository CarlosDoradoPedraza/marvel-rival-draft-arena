
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

  const getHeroImage = (heroName: string) => {
    // Using different Unsplash images for variety
    const imageMap: { [key: string]: string } = {
      'Iron Man': 'photo-1635805737707-575885ab0820',
      'Spider-Man': 'photo-1608889175123-8ee362201f81',
      'Captain America': 'photo-1608889335941-c0d9b7d0e8e8',
      'Black Panther': 'photo-1608889335941-c0d9b7d0e8e8',
      'Doctor Strange': 'photo-1635805737707-575885ab0820',
      'Hulk': 'photo-1608889175123-8ee362201f81',
      'Thor': 'photo-1635805737707-575885ab0820',
      'Black Widow': 'photo-1608889335941-c0d9b7d0e8e8',
      'Loki': 'photo-1608889175123-8ee362201f81',
      'Storm': 'photo-1635805737707-575885ab0820',
      'Rocket Raccoon': 'photo-1608889335941-c0d9b7d0e8e8',
      'Star-Lord': 'photo-1608889175123-8ee362201f81',
      'Groot': 'photo-1635805737707-575885ab0820',
      'Magneto': 'photo-1608889335941-c0d9b7d0e8e8',
      'Luna Snow': 'photo-1608889175123-8ee362201f81',
      'Magik': 'photo-1635805737707-575885ab0820',
      'Mantis': 'photo-1608889335941-c0d9b7d0e8e8',
      'Namor': 'photo-1608889175123-8ee362201f81',
      'Adam Warlock': 'photo-1635805737707-575885ab0820',
      'Peni Parker': 'photo-1608889335941-c0d9b7d0e8e8'
    };
    
    return `https://images.unsplash.com/${imageMap[heroName] || 'photo-1608889175123-8ee362201f81'}?w=200&h=200&fit=crop&crop=face`;
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'damage': return 'from-red-500 to-orange-500';
      case 'tank': return 'from-blue-500 to-cyan-500';
      case 'support': return 'from-green-500 to-emerald-500';
      default: return 'from-gray-500 to-gray-600';
    }
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
                      relative flex flex-col items-center rounded-xl overflow-hidden cursor-pointer transition-all duration-300 group
                      ${status === 'banned' ? 'opacity-60 saturate-0' : ''}
                      ${status === 'protected' && team === 'team1' ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/30' : ''}
                      ${status === 'protected' && team === 'team2' ? 'ring-2 ring-red-500 shadow-lg shadow-red-500/30' : ''}
                      ${status === 'available' && !disabled ? 'hover:scale-105 hover:shadow-2xl hover:shadow-purple-700/40' : ''}
                      ${disabled ? 'cursor-not-allowed' : status === 'available' ? 'cursor-pointer' : 'cursor-default'}
                      transform-gpu bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900
                      border border-slate-600/50
                    `}
                    onClick={() => handleHeroClick(hero)}
                  >
                    <div className="w-full aspect-square bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden relative">
                      <img 
                        src={getHeroImage(hero.name)}
                        alt={hero.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                      />
                      
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      
                      {/* Role indicator */}
                      <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getRoleColor(hero.role)} text-white shadow-lg`}>
                        {hero.role}
                      </div>
                    </div>
                    
                    <div className="w-full p-3 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-center">
                      <p className="text-sm font-bold truncate text-white group-hover:text-yellow-400 transition-colors">
                        {hero.name}
                      </p>
                    </div>

                    {status === 'banned' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                        <div className="text-center">
                          <p className="font-bold text-red-500 text-lg tracking-wider mb-2">BANNED</p>
                          <div className="w-12 h-1 bg-red-500 mx-auto rounded-full"></div>
                        </div>
                      </div>
                    )}
                    
                    {status === 'protected' && (
                      <div className="absolute top-2 right-2">
                        <Badge className={`${team === 'team1' ? 'bg-blue-600 border-blue-400' : 'bg-red-600 border-red-400'} text-white shadow-lg font-bold`}>
                          {team === 'team1' ? 'TEAM 1' : 'TEAM 2'}
                        </Badge>
                      </div>
                    )}
                    
                    {!disabled && status === 'available' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className={`font-bold ${currentAction === 'ban' ? 'text-red-400' : 'text-green-400'} text-lg tracking-wider px-4 py-2 bg-black/90 rounded-full backdrop-blur-sm border-2 ${currentAction === 'ban' ? 'border-red-500' : 'border-green-500'}`}>
                          {currentAction === 'ban' ? 'BAN?' : 'PROTECT?'}
                        </div>
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-800 text-white border-slate-600">
                  <p className="font-bold">{hero.name}</p>
                  <p className="text-xs text-gray-300">{hero.role}</p>
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
