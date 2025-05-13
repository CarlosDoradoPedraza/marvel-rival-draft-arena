
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import DraftRoom from '@/components/DraftRoom';
import CreateRoom from '@/components/CreateRoom';

const Index = () => {
  const [roomCreated, setRoomCreated] = useState(false);
  const [roomSettings, setRoomSettings] = useState({
    startingTeam: 'team1',
    bansPerTeam: 3,
    protectsPerTeam: 2,
  });
  
  const handleCreateRoom = (settings: any) => {
    setRoomSettings(settings);
    setRoomCreated(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <header className="py-6 bg-red-600">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center">Marvel Rivals Draft Arena</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!roomCreated ? (
          <CreateRoom onCreateRoom={handleCreateRoom} />
        ) : (
          <DraftRoom settings={roomSettings} />
        )}
      </main>
      
      <footer className="py-4 border-t border-gray-700">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>© 2025 Marvel Rivals Draft Arena | Not affiliated with Marvel or NetEase Games</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
