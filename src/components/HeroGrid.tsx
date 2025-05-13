
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
}

const HeroGrid: React.FC<HeroGridProps> = ({ 
  heroes, 
  bannedHeroes, 
  team1Protected, 
  team2Protected, 
  onSelect,
  disabled
}) => {
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

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3">
      {heroes.map((hero) => {
        const { status, team } = getHeroStatus(hero);
        
        return (
          <TooltipProvider key={hero.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className={`
                    relative flex flex-col items-center rounded-lg overflow-hidden cursor-pointer transition-all 
                    ${status === 'banned' ? 'opacity-50 grayscale' : ''}
                    ${status === 'protected' && team === 'team1' ? 'ring-2 ring-blue-500' : ''}
                    ${status === 'protected' && team === 'team2' ? 'ring-2 ring-red-500' : ''}
                    ${status === 'available' && !disabled ? 'hover:scale-105' : ''}
                    ${disabled ? 'cursor-default' : ''}
                  `}
                  onClick={() => !disabled && status === 'available' && onSelect(hero.name)}
                >
                  <div className="w-full aspect-square bg-gray-700">
                    <img 
                      src={`https://images.unsplash.com/photo-1488590528505-98d2b5aba04b`} 
                      alt={hero.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-full p-2 bg-gray-900 text-center">
                    <p className="text-sm font-medium truncate">{hero.name}</p>
                    <Badge 
                      variant="outline" 
                      className="mt-1 text-xs truncate"
                    >
                      {hero.role}
                    </Badge>
                  </div>
                  {status === 'banned' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                      <p className="font-bold text-red-500">BANNED</p>
                    </div>
                  )}
                  {status === 'protected' && (
                    <div className="absolute top-1 right-1">
                      <Badge className={team === 'team1' ? 'bg-blue-500' : 'bg-red-500'}>
                        {team === 'team1' ? 'TEAM 1' : 'TEAM 2'}
                      </Badge>
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{hero.name}</p>
                <p className="text-xs text-gray-400">{hero.role}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
};

export default HeroGrid;
