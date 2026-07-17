import React, { useState } from 'react';
import { X, UploadCloud, CheckCircle } from 'lucide-react';
import { User, Post, Story } from '../types';
import { StorageService } from '../lib/storage';

interface UploadModalProps {
  activeUser: User;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export default function UploadModal({
  activeUser,
  onClose,
  onUploadSuccess
}: UploadModalProps) {
  const [streamMode, setStreamMode] = useState<'post' | 'story'>('post');
  const [imageSrc, setImageSrc] = useState<string>('');
  const [caption, setCaption] = useState('');
  const [publishing, setPublishing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setImageSrc(ev.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePublish = async () => {
    if (!imageSrc) return alert('Please upload or select an image file.');
    setPublishing(true);

    try {
      const timestamp = Date.now();
      
      if (streamMode === 'post') {
        const newPost: Post = {
          id: 'post_' + timestamp,
          author: activeUser.username,
          avatar: activeUser.avatar,
          url: imageSrc,
          caption: caption.trim(),
          timestamp,
          likes: {},
          comments: {}
        };
        StorageService.savePost(newPost);
      } else {
        const newStory: Story = {
          username: activeUser.username,
          avatar: activeUser.avatar,
          url: imageSrc,
          timestamp
        };
        StorageService.saveStory(newStory);
      }

      onUploadSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error broadcasting content.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-[fadeIn_0.15s_linear] select-none">
      <div className="border border-[#262626] bg-[#121212] w-full max-w-xs rounded-xl p-5 space-y-4 text-center relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-neutral-400 hover:text-white cursor-pointer"
        >
          <X size={16} />
        </button>

        <div className="flex justify-between items-center border-b border-[#262626] pb-2 mt-2">
          <span className="text-xs font-bold tracking-widest text-white uppercase font-sans">
            Create Broadcast
          </span>
        </div>

        {/* Switcher */}
        <div className="flex space-x-1.5 bg-[#000] p-1 rounded-lg border border-[#262626]">
          <button
            onClick={() => setStreamMode('post')}
            className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-md tracking-wider transition-all cursor-pointer ${
              streamMode === 'post'
                ? 'bg-[#363636] text-white'
                : 'text-neutral-500 hover:text-white'
            }`}
          >
            Post
          </button>
          <button
            onClick={() => setStreamMode('story')}
            className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-md tracking-wider transition-all cursor-pointer ${
              streamMode === 'story'
                ? 'bg-[#363636] text-white'
                : 'text-neutral-500 hover:text-white'
            }`}
          >
            Story
          </button>
        </div>

        {/* Upload Trigger Area */}
        <input
          type="file"
          id="universalFileInput"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        
        <div
          onClick={() => document.getElementById('universalFileInput')?.click()}
          className="border border-dashed border-[#262626] rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-[#050505] hover:border-neutral-500 transition-colors"
        >
          {!imageSrc ? (
            <>
              <UploadCloud className="text-neutral-400 mb-2" size={26} />
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono">
                Select Photo core
              </span>
            </>
          ) : (
            <div className="w-full relative">
              <img
                className="w-full max-h-28 object-cover rounded-lg border border-[#262626]"
                src={imageSrc}
                alt="preview"
              />
              <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-0.5">
                <CheckCircle size={10} />
              </div>
            </div>
          )}
        </div>

        {/* Post Caption Field (only for Post mode) */}
        {streamMode === 'post' && (
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={2}
            className="w-full p-2.5 text-xs rounded-lg bg-black border border-[#262626] text-white focus:border-neutral-400 focus:outline-none transition-colors resize-none font-sans"
            placeholder="Write a caption..."
          />
        )}

        <button
          onClick={handlePublish}
          disabled={publishing}
          className="w-full py-2.5 rounded-lg bg-[#0095F6] hover:bg-[#1877F2] text-xs font-bold text-white tracking-wider cursor-pointer"
        >
          {publishing ? 'Broadcasting...' : 'Share Now'}
        </button>
      </div>
    </div>
  );
}
