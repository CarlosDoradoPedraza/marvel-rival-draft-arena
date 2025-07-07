
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import DraftRoom from '@/components/DraftRoom';
import CreateRoom from '@/components/CreateRoom';

const Index = () => {
  const [roomCreated, setRoomCreated] = useState(false);
  const [roomSettings, setRoomSettings] = useState({
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-100">
      <header className="py-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50 shadow-2xl">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-red-500 via-yellow-500 to-red-600 bg-clip-text text-transparent">
            Marvel Rivals Draft Arena
          </h1>
          <p className="text-center text-slate-300 mt-3 text-lg font-medium">Local Simulation Mode</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!roomCreated ? (
          <CreateRoom onCreateRoom={handleCreateRoom} />
        ) : (
          <DraftRoom settings={roomSettings} />
        )}
      </main>
      
      <footer className="py-6 border-t border-slate-700/50 bg-slate-900/50">
        <div className="container mx-auto px-4 text-center text-slate-400">
          <p>© 2025 Marvel Rivals Draft Arena | Not affiliated with Marvel or NetEase Games</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
