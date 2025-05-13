
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface CreateRoomProps {
  onCreateRoom: (settings: {
    startingTeam: string;
    bansPerTeam: number;
    protectsPerTeam: number;
  }) => void;
}

const CreateRoom: React.FC<CreateRoomProps> = ({ onCreateRoom }) => {
  const [settings, setSettings] = useState({
    startingTeam: 'team1',
    bansPerTeam: 3,
    protectsPerTeam: 2,
  });

  const handleChange = (key: string, value: string | number) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-2xl text-center text-red-500">Create Draft Room</CardTitle>
        <CardDescription className="text-center text-gray-400">
          Configure your draft settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="starting-team">Starting Team</Label>
          <Select 
            value={settings.startingTeam} 
            onValueChange={(value) => handleChange('startingTeam', value)}
          >
            <SelectTrigger id="starting-team" className="bg-gray-700 border-gray-600">
              <SelectValue placeholder="Select team" />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              <SelectItem value="team1">Team 1</SelectItem>
              <SelectItem value="team2">Team 2</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bans">Bans per Team</Label>
          <Select 
            value={settings.bansPerTeam.toString()} 
            onValueChange={(value) => handleChange('bansPerTeam', parseInt(value))}
          >
            <SelectTrigger id="bans" className="bg-gray-700 border-gray-600">
              <SelectValue placeholder="Select number" />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              {[1, 2, 3, 4, 5].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="protects">Protects per Team</Label>
          <Select 
            value={settings.protectsPerTeam.toString()} 
            onValueChange={(value) => handleChange('protectsPerTeam', parseInt(value))}
          >
            <SelectTrigger id="protects" className="bg-gray-700 border-gray-600">
              <SelectValue placeholder="Select number" />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              {[1, 2, 3, 4].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full bg-red-600 hover:bg-red-700"
          onClick={() => onCreateRoom(settings)}
        >
          Create Room
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CreateRoom;
