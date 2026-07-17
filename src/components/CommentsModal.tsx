import React, { useState } from 'react';
import { ArrowLeft, Send, BadgeCheck } from 'lucide-react';
import { Post, User } from '../types';
import { StorageService } from '../lib/storage';

interface CommentsModalProps {
  postId: string;
  activeUser: User;
  onClose: () => void;
  onCommentAdded: () => void;
  onViewProfile: (username: string) => void;
}

export default function CommentsModal({
  postId,
  activeUser,
  onClose,
  onCommentAdded,
  onViewProfile
}: CommentsModalProps) {
  const [inputText, setInputText] = useState('');
  const post = StorageService.getPosts().find(p => p.id === postId);

  if (!post) return null;

  const commentsList = Object.values(post.comments || {});

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const commentId = 'com_' + Date.now();
    const newComment = {
      id: commentId,
      author: activeUser.username,
      text: inputText.trim(),
      timestamp: Date.now()
    };

    const updatedPost = { ...post };
    if (!updatedPost.comments) updatedPost.comments = {};
    updatedPost.comments[commentId] = newComment;

    StorageService.savePost(updatedPost);
    setInputText('');
    onCommentAdded();
  };

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
        <h3 className="text-xs font-black text-neutral-400 tracking-widest uppercase font-sans">
          Comments Thread
        </h3>
      </div>

      {/* Main Comment List Scroll console */}
      <div className="space-y-3 overflow-y-auto flex-1 my-3 pr-1 hide-scrollbar">
        {commentsList.length === 0 ? (
          <p className="text-xs text-neutral-500 italic text-center py-16 font-mono">
            No comments yet on this node.
          </p>
        ) : (
          commentsList.map((com) => (
            <div 
              key={com.id} 
              className="flex items-start space-x-3 p-3.5 bg-[#121212] border border-[#262626] rounded-xl text-left"
            >
              <span 
                onClick={() => {
                  onClose();
                  onViewProfile(com.author);
                }}
                className="text-xs font-bold text-white hover:underline cursor-pointer font-mono flex-shrink-0 inline-flex items-center"
              >
                @{com.author}
                <BadgeCheck size={12} className="text-black fill-[#0095F6] ml-0.5" />
              </span>
              <p className="text-xs text-neutral-300 flex-1 break-words font-sans font-normal leading-relaxed select-text">
                {com.text}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Add comment input */}
      <form onSubmit={handlePostComment} className="flex space-x-2 pt-3 border-t border-[#262626] sticky bottom-0 bg-black flex-shrink-0">
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 px-4 py-2.5 text-xs rounded-full bg-[#121212] border border-[#262626] text-white focus:border-neutral-400 focus:outline-none transition-colors font-sans" 
          placeholder="Add a comment thread reply..."
        />
        <button 
          type="submit"
          className="text-[#0095F6] hover:text-white transition-colors text-xs font-bold px-4 uppercase tracking-wider cursor-pointer"
          disabled={!inputText.trim()}
        >
          Post
        </button>
      </form>
    </div>
  );
}
