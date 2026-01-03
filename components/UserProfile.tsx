
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import Button from './Button';

interface UserProfileProps {
  user: UserProfile;
  onClose?: () => void;
  isEditable?: boolean;
  onUpdateProfile?: (updatedUser: UserProfile) => void; // New prop for updating profile
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onClose, isEditable = false, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<{ username: string; avatarUrl: string }>({
    username: user.username,
    avatarUrl: user.avatarUrl,
  });
  const [hasImageLoadError, setHasImageLoadError] = useState(false); // NEW: State to track image loading errors

  // Sync editedProfile with user prop if user prop changes while not editing
  useEffect(() => {
    if (!isEditing) {
      setEditedProfile({
        username: user.username,
        avatarUrl: user.avatarUrl,
      });
      setHasImageLoadError(false); // Reset error state when not editing or user prop changes
    }
  }, [user.username, user.avatarUrl, isEditing]);

  // Reset image error whenever avatarUrl (edited or original) changes to attempt loading the new image
  useEffect(() => {
    setHasImageLoadError(false);
  }, [editedProfile.avatarUrl, user.avatarUrl]);


  const statusColor = user.onlineStatus === 'online' ? 'bg-green-500' : user.onlineStatus === 'away' ? 'bg-yellow-500' : 'bg-gray-400';

  const handleSave = () => {
    const hasUsernameChanged = editedProfile.username.trim() !== user.username;
    const hasAvatarUrlChanged = editedProfile.avatarUrl.trim() !== user.avatarUrl;

    if (hasUsernameChanged || hasAvatarUrlChanged) {
      const updatedUser = { ...user, username: editedProfile.username.trim(), avatarUrl: editedProfile.avatarUrl.trim() };
      onUpdateProfile?.(updatedUser); // Call the callback to update the parent state
      console.log('Profile saved:', updatedUser);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    // Reset to original username and avatar URL
    setEditedProfile({
      username: user.username,
      avatarUrl: user.avatarUrl,
    });
    setHasImageLoadError(false); // Reset error on cancel
    setIsEditing(false);
  };

  const isSaveDisabled =
    editedProfile.username.trim() === '' ||
    (editedProfile.username.trim() === user.username && editedProfile.avatarUrl.trim() === user.avatarUrl);

  const currentAvatarSrc = isEditing ? editedProfile.avatarUrl : user.avatarUrl;

  return (
    <div className="flex flex-col items-center p-6 glass-card animate-fade-in w-full max-w-sm">
      <div className="relative mb-4 group">
        {hasImageLoadError ? (
          // NEW: Fallback UI for broken image
          <div className="w-24 h-24 rounded-full border-4 border-red-600 shadow-md bg-gray-200 flex flex-col items-center justify-center text-red-500 text-xs text-center p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Broken Image
          </div>
        ) : (
          <img
            src={currentAvatarSrc}
            alt={isEditing ? editedProfile.username : user.username} // Alt text also reflects edited state
            className="w-24 h-24 rounded-full border-4 border-blue-600 shadow-md object-cover"
            onError={() => {
              setHasImageLoadError(true); // Set error state on image load failure
              console.warn('Failed to load avatar image:', currentAvatarSrc);
            }}
          />
        )}
        <span className={`absolute bottom-0 right-0 w-5 h-5 rounded-full ${statusColor} border-2 border-white`}></span>
        {isEditing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full cursor-pointer text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Edit
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.38-2.827-2.828z" />
            </svg>
          </div>
        )}
      </div>
      {isEditing ? (
        <>
          <input
            type="text"
            value={editedProfile.username}
            onChange={(e) => setEditedProfile({ ...editedProfile, username: e.target.value })}
            className="text-3xl font-bold text-gray-800 mb-2 text-center bg-transparent border-b-2 border-blue-500 focus:outline-none w-full max-w-[80%]"
            aria-label="Edit username"
          />
          <input
            type="text" // Using text type for simplicity with mock image URLs
            value={editedProfile.avatarUrl}
            onChange={(e) => setEditedProfile({ ...editedProfile, avatarUrl: e.target.value })}
            placeholder="Enter new avatar URL"
            className="text-sm text-gray-700 mb-4 text-center bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 w-full max-w-[90%] p-1"
            aria-label="Edit avatar URL"
          />
        </>
      ) : (
        <h3 className="text-3xl font-bold text-gray-800 mb-2">{user.username}</h3>
      )}
      <p className="text-lg text-gray-600 mb-4 font-medium">ELO: {user.elo}</p>

      <div className="grid grid-cols-3 gap-4 w-full text-center mb-6">
        <div className="p-3 bg-blue-50 rounded-lg shadow-sm">
          <p className="text-xl font-bold text-blue-700">{user.stats.wins}</p>
          <p className="text-sm text-gray-600">Wins</p>
        </div>
        <div className="p-3 bg-red-50 rounded-lg shadow-sm">
          <p className="text-xl font-bold text-red-700">{user.stats.losses}</p>
          <p className="text-sm text-gray-600">Losses</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg shadow-sm">
          <p className="text-xl font-bold text-gray-700">{user.stats.draws}</p>
          <p className="text-sm text-gray-600">Draws</p>
        </div>
      </div>

      {isEditable && (
        <div className="flex flex-col space-y-2 w-full">
          {isEditing ? (
            <>
              <Button onClick={handleSave} fullWidth variant="primary" disabled={isSaveDisabled}>
                Save Changes
              </Button>
              <Button onClick={handleCancelEdit} fullWidth variant="secondary">
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} fullWidth variant="secondary">
              Edit Profile
            </Button>
          )}
        </div>
      )}

      {onClose && !isEditing && (
        <Button onClick={onClose} fullWidth variant="ghost" className="mt-4">
          Close
        </Button>
      )}
    </div>
  );
};

export default UserProfile;