
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

interface DraftHistoryProps {
  actions: Action[];
}

const DraftHistory: React.FC<DraftHistoryProps> = ({ actions }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <Card className="bg-gray-800 border-gray-700 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl text-center text-red-500">Draft History</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {actions.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No actions yet. Start the draft to begin.
            </div>
          ) : (
            <div className="space-y-2">
              {actions.map((action, index) => (
                <div 
                  key={index}
                  className="p-2 border border-gray-700 rounded-md flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Badge 
                      className={action.team === 'team1' ? 'bg-blue-500' : 'bg-red-500'}
                    >
                      {action.team === 'team1' ? 'Team 1' : 'Team 2'}
                    </Badge>
                    
                    <Badge 
                      variant="outline" 
                      className={`
                        ${action.type === 'ban' ? 'border-red-500 text-red-500' : 'border-green-500 text-green-500'}
                      `}
                    >
                      {action.type.toUpperCase()}
                    </Badge>
                    
                    <span className="font-medium">{action.name}</span>
                  </div>
                  
                  <span className="text-xs text-gray-400">
                    {formatTime(action.timestamp)}
                  </span>
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
