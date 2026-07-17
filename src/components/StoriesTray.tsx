import { Plus } from 'lucide-react';
import { User, Story } from '../types';

interface StoriesTrayProps {
  activeUser: User;
  stories: Record<string, Story>;
  following: Record<string, boolean>;
  onAddStoryClick: () => void;
  onStoryClick: (username: string) => void;
}

export default function StoriesTray({
  activeUser,
  stories,
  following,
  onAddStoryClick,
  onStoryClick
}: StoriesTrayProps) {
  const hasMyStory = !!stories[activeUser.username];
  
  // Filter stories from users the active user follows
  const activeStories = Object.values(stories).filter(
    story => story.username !== activeUser.username && following[story.username]
  );

  return (
    <div className="w-full py-4 border-b border-[#262626] flex items-center space-x-4 overflow-x-auto hide-scrollbar bg-black px-4 flex-shrink-0">
      {/* Active User's Story Slot */}
      <div className="flex flex-col items-center flex-shrink-0 relative">
        <div 
          onClick={() => hasMyStory ? onStoryClick(activeUser.username) : onAddStoryClick()}
          className="relative cursor-pointer select-none group"
        >
          <div className={`w-14 h-14 rounded-full p-[2px] transition-transform duration-150 active:scale-95 ${
            hasMyStory 
              ? 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]' 
              : 'border border-[#262626]'
          }`}>
            <img 
              className="w-full h-full rounded-full object-cover border border-black"
              src={activeUser.avatar} 
              alt="My Avatar"
            />
          </div>
          <div 
            onClick={(e) => {
              e.stopPropagation();
              onAddStoryClick();
            }}
            className="absolute bottom-0 right-0 bg-[#0095F6] text-white rounded-full w-4 h-4 flex items-center justify-center border border-black text-[10px] shadow-sm hover:bg-[#1877F2] transition-colors"
          >
            <Plus size={10} className="stroke-[3]" />
          </div>
        </div>
        <span className="text-[10px] text-neutral-400 mt-1 max-w-[65px] truncate font-sans">
          Your story
        </span>
      </div>

      {/* Other Followed Users' Stories */}
      {activeStories.map((story) => (
        <div 
          key={story.username}
          onClick={() => onStoryClick(story.username)}
          className="flex flex-col items-center flex-shrink-0 cursor-pointer select-none"
        >
          <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] transition-transform duration-150 active:scale-95">
            <img 
              className="w-full h-full rounded-full object-cover border border-black"
              src={story.avatar} 
              alt={`${story.username} avatar`}
            />
          </div>
          <span className="text-[10px] text-neutral-400 mt-1 max-w-[65px] truncate font-sans">
            @{story.username}
          </span>
        </div>
      ))}
    </div>
  );
}
