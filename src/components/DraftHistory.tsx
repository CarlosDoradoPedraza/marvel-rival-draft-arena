
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Action {
  team: string;
  type: 'ban' | 'protect';
  name: string;
  timestamp: Date;
}

interface Hero {
  id: string;
  name: string;
  image: string;
  role: string;
}

interface DraftHistoryProps {
  actions: Action[];
  heroes: Hero[];
}

const DraftHistory: React.FC<DraftHistoryProps> = ({ actions, heroes }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getHeroImage = (heroName: string) => {
    const hero = heroes.find(h => h.name === heroName);
    return hero ? `/heroes/${hero.image}` : '';
  };

  return (
    <Card className="bg-white border shadow-md h-full">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-xl text-center text-[#D53C53]">Draft History</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {actions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No actions yet. Start the draft to begin.
            </div>
          ) : (
            <div className="space-y-3">
              {actions.map((action, index) => (
                <div 
                  key={index}
                  className="p-3 border rounded-lg flex items-center gap-3 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Hero Image */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-800 border-2">
                      <img 
                        src={getHeroImage(action.name)} 
                        alt={action.name}
                        className="w-full h-full object-cover object-top"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b';
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Action Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge 
                        className={`${action.team === 'team1' ? 'bg-blue-500' : 'bg-[#D53C53]'} text-white text-xs`}
                      >
                        {action.team === 'team1' ? 'Team 1' : 'Team 2'}
                      </Badge>
                      
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          action.type === 'ban' ? 'border-red-500 text-red-500 bg-red-50' : 'border-green-500 text-green-500 bg-green-50'
                        }`}
                      >
                        {action.type.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="font-medium text-gray-800 text-sm truncate">{action.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatTime(action.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default DraftHistory;
