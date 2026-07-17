import { X } from 'lucide-react';
import { User } from '../types';
import { StorageService } from '../lib/storage';

interface ShareModalProps {
  postId: string;
  activeUser: User;
  users: Record<string, User>;
  onClose: () => void;
  onViewProfile: (username: string) => void;
}

export default function ShareModal({
  postId,
  activeUser,
  users,
  onClose,
  onViewProfile
}: ShareModalProps) {
  
  const handleDirectShare = (targetUsername: string) => {
    const roomKey = [activeUser.username, targetUsername].sort().join('-');
    const shareMessageText = `📬 Shared a post log link: [Post ID: ${postId}]`;
    
    const newMsg = {
      id: 'msg_' + Date.now(),
      sender: activeUser.username,
      text: shareMessageText,
      timestamp: Date.now()
    };

    StorageService.sendChatMessage(roomKey, newMsg);
    alert(`Post shared directly to @${targetUsername}!`);
    onClose();
  };

  const userList = Object.values(users).filter(u => u.username !== activeUser.username);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-[fadeIn_0.15s_linear] select-none">
      <div className="w-full max-w-xs rounded-xl p-5 border border-[#262626] bg-[#121212] flex flex-col max-h-[400px] shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-3.5 right-3.5 text-neutral-400 hover:text-white cursor-pointer"
        >
          <X size={16} />
        </button>

        <div className="flex justify-between items-center pb-2 border-b border-[#262626] mb-3">
          <span className="text-xs font-bold tracking-widest text-white uppercase font-sans">
            Share Post Link
          </span>
        </div>

        <div className="overflow-y-auto flex-1 mt-1 space-y-2.5 hide-scrollbar max-h-[280px]">
          {userList.length === 0 ? (
            <p className="text-[10px] font-mono text-neutral-500 uppercase text-center py-8">
              No nodes online
            </p>
          ) : (
            userList.map((u) => (
              <div 
                key={u.username}
                className="flex items-center justify-between p-2.5 bg-black rounded-lg border border-[#262626]"
              >
                <div className="flex items-center space-x-2.5">
                  <img 
                    className="w-7 h-7 rounded-full object-cover border border-[#262626]" 
                    src={u.avatar}
                    alt={u.username}
                  />
                  <span 
                    onClick={() => {
                      onClose();
                      onViewProfile(u.username);
                    }}
                    className="text-xs font-bold text-white font-mono cursor-pointer hover:underline"
                  >
                    @{u.username}
                  </span>
                </div>
                <button 
                  onClick={() => handleDirectShare(u.username)}
                  className="bg-[#0095F6] hover:bg-[#1877F2] transition-colors text-[10px] px-3.5 py-1.5 font-bold rounded-lg uppercase tracking-wider text-white cursor-pointer active:scale-95"
                >
                  Send
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
