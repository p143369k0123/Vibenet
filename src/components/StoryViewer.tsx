import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Story, User } from '../types';
import { StorageService } from '../lib/storage';

interface StoryViewerProps {
  activeUser: User;
  stories: Record<string, Story>;
  following: Record<string, boolean>;
  clickedUsername: string;
  onClose: () => void;
  onViewProfile: (username: string) => void;
}

export default function StoryViewer({
  activeUser,
  stories,
  following,
  clickedUsername,
  onClose,
  onViewProfile
}: StoryViewerProps) {
  const [storyQueue, setStoryQueue] = useState<Story[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Setup stories queue (starting with clicked user, followed by others we follow)
  useEffect(() => {
    const queue: Story[] = [];
    // 1. Clicked user's story
    if (stories[clickedUsername]) {
      queue.push(stories[clickedUsername]);
    }
    // 2. Stories from other users we follow
    Object.values(stories).forEach((s) => {
      if (s.username !== activeUser.username && s.username !== clickedUsername && following[s.username]) {
        queue.push(s);
      }
    });

    setStoryQueue(queue);
    setCurrentIndex(0);
    setProgress(0);
  }, [clickedUsername, stories, following, activeUser.username]);

  // Handle automatic slide timers
  useEffect(() => {
    if (storyQueue.length === 0) return;

    setProgress(0);
    const step = 2; // Progress increment steps
    const intervalTime = 100; // 100ms interval (Total 5 seconds per story)
    
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 100;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [currentIndex, storyQueue]);

  // Handle slide shift side-effect when progress reaches 100%
  useEffect(() => {
    if (progress >= 100) {
      handleNext();
    }
  }, [progress]);

  const handleNext = () => {
    if (currentIndex < storyQueue.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const midPoint = rect.width / 2;

    if (clickX > midPoint) {
      handleNext();
    } else {
      handlePrev();
    }
  };

  if (storyQueue.length === 0 || currentIndex >= storyQueue.length) {
    return null;
  }

  const activeStory = storyQueue[currentIndex];

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50 p-4 animate-[fadeIn_0.15s_linear]">
      <div 
        id="storyContainerWrapper"
        onClick={handleTap}
        className="relative w-full max-w-sm aspect-[9/16] bg-[#050505] rounded-xl overflow-hidden flex flex-col justify-between p-4 shadow-2xl select-none"
      >
        {/* Progress bar */}
        <div className="absolute top-3 left-3 right-3 h-[2px] bg-white/20 rounded-full overflow-hidden z-20 flex space-x-1">
          {storyQueue.map((_, idx) => (
            <div key={idx} className="flex-1 h-full bg-neutral-700/50 rounded-full relative">
              {idx < currentIndex && <div className="absolute inset-0 bg-white" />}
              {idx === currentIndex && (
                <div 
                  className="absolute left-0 top-0 bottom-0 bg-white transition-all duration-[100ms] ease-linear"
                  style={{ width: `${progress}%` }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Top Header metadata info */}
        <div className="flex items-center justify-between z-10 w-full bg-gradient-to-b from-black/80 to-transparent p-2 mt-2 rounded-lg">
          <div className="flex items-center space-x-2.5">
            <img 
              className="w-7 h-7 rounded-full object-cover border border-white/20" 
              src={activeStory.avatar}
              alt={activeStory.username}
            />
            <span 
              onClick={(e) => {
                e.stopPropagation();
                onClose();
                onViewProfile(activeStory.username);
              }}
              className="text-xs font-bold text-white font-mono hover:underline cursor-pointer"
            >
              @{activeStory.username}
            </span>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-white/80 hover:text-white cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Main story display image */}
        <img 
          className="absolute inset-0 w-full h-full object-cover z-0 select-none pointer-events-none" 
          src={activeStory.url} 
          alt="Story Content"
        />
      </div>
    </div>
  );
}
