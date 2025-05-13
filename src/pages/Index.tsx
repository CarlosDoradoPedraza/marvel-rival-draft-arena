
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from 'react-router-dom';
import DraftRoom from '@/components/DraftRoom';
import CreateRoom from '@/components/CreateRoom';

const Index = () => {
  const [roomCreated, setRoomCreated] = useState(false);
  const [roomSettings, setRoomSettings] = useState({
    startingTeam: 'team1',
    bansPerTeam: 3,
    protectsPerTeam: 2,
  });
  const location = useLocation();
  const { toast } = useToast();
  
  useEffect(() => {
    // Check if there's a room parameter in the URL
    const searchParams = new URLSearchParams(location.search);
    const roomParam = searchParams.get('room');
    
    if (roomParam) {
      // A user is joining via link, automatically create/join the room
      setRoomCreated(true);
      toast({
        title: "Joining Room",
        description: `Connected to room: ${roomParam}`,
      });
    }
  }, [location, toast]);
  
  const handleCreateRoom = (settings: any) => {
    setRoomSettings(settings);
    setRoomCreated(true);
  };

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <header className="py-6 bg-[#333645]">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-white">Marvel Rivals Draft Arena</h1>
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
