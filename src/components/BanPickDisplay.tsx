
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Ban, User } from 'lucide-react';

interface Action {
  team: string;
  type: 'ban' | 'protect';
  name: string;
  timestamp: Date;
}

interface BanPickDisplayProps {
  actions: Action[];
}

const BanPickDisplay: React.FC<BanPickDisplayProps> = ({ actions }) => {
  const bannedHeroes = actions.filter(action => action.type === 'ban');
  const protectedHeroes = actions.filter(action => action.type === 'protect');

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
    
    return `https://images.unsplash.com/${imageMap[heroName] || 'photo-1608889175123-8ee362201f81'}?w=150&h=150&fit=crop&crop=face`;
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700/50">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-red-500 via-yellow-500 to-red-600 bg-clip-text text-transparent">
          BAN & PICK
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-yellow-500 mx-auto mt-2 rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Banned Heroes Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Ban className="w-5 h-5 text-red-500" />
            <h3 className="text-xl font-semibold text-red-400">BANNED HEROES</h3>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {bannedHeroes.map((action, index) => (
              <div key={index} className="relative group">
                <div className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-red-500/50 bg-gradient-to-br from-red-900/20 to-red-800/30">
                  <img 
                    src={getHeroImage(action.name)}
                    alt={action.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-red-500/20 backdrop-blur-[1px]"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  
                  {/* Ban Icon */}
                  <div className="absolute bottom-1 right-1 bg-red-600 rounded-full p-1">
                    <Ban className="w-3 h-3 text-white" />
                  </div>
                  
                  {/* Team Badge */}
                  <div className="absolute top-1 left-1">
                    <Badge className={`text-xs px-1 py-0 ${
                      action.team === 'team1' ? 'bg-blue-600' : 'bg-red-600'
                    }`}>
                      {action.team === 'team1' ? 'T1' : 'T2'}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-xs text-center mt-1 text-gray-300 truncate font-medium">
                  {action.name}
                </p>
              </div>
            ))}
            
            {/* Empty slots for remaining bans */}
            {Array.from({ length: Math.max(0, 6 - bannedHeroes.length) }).map((_, index) => (
              <div key={`empty-ban-${index}`} className="relative w-full aspect-square rounded-lg border-2 border-dashed border-red-500/30 bg-gradient-to-br from-red-900/10 to-red-800/20 flex items-center justify-center">
                <Ban className="w-6 h-6 text-red-500/30" />
              </div>
            ))}
          </div>
        </div>

        {/* Protected Heroes Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-yellow-500" />
            <h3 className="text-xl font-semibold text-yellow-400">PROTECTED HEROES</h3>
          </div>
          
          <div className="space-y-4">
            {/* Team 1 Protected */}
            <div>
              <h4 className="text-sm font-semibold text-blue-400 mb-2">TEAM 1</h4>
              <div className="grid grid-cols-2 gap-3">
                {protectedHeroes
                  .filter(action => action.team === 'team1')
                  .map((action, index) => (
                    <div key={index} className="relative group">
                      <div className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-yellow-500 bg-gradient-to-br from-yellow-900/20 to-yellow-600/30 shadow-lg shadow-yellow-500/20">
                        <img 
                          src={getHeroImage(action.name)}
                          alt={action.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        
                        {/* Team Icon */}
                        <div className="absolute bottom-1 right-1 bg-blue-600 rounded-full p-1">
                          <User className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      
                      <p className="text-xs text-center mt-1 text-gray-200 truncate font-medium">
                        {action.name}
                      </p>
                    </div>
                  ))}
                
                {/* Empty slots for Team 1 */}
                {Array.from({ 
                  length: Math.max(0, 2 - protectedHeroes.filter(a => a.team === 'team1').length) 
                }).map((_, index) => (
                  <div key={`empty-t1-${index}`} className="relative w-full aspect-square rounded-lg border-2 border-dashed border-blue-500/30 bg-gradient-to-br from-blue-900/10 to-blue-800/20 flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-500/30" />
                  </div>
                ))}
              </div>
            </div>

            {/* Team 2 Protected */}
            <div>
              <h4 className="text-sm font-semibold text-red-400 mb-2">TEAM 2</h4>
              <div className="grid grid-cols-2 gap-3">
                {protectedHeroes
                  .filter(action => action.team === 'team2')
                  .map((action, index) => (
                    <div key={index} className="relative group">
                      <div className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-yellow-500 bg-gradient-to-br from-yellow-900/20 to-yellow-600/30 shadow-lg shadow-yellow-500/20">
                        <img 
                          src={getHeroImage(action.name)}
                          alt={action.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        
                        {/* Team Icon */}
                        <div className="absolute bottom-1 right-1 bg-red-600 rounded-full p-1">
                          <User className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      
                      <p className="text-xs text-center mt-1 text-gray-200 truncate font-medium">
                        {action.name}
                      </p>
                    </div>
                  ))}
                
                {/* Empty slots for Team 2 */}
                {Array.from({ 
                  length: Math.max(0, 2 - protectedHeroes.filter(a => a.team === 'team2').length) 
                }).map((_, index) => (
                  <div key={`empty-t2-${index}`} className="relative w-full aspect-square rounded-lg border-2 border-dashed border-red-500/30 bg-gradient-to-br from-red-900/10 to-red-800/20 flex items-center justify-center">
                    <User className="w-6 h-6 text-red-500/30" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {actions.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400 text-lg">Draft selections will appear here</p>
          <p className="text-gray-500 text-sm mt-2">Start the draft to begin the Ban & Pick phase</p>
        </div>
      )}
    </div>
  );
};

export default BanPickDisplay;
