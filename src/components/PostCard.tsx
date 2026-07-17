import React, { useState, useRef } from 'react';
import { Heart, MessageCircle, Send, MoreVertical, Trash2, BadgeCheck } from 'lucide-react';
import { Post, User } from '../types';
import { StorageService } from '../lib/storage';

interface PostCardProps {
  key?: any;
  post: Post;
  activeUser: User;
  onViewProfile: (username: string) => void;
  onPostUpdated: () => void;
  onOpenComments: (postId: string) => void;
  onOpenShare: (postId: string) => void;
  onOpenLightbox: (imageUrl: string) => void;
}

export default function PostCard({
  post,
  activeUser,
  onViewProfile,
  onPostUpdated,
  onOpenComments,
  onOpenShare,
  onOpenLightbox
}: PostCardProps) {
  const [commentText, setCommentText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [animateHeart, setAnimateHeart] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isLiked = !!post.likes[activeUser.username];
  const commentsList = Object.values(post.comments || {});
  const latestComment = commentsList[commentsList.length - 1];

  const handleLikeToggle = () => {
    const updatedPost = { ...post };
    if (isLiked) {
      delete updatedPost.likes[activeUser.username];
    } else {
      updatedPost.likes[activeUser.username] = true;
      setAnimateHeart(true);
      setTimeout(() => setAnimateHeart(false), 500);
    }
    StorageService.savePost(updatedPost);
    onPostUpdated();
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isLiked) {
      handleLikeToggle();
    } else {
      // Show animation anyway
      setAnimateHeart(true);
      setTimeout(() => setAnimateHeart(false), 500);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const commentId = 'com_' + Date.now();
    const newComment = {
      id: commentId,
      author: activeUser.username,
      text: commentText.trim(),
      timestamp: Date.now()
    };

    const updatedPost = { ...post };
    if (!updatedPost.comments) updatedPost.comments = {};
    updatedPost.comments[commentId] = newComment;

    StorageService.savePost(updatedPost);
    setCommentText('');
    onPostUpdated();
  };

  const handleDeletePost = () => {
    if (confirm('Are you sure you want to delete this post?')) {
      StorageService.deletePost(post.id);
      onPostUpdated();
    }
    setShowDropdown(false);
  };

  return (
    <div className="w-full border-b border-[#262626] bg-black mb-6 overflow-hidden max-w-full mx-auto relative select-none">
      {/* Post Header */}
      <div className="p-3.5 flex items-center justify-between">
        <div 
          onClick={() => onViewProfile(post.author)}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <img 
            className="w-8 h-8 rounded-full object-cover border border-[#262626] p-[1px] group-hover:border-neutral-400 transition-colors" 
            src={post.avatar} 
            alt={post.author}
          />
          <span className="font-bold text-xs text-white font-mono hover:underline flex items-center">
            @{post.author}
            <BadgeCheck size={14} className="text-black fill-[#0095F6] ml-1 flex-shrink-0" />
          </span>
        </div>

        {post.author === activeUser.username && (
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="text-neutral-400 hover:text-white p-1 focus:outline-none cursor-pointer"
            >
              <MoreVertical size={16} />
            </button>
            {showDropdown && (
              <div className="absolute right-0 top-7 bg-[#121212] border border-[#262626] rounded-lg shadow-2xl z-30 min-w-[120px] py-1">
                <button 
                  onClick={handleDeletePost}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-red-500 hover:bg-[#1f1f1f] flex items-center space-x-2 cursor-pointer"
                >
                  <Trash2 size={14} />
                  <span>Delete Post</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Image Grid Slot with Double Click Support */}
      <div 
        onDoubleClick={handleDoubleClick}
        className="w-full aspect-square bg-[#0a0a0a] flex items-center justify-center border-y border-[#121212] relative cursor-pointer group overflow-hidden"
      >
        <img 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.01]" 
          src={post.url} 
          alt="Post Media"
          onClick={() => onOpenLightbox(post.url)}
        />
        {/* Heart Pop Overlay */}
        {animateHeart && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/10 transition-opacity">
            <Heart 
              size={80} 
              className="text-red-500 fill-red-500 animate-[bounce_0.4s_ease-in-out]" 
            />
          </div>
        )}
      </div>

      {/* Action Buttons Row */}
      <div className="p-3.5 pb-1 flex items-center justify-between">
        <div className="flex space-x-5 text-xl items-center">
          <button 
            onClick={handleLikeToggle}
            className="focus:outline-none transition-transform duration-100 active:scale-90 cursor-pointer"
          >
            <Heart 
              size={22} 
              className={isLiked ? "text-red-500 fill-red-500" : "text-white hover:text-neutral-300"} 
            />
          </button>
          <button 
            onClick={() => onOpenComments(post.id)}
            className="focus:outline-none transition-transform duration-100 active:scale-90 text-white hover:text-neutral-300 cursor-pointer"
          >
            <MessageCircle size={22} />
          </button>
          <button 
            onClick={() => onOpenShare(post.id)}
            className="focus:outline-none transition-transform duration-100 active:scale-90 text-white hover:text-neutral-300 cursor-pointer"
          >
            <Send size={22} />
          </button>
        </div>
      </div>

      {/* Likes Count */}
      <div className="px-3.5 text-xs font-bold text-white mt-1">
        {Object.keys(post.likes).length} likes
      </div>

      {/* Caption Section */}
      <div className="px-3.5 pt-1 text-xs text-left">
        <span 
          onClick={() => onViewProfile(post.author)}
          className="font-bold mr-2 text-white font-mono cursor-pointer hover:underline inline-flex items-center"
        >
          @{post.author}
          <BadgeCheck size={12} className="text-black fill-[#0095F6] ml-0.5" />
        </span>
        <span className="text-neutral-300 font-sans">{post.caption}</span>
      </div>

      {/* Comments Preview Section */}
      <div className="px-3.5 pt-1.5 pb-2 text-left">
        {commentsList.length > 1 && (
          <p 
            onClick={() => onOpenComments(post.id)}
            className="text-[11px] text-neutral-500 font-medium cursor-pointer mt-0.5 hover:underline"
          >
            View all {commentsList.length} comments
          </p>
        )}
        
        {latestComment ? (
          <div className="text-xs mt-1">
            <span 
              onClick={() => onViewProfile(latestComment.author)}
              className="font-bold mr-2 text-white font-mono cursor-pointer hover:underline inline-flex items-center"
            >
              @{latestComment.author}
              <BadgeCheck size={12} className="text-black fill-[#0095F6] ml-0.5" />
            </span>
            <span className="text-neutral-300 font-sans">{latestComment.text}</span>
          </div>
        ) : (
          <p className="text-[11px] text-neutral-500 mt-1">No comments yet.</p>
        )}
      </div>

      {/* In-line Add Comment */}
      <form onSubmit={handleAddComment} className="p-3.5 pt-1 border-t border-[#121212] flex items-center">
        <input 
          type="text" 
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="bg-transparent text-xs text-white w-full focus:outline-none placeholder-neutral-600 font-sans" 
          placeholder="Add a comment..."
        />
        <button 
          type="submit"
          className="text-[#0095F6] hover:text-white transition-colors text-xs font-bold px-2 disabled:opacity-40 cursor-pointer"
          disabled={!commentText.trim()}
        >
          Post
        </button>
      </form>
    </div>
  );
}
