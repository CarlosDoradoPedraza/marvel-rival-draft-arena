
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
            <div className="space-y-2">
              {actions.map((action, index) => (
                <div 
                  key={index}
                  className="p-2 border rounded-md flex items-center justify-between bg-white shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <Badge 
                      className={action.team === 'team1' ? 'bg-blue-500' : 'bg-[#D53C53]'}
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
                    
                    <span className="font-medium text-gray-800">{action.name}</span>
                  </div>
                  
                  <span className="text-xs text-gray-500">
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
