import { ArrowLeft } from 'lucide-react';
import { User } from '../types';
import { StorageService } from '../lib/storage';

interface ConnectionsModalProps {
  type: 'followers' | 'following';
  username: string;
  users: Record<string, User>;
  onClose: () => void;
  onViewProfile: (username: string) => void;
}

export default function ConnectionsModal({
  type,
  username,
  users,
  onClose,
  onViewProfile
}: ConnectionsModalProps) {
  
  // Fetch corresponding list from local db storage keys
  const listKeys = type === 'followers' 
    ? Object.keys(StorageService.getFollowers(username))
    : Object.keys(StorageService.getFollowing(username));

  return (
    <div className="fixed inset-0 bg-black z-50 p-4 flex flex-col justify-start max-w-lg mx-auto select-none animate-[fadeIn_0.12s_linear]">
      {/* Header back */}
      <div className="flex items-center space-x-4 py-2 border-b border-[#262626] flex-shrink-0">
        <button 
          onClick={onClose}
          className="text-white hover:opacity-75 transition-opacity p-1.5 cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>
        <h3 className="text-xs font-black text-neutral-400 tracking-widest uppercase font-mono">
          {type} Node List
        </h3>
      </div>

      {/* Connection elements lists */}
      <div className="space-y-2 overflow-y-auto flex-1 my-3 pr-1 hide-scrollbar">
        {listKeys.length === 0 ? (
          <p className="text-xs text-neutral-500 italic text-center py-16 font-mono">
            Empty relationship set.
          </p>
        ) : (
          listKeys.map((userKey) => {
            const profileData = users[userKey];
            if (!profileData) return null;

            return (
              <div 
                key={userKey}
                onClick={() => {
                  onClose();
                  onViewProfile(profileData.username);
                }}
                className="flex items-center space-x-3.5 p-3 bg-[#121212] border border-[#262626] rounded-xl cursor-pointer hover:border-neutral-700 transition-colors text-left"
              >
                <img 
                  className="w-9 h-9 rounded-full object-cover border border-[#262626]" 
                  src={profileData.avatar}
                  alt={profileData.username}
                />
                <div>
                  <p className="text-xs font-bold text-white font-mono">
                    @{profileData.username}
                  </p>
                  <p className="text-[10px] text-neutral-400 uppercase font-sans">
                    {profileData.name}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
