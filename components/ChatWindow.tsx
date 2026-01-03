
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, ReactionType, UserProfile } from '../types';
import Button from './Button';
import { webSocketService } from '../services/webSocketService';

interface ChatWindowProps {
  currentUser: UserProfile;
  roomId?: string; // Optional for online games
}

const ChatWindow: React.FC<ChatWindowProps> = ({ currentUser, roomId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Mock message listener for online play
    if (roomId) {
      const unsubscribe = webSocketService.onMessage((msg) => {
        if (msg.type === 'CHAT_MESSAGE') {
          setMessages((prev) => [...prev, msg.payload]);
        }
      });
      return () => unsubscribe();
    }
  }, [roomId]);

  useEffect(() => {
    // Scroll to bottom when messages update
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: currentUser.username,
        text: newMessage.trim(),
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, message]);

      if (roomId) {
        webSocketService.sendMessage('CHAT_MESSAGE', message);
      }
      setNewMessage('');
    }
  };

  const handleSendReaction = (reaction: ReactionType) => {
    const reactionMessage: ChatMessage = {
      id: `reaction-${Date.now()}`,
      sender: currentUser.username,
      text: `reacted ${reaction}`,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, reactionMessage]);
    if (roomId) {
      webSocketService.sendReaction(reaction); // Mock API call
    }
  };

  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="glass-card flex flex-col h-full max-h-[400px] md:max-h-[500px] w-full p-4">
      <h3 className="text-xl font-semibold text-gray-700 mb-3 border-b pb-2">Game Chat</h3>
      <div className="flex-grow overflow-y-auto pr-2 mb-4 scrollbar-hide">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-sm text-center">No messages yet. Say hello!</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === currentUser.username ? 'justify-end' : 'justify-start'} mb-2`}>
              <div className={`p-2 rounded-lg max-w-[80%] ${msg.sender === currentUser.username ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                <div className="font-semibold text-xs mb-1">
                  {msg.sender} <span className="text-gray-500 ml-1 text-xs">{formatTimestamp(msg.timestamp)}</span>
                </div>
                <p className="text-sm">{msg.text}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex space-x-2 mb-4">
        {Object.values(ReactionType).map((reaction) => (
          <Button
            key={reaction}
            onClick={() => handleSendReaction(reaction)}
            variant="ghost"
            size="sm"
            className="text-lg p-1"
          >
            {reaction}
          </Button>
        ))}
      </div>

      <form onSubmit={handleSendMessage} className="flex space-x-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-grow p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/70 text-gray-800"
        />
        <Button type="submit" disabled={!newMessage.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
};

export default ChatWindow;
