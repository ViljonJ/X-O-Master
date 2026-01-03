
import React, { useState, useEffect } from 'react';
import Button from './Button';
import { UserProfile } from '../types';
import { webSocketService } from '../services/webSocketService'; // Import the mock service

interface OnlineLobbyProps {
  onBackToModes: () => void;
  onStartOnlineGame: (roomId: string) => void;
  currentUser: UserProfile;
}

const OnlineLobby: React.FC<OnlineLobbyProps> = ({ onBackToModes, onStartOnlineGame, currentUser }) => {
  const [roomId, setRoomId] = useState<string>('');
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [loadingFriends, setLoadingFriends] = useState<boolean>(true);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(webSocketService.getIsConnected());

  useEffect(() => {
    const handleOpen = () => {
        setIsConnected(true);
        setIsConnecting(false);
    };
    const handleClose = () => {
        setIsConnected(false);
    };

    const unsubscribeOpen = webSocketService.onOpen(handleOpen);
    const unsubscribeClose = webSocketService.onClose(handleClose);

    if (!isConnected && !isConnecting) {
        setIsConnecting(true);
        webSocketService.connect();
    }

    // Load mock friends
    webSocketService.getFriends().then(data => {
      setFriends(data);
      setLoadingFriends(false);
    });

    return () => {
        unsubscribeOpen();
        unsubscribeClose();
        // Do not disconnect automatically here, assume persistent connection for demo
    };
  }, [isConnected, isConnecting]);


  const handleCreateRoom = () => {
    const newRoomId = `room-${Math.random().toString(36).substring(2, 9)}`;
    console.log(`Mock: Created room ${newRoomId}`);
    onStartOnlineGame(newRoomId);
  };

  const handleJoinRoom = () => {
    if (roomId.trim()) {
      console.log(`Mock: Joined room ${roomId}`);
      onStartOnlineGame(roomId.trim());
    }
  };

  return (
    <div className="flex flex-col space-y-6 w-full max-w-lg p-6 glass-card animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-800 text-center">Online Multiplayer (Mock)</h2>

      {!isConnected && isConnecting && (
          <p className="text-center text-gray-600">Connecting to server...</p>
      )}
      {isConnected && (
          <p className="text-center text-green-600 font-semibold">Connected to mock server!</p>
      )}

      <div className="flex flex-col space-y-3">
        <h3 className="text-xl font-semibold text-gray-700">Join a Room</h3>
        <input
          type="text"
          placeholder="Enter Room Code"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/70"
        />
        <Button onClick={handleJoinRoom} fullWidth disabled={!roomId.trim() || !isConnected}>
          Join Room
        </Button>
      </div>

      <div className="flex items-center my-4">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="mx-4 text-gray-500">OR</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      <div className="flex flex-col space-y-3">
        <h3 className="text-xl font-semibold text-gray-700">Create New Room</h3>
        <Button onClick={handleCreateRoom} fullWidth disabled={!isConnected}>
          Create Room
        </Button>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Friends List (Mock)</h3>
        {loadingFriends ? (
          <p className="text-gray-500">Loading friends...</p>
        ) : (
          <ul className="space-y-3">
            {friends.map(friend => (
              <li key={friend.id} className="flex items-center justify-between p-3 glass-card shadow-sm">
                <div className="flex items-center space-x-3">
                  <img src={friend.avatarUrl} alt={friend.username} className="w-10 h-10 rounded-full" />
                  <div>
                    <span className="font-medium text-gray-800">{friend.username}</span>
                    <span className={`ml-2 text-sm ${friend.onlineStatus === 'online' ? 'text-green-500' : 'text-gray-500'}`}>
                      ({friend.onlineStatus})
                    </span>
                  </div>
                </div>
                <Button size="sm" variant="secondary">Invite</Button>
              </li>
            ))}
            {friends.length === 0 && <p className="text-gray-500">No friends found. Add some!</p>}
          </ul>
        )}
      </div>

      <div className="pt-6 border-t border-gray-200">
        <Button onClick={onBackToModes} fullWidth variant="ghost" size="md">
          Back to Modes
        </Button>
      </div>
    </div>
  );
};

export default OnlineLobby;
