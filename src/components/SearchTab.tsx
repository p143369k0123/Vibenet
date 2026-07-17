import React, { useState } from 'react';
import { Search as SearchIcon, ArrowLeft, MessageSquare, BadgeCheck } from 'lucide-react';
import { User, Post } from '../types';
import { StorageService } from '../lib/storage';

interface SearchTabProps {
  activeUser: User;
  posts: Post[];
  users: Record<string, User>;
  following: Record<string, boolean>;
  onFollowUpdated: () => void;
  onOpenMessage: (username: string) => void;
  onOpenLightbox: (images: string[], index: number) => void;
  onOpenConnections: (type: 'followers' | 'following', username: string) => void;
}

export default function SearchTab({
  activeUser,
  posts,
  users,
  following,
  onFollowUpdated,
  onOpenMessage,
  onOpenLightbox,
  onOpenConnections
}: SearchTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [visitedUser, setVisitedUser] = useState<User | null>(null);

  const handleUserClick = (user: User) => {
    setVisitedUser(user);
  };

  const handleBackToSearch = () => {
    setVisitedUser(null);
    setSearchQuery('');
  };

  const handleFollowToggle = (targetUsername: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isCurrentlyFollowing = !!following[targetUsername];
    if (isCurrentlyFollowing) {
      StorageService.unfollowUser(activeUser.username, targetUsername);
    } else {
      StorageService.followUser(activeUser.username, targetUsername);
    }
    onFollowUpdated();
    
    // Update local visited user follower count state dynamically
    if (visitedUser && visitedUser.username === targetUsername) {
      setVisitedUser({ ...visitedUser });
    }
  };

  // Filter list of searchable users (excluding the active user themselves)
  const filteredUsers = Object.values(users).filter((u) => {
    if (u.username === activeUser.username) return false;
    const q = searchQuery.toLowerCase();
    return u.username.includes(q) || u.name.toLowerCase().includes(q);
  });

  // Get visited user stats
  const visitedUserPosts = posts.filter(p => p.author === visitedUser?.username);
  const visitedFollowers = visitedUser ? StorageService.getFollowers(visitedUser.username) : {};
  const visitedFollowing = visitedUser ? StorageService.getFollowing(visitedUser.username) : {};
  const isFollowingVisited = visitedUser ? !!following[visitedUser.username] : false;

  return (
    <div className="w-full flex flex-col min-h-[75vh] select-none">
      {!visitedUser ? (
        // SEARCH LIST VIEW
        <div className="space-y-4 flex flex-col px-4 pt-4">
          <div className="flex items-center space-x-3 py-1 border-b border-[#262626] flex-shrink-0">
            <h3 className="text-xs font-black text-neutral-400 tracking-widest uppercase font-sans">
              Search Profiles
            </h3>
          </div>
          <div className="relative mt-1 flex-shrink-0">
            <input
              id="searchProfilesInput"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-xs rounded-lg bg-[#121212] border border-[#262626] text-white focus:border-neutral-400 focus:outline-none transition-colors font-sans"
              placeholder="Search user nodes..."
            />
            <SearchIcon
              className="absolute left-3 top-3.5 text-neutral-500"
              size={14}
            />
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[58vh] pr-1 hide-scrollbar">
            {searchQuery && filteredUsers.length === 0 && (
              <p className="text-xs text-neutral-500 italic text-center py-10 font-mono">
                No users found.
              </p>
            )}

            {searchQuery &&
              filteredUsers.map((u) => {
                const isF = !!following[u.username];
                return (
                  <div
                    key={u.username}
                    onClick={() => handleUserClick(u)}
                    className="flex items-center justify-between bg-[#121212] p-3 border border-[#262626] rounded-xl hover:border-neutral-700 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        className="w-9 h-9 rounded-full object-cover border border-[#262626]"
                        src={u.avatar}
                        alt={u.username}
                      />
                      <div className="text-left">
                        <p className="text-xs font-bold text-white font-mono flex items-center">
                          @{u.username}
                          <BadgeCheck size={14} className="text-black fill-[#0095F6] ml-1 flex-shrink-0" />
                        </p>
                        <p className="text-[10px] text-neutral-400 uppercase font-sans">
                          {u.name}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleFollowToggle(u.username, e)}
                      className={`text-[10px] font-bold px-4 py-1.5 rounded-lg uppercase tracking-wider transition-colors cursor-pointer ${
                        isF
                          ? 'bg-[#262626] text-white hover:bg-[#363636]'
                          : 'bg-[#0095F6] text-white hover:bg-[#1877F2]'
                      }`}
                    >
                      {isF ? 'Following' : 'Follow'}
                    </button>
                  </div>
                );
              })}
            {!searchQuery && (
              <div className="text-center py-12 text-neutral-500">
                <SearchIcon size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-xs font-mono uppercase tracking-widest">
                  Enter credentials or usernames
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        // VISITED USER PROFILE VIEW
        <div className="pt-0 space-y-4 animate-[fadeIn_0.15s_linear]">
          <div className="flex items-center space-x-3 py-3.5 border-b border-[#262626] px-4 bg-black">
            <button
              onClick={handleBackToSearch}
              className="text-white hover:opacity-75 transition-opacity p-1 cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>
            <h3 className="text-sm font-bold text-white tracking-wide font-mono select-text flex items-center">
              @{visitedUser.username}
              <BadgeCheck size={14} className="text-black fill-[#0095F6] ml-1 flex-shrink-0" />
            </h3>
          </div>

          {/* Profile Stats Panel */}
          <div className="flex items-center space-x-8 px-5 mt-4">
            <img
              className="w-20 h-20 rounded-full object-cover border border-[#262626] p-[2px]"
              src={visitedUser.avatar}
              alt={visitedUser.name}
            />
            <div className="flex-1">
              <h4 className="text-base font-semibold text-white tracking-wide select-text">
                {visitedUser.name}
              </h4>
              <div className="flex space-x-6 mt-3 text-left">
                <div className="text-xs text-neutral-400">
                  <span className="font-bold text-white block text-sm">
                    {visitedUserPosts.length}
                  </span>
                  posts
                </div>
                <div 
                  onClick={() => onOpenConnections('followers', visitedUser.username)}
                  className="text-xs text-neutral-400 cursor-pointer hover:text-white"
                >
                  <span className="font-bold text-white block text-sm">
                    {Object.keys(visitedFollowers).length}
                  </span>
                  followers
                </div>
                <div 
                  onClick={() => onOpenConnections('following', visitedUser.username)}
                  className="text-xs text-neutral-400 cursor-pointer hover:text-white"
                >
                  <span className="font-bold text-white block text-sm">
                    {Object.keys(visitedFollowing).length}
                  </span>
                  following
                </div>
              </div>
            </div>
          </div>

          {/* Bio text */}
          <div className="px-5 mt-3 text-left">
            <p className="text-xs text-white whitespace-pre-wrap leading-relaxed font-sans select-text">
              {visitedUser.bio}
            </p>
          </div>

          {/* Actions Row */}
          <div className="flex space-x-2 px-5 mt-4">
            <button
              onClick={(e) => handleFollowToggle(visitedUser.username, e)}
              className={`flex-1 text-xs py-2 rounded-lg font-bold uppercase tracking-wider transition-all cursor-pointer ${
                isFollowingVisited
                  ? 'bg-[#262626] text-white hover:bg-[#363636]'
                  : 'bg-[#0095F6] text-white hover:bg-[#1877F2]'
              }`}
            >
              {isFollowingVisited ? 'Following' : 'Follow'}
            </button>
            <button
              onClick={() => onOpenMessage(visitedUser.username)}
              className="flex-1 bg-[#262626] text-white hover:bg-[#363636] text-xs py-2 rounded-lg font-bold uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer"
            >
              <MessageSquare size={14} />
              <span>Message</span>
            </button>
          </div>

          {/* User Posts Grid */}
          <div className="grid grid-cols-3 gap-[2px] pt-4 px-1 pb-20">
            {visitedUserPosts.length === 0 ? (
              <div className="col-span-3 text-center py-16 text-neutral-500 font-mono text-xs uppercase tracking-wider">
                No posts uploaded
              </div>
            ) : (
              visitedUserPosts.map((post, idx) => (
                <img
                  key={post.id}
                  className="aspect-square w-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                  src={post.url}
                  alt="Post thumbnail"
                  onClick={() =>
                    onOpenLightbox(
                      visitedUserPosts.map((p) => p.url),
                      idx
                    )
                  }
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
