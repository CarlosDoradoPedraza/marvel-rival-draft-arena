
import React from 'react';
import { Progress } from "@/components/ui/progress";

interface DraftPhaseIndicatorProps {
  currentTeam: string;
  currentAction: 'ban' | 'protect';
  isComplete: boolean;
  isYourTurn?: boolean;
  team1Name?: string;
  team2Name?: string;
}

const DraftPhaseIndicator: React.FC<DraftPhaseIndicatorProps> = ({ 
  currentTeam, 
  currentAction, 
  isComplete,
  isYourTurn = false,
  team1Name = 'Team 1',
  team2Name = 'Team 2'
}) => {
  const teamColor = currentTeam === 'team1' ? 'bg-blue-500' : 'bg-[#D53C53]';
  const actionColor = currentAction === 'ban' ? 'text-red-600' : 'text-green-600';

  return (
    <div className="bg-white border rounded-lg p-4 text-center shadow-md">
      {isComplete ? (
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-green-600">Draft Complete!</h3>
          <p className="text-gray-600">All selections have been made</p>
          <Progress value={100} className="h-2 bg-gray-200" />
        </div>
      ) : (
        <div className="space-y-2">
          <h3 className="text-xl font-bold">
            <span className={currentTeam === 'team1' ? 'text-blue-600' : 'text-[#D53C53]'}>
              {currentTeam === 'team1' ? team1Name : team2Name}
            </span>
            {' '}
            <span className="text-gray-800">turn to</span>
            {' '}
            <span className={actionColor}>
              {currentAction === 'ban' ? 'BAN' : 'PROTECT'}
            </span>
            {isYourTurn && (
              <span className="ml-2 animate-pulse text-[#D53C53]">(Your Turn)</span>
            )}
          </h3>
          <p className="text-gray-600">
            {isYourTurn 
              ? (currentAction === 'ban' 
                ? 'Select a hero to remove from the draft' 
                : 'Select a hero to protect for your team')
              : 'Waiting for the other team to make their selection'
            }
          </p>
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div className={`h-full ${teamColor}`} style={{ width: '50%' }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DraftPhaseIndicator;
