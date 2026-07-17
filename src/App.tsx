import React, { useState, useEffect } from 'react';
import { Home, Search, MessageSquare, PlusSquare, LogOut, Loader2, BadgeCheck } from 'lucide-react';
import { StorageService } from './lib/storage';
import { User, Post, Story, TabType } from './types';
import { injectRandomFreshPost } from './lib/freshFeeds';

// Import Modular Components
import AuthPanel from './components/AuthPanel';
import StoriesTray from './components/StoriesTray';
import PostCard from './components/PostCard';
import SearchTab from './components/SearchTab';
import MessagesTab from './components/MessagesTab';
import ProfileTab from './components/ProfileTab';
import UploadModal from './components/UploadModal';
import StoryViewer from './components/StoryViewer';
import Lightbox from './components/Lightbox';
import CommentsModal from './components/CommentsModal';
import ShareModal from './components/ShareModal';
import ConnectionsModal from './components/ConnectionsModal';

export default function App() {
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('feed');
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Record<string, Story>>({});
  const [users, setUsers] = useState<Record<string, User>>({});
  const [following, setFollowing] = useState<Record<string, boolean>>({});
  
  // Overlay modals & states
  const [showUpload, setShowUpload] = useState(false);
  const [storyViewerTarget, setStoryViewerTarget] = useState<string | null>(null);
  const [lightboxImages, setLightboxImages] = useState<string[] | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [commentsTargetPostId, setCommentsTargetPostId] = useState<string | null>(null);
  const [shareTargetPostId, setShareTargetPostId] = useState<string | null>(null);
  const [connectionsTarget, setConnectionsTarget] = useState<{
    type: 'followers' | 'following';
    username: string;
  } | null>(null);

  // Message redirection shortcut state
  const [dmRedirectionTarget, setDmRedirectionTarget] = useState<string | null>(null);

  // Visual database reloading animation
  const [refreshing, setRefreshing] = useState(false);

  // Initialize and check user session on mount
  useEffect(() => {
    const cached = localStorage.getItem('vn_active_user');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setActiveUser(parsed);
      } catch (e) {
        console.error('Session cache parse error', e);
      }
    }
    syncState();
  }, []);

  // Update dynamic followers/following map references when user session updates
  useEffect(() => {
    if (activeUser) {
      setFollowing(StorageService.getFollowing(activeUser.username));
    } else {
      setFollowing({});
    }
  }, [activeUser]);

  // Synchronize state values from database layer
  const syncState = () => {
    setPosts(StorageService.getPosts());
    setStories(StorageService.getStories());
    setUsers(StorageService.getUsers());
    if (activeUser) {
      const freshUser = StorageService.getUser(activeUser.username);
      if (freshUser) {
        setActiveUser(freshUser);
        localStorage.setItem('vn_active_user', JSON.stringify(freshUser));
        setFollowing(StorageService.getFollowing(freshUser.username));
      }
    }
  };

  // Pull to refresh gesture states
  const [startY, setStartY] = useState<number | null>(null);
  const [pullOffset, setPullOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (activeTab !== 'feed' || refreshing) return;
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || startY === null || activeTab !== 'feed' || refreshing) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY;
    if (diff > 0 && window.scrollY === 0) {
      // Prevent standard swipe default bounce
      if (diff > 10 && e.cancelable) {
        e.preventDefault();
      }
      // Apply a spring-like resistance curve
      const resistance = Math.min(diff * 0.45, 120);
      setPullOffset(resistance);
    } else {
      setPullOffset(0);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (pullOffset > 60) {
      handleRefresh();
    }
    setPullOffset(0);
    setStartY(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTab !== 'feed' || refreshing) return;
    if (window.scrollY === 0) {
      setStartY(e.clientY);
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || startY === null || activeTab !== 'feed' || refreshing) return;
    const currentY = e.clientY;
    const diff = currentY - startY;
    if (diff > 0 && window.scrollY === 0) {
      const resistance = Math.min(diff * 0.45, 120);
      setPullOffset(resistance);
    } else {
      setPullOffset(0);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (pullOffset > 60) {
      handleRefresh();
    }
    setPullOffset(0);
    setStartY(null);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    if (activeUser) {
      injectRandomFreshPost(activeUser.username);
    }
    setTimeout(() => {
      syncState();
      setRefreshing(false);
    }, 800);
  };

  const handleAuthSuccess = (user: User) => {
    setActiveUser(user);
    localStorage.setItem('vn_active_user', JSON.stringify(user));
    setActiveTab('feed');
    syncState();
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out of your session?')) {
      localStorage.removeItem('vn_active_user');
      setActiveUser(null);
      setActiveTab('feed');
    }
  };

  const handleOpenMessageChannel = (targetUsername: string) => {
    setDmRedirectionTarget(targetUsername);
    setActiveTab('messages');
  };

  const handleProfileUpdated = (updatedUser: User) => {
    setActiveUser(updatedUser);
    syncState();
  };

  const handleViewUserProfileShortcut = (username: string) => {
    const target = username.replace('@', '').trim().toLowerCase();
    if (target === activeUser?.username) {
      setActiveTab('profile');
    } else {
      // Find user node
      const matchingUser = users[target];
      if (matchingUser) {
        // Toggle search tab, pass user to SearchTab's inner visited state
        // Let's pass via window or simple reference. In SearchTab, it checks for searchQuery.
        // We can let search query update or trigger visited profile by routing to SearchTab.
        // Let's handle visited navigation directly inside SearchTab by passing a trigger.
        // For simple modularity, we can simulate a click on search result by setting searchQuery
        // and letting the child render. Even better, let's create a custom window/state bridge!
        (window as any).viewUserProfile?.(target);
      }
    }
  };

  if (!activeUser) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-black text-white font-sans selection:bg-neutral-800">
        <AuthPanel onAuthSuccess={handleAuthSuccess} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-start pb-24 select-none bg-black text-white font-sans selection:bg-neutral-800">
      {/* Visual Refresh Indicator Spinning */}
      {refreshing && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#121212] border border-[#262626] rounded-full p-2.5 flex items-center justify-center shadow-2xl">
          <Loader2 className="animate-spin text-white" size={16} />
        </div>
      )}

      {/* Main Container Wrapper */}
      <div className="w-full max-w-lg px-0 pt-0 mx-auto relative flex flex-col min-h-screen">
        
        {/* Main Application Header */}
        <header className="flex justify-between items-center px-4 py-3.5 border-b border-[#262626] bg-black sticky top-0 z-40 flex-shrink-0 select-none">
          <div className="flex flex-col text-left cursor-pointer active:opacity-75" onClick={() => { handleRefresh(); setActiveTab('feed'); }}>
            <h2 className="text-2xl italic font-black tracking-wider text-white font-sans">
              VibeNet
            </h2>
          </div>
          <div className="flex space-x-5 text-lg items-center text-white">
            <button 
              onClick={() => setShowUpload(true)} 
              className="hover:opacity-75 active:scale-95 transition-all cursor-pointer p-1"
            >
              <PlusSquare size={20} />
            </button>
            <button 
              onClick={handleLogout} 
              className="text-red-500 hover:text-red-400 active:scale-95 transition-all cursor-pointer p-1"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Dynamic Route Pages */}
        <main className="flex-1 flex flex-col">
          {activeTab === 'feed' && (
            <div 
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="space-y-0 relative w-full flex-1 flex flex-col select-none touch-pan-y"
            >
              {/* Elastic Pull-to-Refresh Banner */}
              {pullOffset > 0 && (
                <div 
                  style={{ height: `${pullOffset}px`, opacity: Math.min(pullOffset / 60, 1) }}
                  className="w-full flex items-center justify-center overflow-hidden transition-all duration-75 bg-[#0a0a0a] border-b border-[#262626]"
                >
                  <div className="flex items-center space-x-2 text-neutral-400 font-mono text-[10px] uppercase tracking-widest">
                    <Loader2 className="animate-spin text-[#0095F6]" size={14} style={{ transform: `rotate(${pullOffset * 4}deg)` }} />
                    <span>{pullOffset > 60 ? 'Release frequency to refresh' : 'Pull down to sync'}</span>
                  </div>
                </div>
              )}

              <StoriesTray 
                activeUser={activeUser}
                stories={stories}
                following={following}
                onAddStoryClick={() => {
                  // Trigger story mode in upload modal
                  setShowUpload(true);
                }}
                onStoryClick={(user) => setStoryViewerTarget(user)}
              />
              <div id="feedContainer" className="space-y-0 pb-16 w-full max-w-full">
                {posts.length === 0 ? (
                  <div className="text-center py-24 text-neutral-500 font-mono text-xs uppercase tracking-widest">
                    No feeds available. Create one above!
                  </div>
                ) : (
                  [...posts].reverse().map((post) => (
                    <PostCard 
                      key={post.id}
                      post={post}
                      activeUser={activeUser}
                      onViewProfile={handleViewUserProfileShortcut}
                      onPostUpdated={syncState}
                      onOpenComments={(id) => setCommentsTargetPostId(id)}
                      onOpenShare={(id) => setShareTargetPostId(id)}
                      onOpenLightbox={(url) => {
                        setLightboxImages([url]);
                        setLightboxIndex(0);
                      }}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'search' && (
            <SearchTab 
              activeUser={activeUser}
              posts={posts}
              users={users}
              following={following}
              onFollowUpdated={syncState}
              onOpenMessage={handleOpenMessageChannel}
              onOpenLightbox={(images, idx) => {
                setLightboxImages(images);
                setLightboxIndex(idx);
              }}
              onOpenConnections={(type, uname) => setConnectionsTarget({ type, username: uname })}
            />
          )}

          {activeTab === 'messages' && (
            <MessagesTab 
              activeUser={activeUser}
              users={users}
              initialTargetUsername={dmRedirectionTarget}
              onViewProfile={handleViewUserProfileShortcut}
              onClearInitialTarget={() => setDmRedirectionTarget(null)}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileTab 
              activeUser={activeUser}
              posts={posts}
              onProfileUpdated={handleProfileUpdated}
              onOpenInbox={() => setActiveTab('messages')}
              onOpenLightbox={(images, idx) => {
                setLightboxImages(images);
                setLightboxIndex(idx);
              }}
              onOpenConnections={(type, uname) => setConnectionsTarget({ type, username: uname })}
            />
          )}
        </main>

        {/* Global Bottom Navigation Hub */}
        <nav className="fixed bottom-0 left-0 right-0 border-t border-[#262626] bg-black py-3 flex justify-around items-center max-w-lg mx-auto z-40 select-none">
          <button 
            onClick={() => setActiveTab('feed')} 
            className={`transition-colors p-2 cursor-pointer ${activeTab === 'feed' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
          >
            <Home size={22} className={activeTab === 'feed' ? 'stroke-[2.5]' : ''} />
          </button>
          <button 
            onClick={() => setActiveTab('search')} 
            className={`transition-colors p-2 cursor-pointer ${activeTab === 'search' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
          >
            <Search size={22} className={activeTab === 'search' ? 'stroke-[2.5]' : ''} />
          </button>
          <button 
            onClick={() => setActiveTab('messages')} 
            className={`transition-colors p-2 cursor-pointer ${activeTab === 'messages' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
          >
            <MessageSquare size={22} className={activeTab === 'messages' ? 'stroke-[2.5]' : ''} />
          </button>
          <button 
            onClick={() => setActiveTab('profile')} 
            className={`w-7 h-7 rounded-full overflow-hidden border transition-all p-[1px] cursor-pointer ${activeTab === 'profile' ? 'border-white' : 'border-[#262626] hover:border-neutral-500'}`}
          >
            <img 
              className="w-full h-full object-cover rounded-full" 
              src={activeUser.avatar} 
              alt="Profile Nav" 
            />
          </button>
        </nav>
      </div>

      {/* ================= GLOBAL OVERLAYS & MODALS ================= */}

      {/* Upload/Create Modal */}
      {showUpload && (
        <UploadModal 
          activeUser={activeUser}
          onClose={() => setShowUpload(false)}
          onUploadSuccess={() => {
            handleRefresh();
            syncState();
          }}
        />
      )}

      {/* Story Viewer Overlay */}
      {storyViewerTarget && (
        <StoryViewer 
          activeUser={activeUser}
          stories={stories}
          following={following}
          clickedUsername={storyViewerTarget}
          onClose={() => setStoryViewerTarget(null)}
          onViewProfile={handleViewUserProfileShortcut}
        />
      )}

      {/* Fullscreen Image Lightbox */}
      {lightboxImages && (
        <Lightbox 
          images={lightboxImages}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxImages(null)}
          onNavigate={(idx) => setLightboxIndex(idx)}
        />
      )}

      {/* Fullscreen Comments Sheet */}
      {commentsTargetPostId && (
        <CommentsModal 
          postId={commentsTargetPostId}
          activeUser={activeUser}
          onClose={() => setCommentsTargetPostId(null)}
          onCommentAdded={syncState}
          onViewProfile={handleViewUserProfileShortcut}
        />
      )}

      {/* Share Overlay Drawer */}
      {shareTargetPostId && (
        <ShareModal 
          postId={shareTargetPostId}
          activeUser={activeUser}
          users={users}
          onClose={() => setShareTargetPostId(null)}
          onViewProfile={handleViewUserProfileShortcut}
        />
      )}

      {/* Followers/Following connections directories */}
      {connectionsTarget && (
        <ConnectionsModal 
          type={connectionsTarget.type}
          username={connectionsTarget.username}
          users={users}
          onClose={() => setConnectionsTarget(null)}
          onViewProfile={handleViewUserProfileShortcut}
        />
      )}
    </div>
  );
}
