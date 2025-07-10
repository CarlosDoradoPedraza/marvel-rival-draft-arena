
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmHeroSelectionProps {
  isOpen: boolean;
  heroName: string;
  actionType: 'ban' | 'protect';
  team: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmHeroSelection: React.FC<ConfirmHeroSelectionProps> = ({
  isOpen,
  heroName,
  actionType,
  team,
  onConfirm,
  onCancel,
}) => {
  if (!heroName) return null;
  
  const teamColor = team === 'team1' ? 'text-blue-400' : 'text-red-400';
  const actionColor = actionType === 'ban' ? 'text-yellow-500' : 'text-green-500';
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl">Confirm Selection</DialogTitle>
          <DialogDescription className="text-gray-300 text-lg mt-2">
            You are about to <span className={actionColor}>{actionType}</span> the hero <span className="font-bold">{heroName}</span> for <span className={teamColor}>{team === 'team1' ? 'Team 1' : 'Team 2'}</span>.
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4 flex items-center justify-center">
          <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-800 border-2">
            <img 
              src={`/heroes/${(() => {
                // Use the exact image names from the heroes data
                if (heroName === 'Cloak & Dagger') return 'cloak-dagger.jpg';
                if (heroName === 'Jeff the Land Shark') return 'jeff.jpg';
                if (heroName === 'Rocket Raccoon') return 'rocket.jpg';
                if (heroName === 'Psylocke') return 'psylock.jpg';
                if (heroName === 'Squirrel Girl') return 'squirer-girl.jpg';
                // Default fallback
                return heroName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '.jpg';
              })()}`}
              alt={heroName}
              className="w-full h-full object-cover object-top"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b';
              }}
            />
          </div>
        </div>
        
        <DialogFooter className="flex gap-3 mt-4">
          <Button
            variant="outline"
            onClick={onCancel}
            className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className={actionType === 'ban' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}
          >
            Confirm {actionType.charAt(0).toUpperCase() + actionType.slice(1)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmHeroSelection;
