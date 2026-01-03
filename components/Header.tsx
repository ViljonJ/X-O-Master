
import React from 'react';
import Button from './Button';
import { UserProfile } from '../types';

interface HeaderProps {
  title: string;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  userProfile?: UserProfile;
}

const Header: React.FC<HeaderProps> = ({ title, onProfileClick, onSettingsClick, userProfile }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-10 p-4 bg-white/40 backdrop-blur-lg shadow-sm flex items-center justify-between">
      <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      <nav className="flex items-center space-x-4">
        {userProfile && (
          <Button variant="ghost" onClick={onProfileClick} className="flex items-center space-x-2 p-1">
            <img src={userProfile.avatarUrl} alt={userProfile.username} className="w-8 h-8 rounded-full border-2 border-blue-600" />
            <span className="hidden sm:inline text-gray-700 font-medium">{userProfile.username}</span>
          </Button>
        )}
        {onSettingsClick && (
          <Button variant="ghost" onClick={onSettingsClick} aria-label="Settings">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Button>
        )}
      </nav>
    </header>
  );
};

export default Header;
