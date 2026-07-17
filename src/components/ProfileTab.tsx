import React, { useState } from 'react';
import { Camera, Mail, X, BadgeCheck } from 'lucide-react';
import { User, Post } from '../types';
import { StorageService } from '../lib/storage';

interface ProfileTabProps {
  activeUser: User;
  posts: Post[];
  onProfileUpdated: (user: User) => void;
  onOpenInbox: () => void;
  onOpenLightbox: (images: string[], index: number) => void;
  onOpenConnections: (type: 'followers' | 'following', username: string) => void;
}

export default function ProfileTab({
  activeUser,
  posts,
  onProfileUpdated,
  onOpenInbox,
  onOpenLightbox,
  onOpenConnections
}: ProfileTabProps) {
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState(activeUser.name);
  const [editBio, setEditBio] = useState(activeUser.bio);
  const [editAvatar, setEditAvatar] = useState(activeUser.avatar);
  const [saving, setSaving] = useState(false);

  const myPosts = posts.filter((p) => p.author === activeUser.username);
  const followers = StorageService.getFollowers(activeUser.username);
  const following = StorageService.getFollowing(activeUser.username);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setEditAvatar(ev.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveChanges = async () => {
    if (!editName.trim()) return alert('Name cannot be empty.');
    setSaving(true);

    try {
      const updatedUser: User = {
        ...activeUser,
        name: editName.trim(),
        bio: editBio.trim(),
        avatar: editAvatar
      };

      StorageService.saveUser(updatedUser);
      onProfileUpdated(updatedUser);
      setShowEdit(false);
    } catch (err) {
      console.error(err);
      alert('Error updating profile metadata.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full space-y-4 mt-0 relative select-none">
      {/* Header */}
      <div className="flex items-center space-x-3 py-3 border-b border-[#262626] px-4 bg-black">
        <h3 className="text-sm font-bold text-white tracking-wide font-mono select-text flex items-center">
          @{activeUser.username}
          <BadgeCheck size={14} className="text-black fill-[#0095F6] ml-1 flex-shrink-0" />
        </h3>
      </div>

      <div className="px-0">
        {/* Profile Statistics block */}
        <div className="flex items-center space-x-8 px-5 mt-2">
          <div className="relative flex-shrink-0">
            <img
              id="myAvatarImg"
              className="w-20 h-20 rounded-full object-cover border border-[#262626] p-[2px]"
              src={activeUser.avatar}
              alt="My Profile"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col text-left">
              <h4 id="myDisplayName" className="text-base font-semibold text-white tracking-wide select-text">
                {activeUser.name}
              </h4>
            </div>
            <div className="flex space-x-6 mt-3 text-left">
              <div className="text-xs text-neutral-400">
                <span id="myPostCount" className="font-bold text-white block text-sm">
                  {myPosts.length}
                </span>
                posts
              </div>
              <div
                onClick={() => onOpenConnections('followers', activeUser.username)}
                className="text-xs text-neutral-400 cursor-pointer hover:text-white"
              >
                <span id="myFollowerCount" className="font-bold text-white block text-sm">
                  {Object.keys(followers).length}
                </span>
                followers
              </div>
              <div
                onClick={() => onOpenConnections('following', activeUser.username)}
                className="text-xs text-neutral-400 cursor-pointer hover:text-white"
              >
                <span id="myFollowingCount" className="font-bold text-white block text-sm">
                  {Object.keys(following).length}
                </span>
                following
              </div>
            </div>
          </div>
        </div>

        {/* Bio Text block */}
        <div className="mt-3 px-5 text-left text-xs text-white leading-relaxed max-w-full select-text">
          <p id="myBioText" className="whitespace-pre-wrap font-sans font-normal">
            {activeUser.bio}
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="px-5 flex space-x-2 text-xs mt-2">
        <button
          onClick={() => {
            setShowEdit(!showEdit);
            setEditName(activeUser.name);
            setEditBio(activeUser.bio);
            setEditAvatar(activeUser.avatar);
          }}
          className="flex-1 bg-[#262626] hover:bg-[#363636] text-white py-2 rounded-lg font-bold uppercase tracking-wider transition-colors cursor-pointer text-center"
        >
          {showEdit ? 'Close Editor' : 'Edit Profile'}
        </button>
        <button
          onClick={onOpenInbox}
          className="flex-1 bg-[#262626] hover:bg-[#363636] text-white py-2 rounded-lg font-bold uppercase tracking-wider transition-colors cursor-pointer text-center"
        >
          Inbox
        </button>
      </div>

      {/* Edit Drawer Overlay */}
      {showEdit && (
        <div className="mx-4 p-5 border border-[#262626] bg-[#121212] rounded-xl relative space-y-4 animate-[fadeIn_0.15s_linear]">
          <button
            onClick={() => setShowEdit(false)}
            className="absolute top-3 right-3 text-neutral-400 hover:text-white cursor-pointer"
          >
            <X size={16} />
          </button>
          
          <div className="flex flex-col text-left space-y-3 pt-2">
            <label className="text-[10px] uppercase text-neutral-400 font-mono">Display Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-black border border-[#262626] text-white focus:border-neutral-400 focus:outline-none transition-colors font-sans"
              placeholder="Display Name"
            />

            <label className="text-[10px] uppercase text-neutral-400 font-mono">Bio Details</label>
            <textarea
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 text-xs rounded-lg bg-black border border-[#262626] text-white focus:border-neutral-400 focus:outline-none transition-colors resize-none font-sans"
              placeholder="Write something about your channel..."
            />

            <label className="text-[10px] uppercase text-neutral-400 font-mono">Profile Photo</label>
            <div>
              <input
                type="file"
                id="editAvatarFileInput"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <div
                onClick={() => document.getElementById('editAvatarFileInput')?.click()}
                className="border border-dashed border-[#262626] hover:border-neutral-500 rounded-lg p-3.5 text-center text-[10px] text-neutral-400 cursor-pointer bg-black uppercase font-mono transition-colors flex items-center justify-center space-x-2"
              >
                <Camera size={14} />
                <span>Upload Custom Photo</span>
              </div>
            </div>
            
            {editAvatar && (
              <div className="flex items-center space-x-3 bg-black p-2 rounded-lg border border-[#262626] mt-1">
                <img className="w-10 h-10 rounded-full object-cover" src={editAvatar} alt="preview" />
                <span className="text-[9px] text-green-500 uppercase font-mono">✅ Image Attachment Loaded</span>
              </div>
            )}

            <button
              onClick={handleSaveChanges}
              disabled={saving}
              className="w-full bg-[#0095F6] hover:bg-[#1877F2] text-xs py-2.5 rounded-lg text-white font-bold uppercase tracking-wider transition-colors cursor-pointer mt-2"
            >
              {saving ? 'Saving changes...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Grid of Own Post Images */}
      <div className="grid grid-cols-3 gap-[2px] pb-24 pt-4 px-1">
        {myPosts.length === 0 ? (
          <div className="col-span-3 text-center py-16 text-neutral-500 font-mono text-xs uppercase tracking-wider">
            No posts uploaded yet.
          </div>
        ) : (
          myPosts.map((post, idx) => (
            <img
              key={post.id}
              className="aspect-square w-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
              src={post.url}
              alt="My post"
              onClick={() =>
                onOpenLightbox(
                  myPosts.map((p) => p.url),
                  idx
                )
              }
            />
          ))
        )}
      </div>
    </div>
  );
}
