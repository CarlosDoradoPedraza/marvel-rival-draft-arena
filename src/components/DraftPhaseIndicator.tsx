
import React from 'react';
import { Progress } from "@/components/ui/progress";

interface DraftPhaseIndicatorProps {
  currentTeam: string;
  currentAction: 'ban' | 'protect';
  isComplete: boolean;
}

const DraftPhaseIndicator: React.FC<DraftPhaseIndicatorProps> = ({ 
  currentTeam, 
  currentAction, 
  isComplete 
}) => {
  const teamColor = currentTeam === 'team1' ? 'bg-blue-500' : 'bg-red-500';
  const actionColor = currentAction === 'ban' ? 'text-red-400' : 'text-green-400';

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
      {isComplete ? (
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-green-400">Draft Complete!</h3>
          <p className="text-gray-400">All selections have been made</p>
          <Progress value={100} className="h-2 bg-gray-700" />
        </div>
      ) : (
        <div className="space-y-2">
          <h3 className="text-xl font-bold">
            <span className={currentTeam === 'team1' ? 'text-blue-400' : 'text-red-400'}>
              {currentTeam === 'team1' ? 'Team 1' : 'Team 2'}
            </span>
            {' '}
            <span className="text-white">turn to</span>
            {' '}
            <span className={actionColor}>
              {currentAction === 'ban' ? 'BAN' : 'PROTECT'}
            </span>
          </h3>
          <p className="text-gray-400">
            {currentAction === 'ban' 
              ? 'Select a hero to remove from the draft'
              : 'Select a hero to protect for your team'
            }
          </p>
          <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
            <div className={`h-full ${teamColor}`} style={{ width: '50%' }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DraftPhaseIndicator;
