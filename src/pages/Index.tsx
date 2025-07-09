
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import DraftRoom from '@/components/DraftRoom';
import CreateRoom from '@/components/CreateRoom';

const Index = () => {
  const [roomCreated, setRoomCreated] = useState(false);
  const [roomSettings, setRoomSettings] = useState({
    team1Name: 'Team 1',
    team2Name: 'Team 2',
    startingTeam: 'team1',
    bansPerTeam: 3,
    protectsPerTeam: 2,
  });
  const { toast } = useToast();
  
  const handleCreateRoom = (settings: any) => {
    setRoomSettings(settings);
    setRoomCreated(true);
    toast({
      title: "Draft Started",
      description: "Local draft simulation ready",
    });
  };

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <header className="py-6 bg-[#333645]">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-white">Marvel Rivals Draft Arena</h1>
          <p className="text-center text-gray-300 mt-2">Local Simulation Mode</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!roomCreated ? (
          <CreateRoom onCreateRoom={handleCreateRoom} />
        ) : (
          <DraftRoom settings={roomSettings} />
        )}
      </main>
      
      <footer className="py-4 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2025 Marvel Rivals Draft Arena | Not affiliated with Marvel or NetEase Games</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
