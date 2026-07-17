import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Search, Send, User as UserIcon } from 'lucide-react';
import { User, ChatMessage } from '../types';
import { StorageService } from '../lib/storage';

interface MessagesTabProps {
  activeUser: User;
  users: Record<string, User>;
  initialTargetUsername?: string | null;
  onViewProfile: (username: string) => void;
  onClearInitialTarget: () => void;
}

export default function MessagesTab({
  activeUser,
  users,
  initialTargetUsername,
  onViewProfile,
  onClearInitialTarget
}: MessagesTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  
  const chatConsoleRef = useRef<HTMLDivElement>(null);

  // Load target partner if routed from a external profile message click
  useEffect(() => {
    if (initialTargetUsername) {
      const partnerUser = users[initialTargetUsername.toLowerCase()];
      if (partnerUser) {
        setSelectedPartner(partnerUser);
      }
      onClearInitialTarget();
    }
  }, [initialTargetUsername, users, onClearInitialTarget]);

  // Sync messages in real-time if a partner is active
  useEffect(() => {
    if (!selectedPartner) return;

    const pullMessages = () => {
      const roomKey = [activeUser.username, selectedPartner.username].sort().join('-');
      const list = StorageService.getChatRoomMessages(roomKey);
      setMessages(list);
    };

    pullMessages();
    const interval = setInterval(pullMessages, 2000); // 2 second fast polling

    return () => clearInterval(interval);
  }, [selectedPartner, activeUser.username]);

  // Scroll to bottom whenever messages list updates
  useEffect(() => {
    if (chatConsoleRef.current) {
      chatConsoleRef.current.scrollTop = chatConsoleRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !selectedPartner) return;

    const roomKey = [activeUser.username, selectedPartner.username].sort().join('-');
    const newMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: activeUser.username,
      text: inputText.trim(),
      timestamp: Date.now()
    };

    StorageService.sendChatMessage(roomKey, newMsg);
    setInputText('');
    setMessages((prev) => [...prev, newMsg]);
  };

  const handleExitChat = () => {
    setSelectedPartner(null);
    setSearchQuery('');
  };

  // Resolve chat history directory: find any unique users with message history
  const chatRooms = StorageService.getChatRooms();
  const activeConversationUsernames = Object.keys(chatRooms)
    .filter(roomKey => roomKey.split('-').includes(activeUser.username))
    .map(roomKey => roomKey.split('-').find(u => u !== activeUser.username) || '')
    .filter(u => u !== '');

  // Filter conversation list or search new user nodes
  const filteredUsers = Object.values(users).filter((u) => {
    if (u.username === activeUser.username) return false;
    
    const q = searchQuery.toLowerCase();
    const matchesSearch = u.username.includes(q) || u.name.toLowerCase().includes(q);

    if (searchQuery) {
      return matchesSearch;
    } else {
      // In default inbox, show users we already have a conversation with
      return activeConversationUsernames.includes(u.username);
    }
  });

  return (
    <div className="w-full flex-1 flex flex-col justify-start relative h-[78vh] bg-black select-none">
      {!selectedPartner ? (
        // CHAT INBOX VIEW
        <div className="w-full space-y-4 flex flex-col p-4">
          <div className="flex items-center space-x-3 py-1 border-b border-[#262626] flex-shrink-0">
            <h3 className="text-xs font-black text-neutral-400 tracking-widest uppercase font-sans">
              Direct Messages
            </h3>
          </div>
          <div className="relative flex-shrink-0">
            <input
              id="searchChatInput"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-lg bg-[#121212] border border-[#262626] text-white focus:border-neutral-400 focus:outline-none transition-colors font-sans"
              placeholder="Search conversation node..."
            />
            <Search className="absolute left-3 top-3.5 text-neutral-500" size={14} />
          </div>

          <div className="space-y-1 overflow-y-auto max-h-[60vh] pr-1 hide-scrollbar">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-16 text-neutral-500">
                <p className="text-xs font-mono uppercase tracking-widest">
                  {searchQuery ? 'No node found' : 'Inbox is empty'}
                </p>
                {!searchQuery && (
                  <p className="text-[10px] text-neutral-600 mt-2 font-sans">
                    Search above to initiate a new message channel.
                  </p>
                )}
              </div>
            ) : (
              filteredUsers.map((u) => (
                <div
                  key={u.username}
                  onClick={() => setSelectedPartner(u)}
                  className="flex items-center space-x-3.5 p-3 rounded-xl cursor-pointer hover:bg-[#121212] transition-colors border-b border-[#121212] select-none"
                >
                  <img
                    className="w-10 h-10 rounded-full object-cover border border-[#262626]"
                    src={u.avatar}
                    alt={u.username}
                  />
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-xs font-bold text-white font-mono">
                      @{u.username}
                    </p>
                    <p className="text-[10px] text-neutral-400 truncate uppercase font-sans">
                      {u.name}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        // ACTIVE DIRECT CONVERSATION SCREEN
        <div className="w-full flex-1 flex flex-col justify-between relative h-full bg-black animate-[fadeIn_0.15s_linear]">
          {/* Header */}
          <div className="border-b border-[#262626] pb-3 flex items-center justify-between bg-black p-4 flex-shrink-0">
            <div className="flex items-center space-x-3.5">
              <button
                onClick={handleExitChat}
                className="text-white hover:opacity-75 transition-opacity p-1 cursor-pointer"
              >
                <ArrowLeft size={18} />
              </button>
              <img
                className="w-9 h-9 rounded-full object-cover border border-[#262626]"
                src={selectedPartner.avatar}
                alt={selectedPartner.username}
              />
              <div className="flex flex-col text-left">
                <span
                  onClick={() => onViewProfile(selectedPartner.username)}
                  className="text-sm font-bold text-white font-mono hover:underline cursor-pointer"
                >
                  @{selectedPartner.username}
                </span>
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-sans select-text">
                  {selectedPartner.name}
                </span>
              </div>
            </div>
          </div>

          {/* Messages Feed Console */}
          <div
            ref={chatConsoleRef}
            className="space-y-2.5 overflow-y-auto flex-1 my-3 px-4 max-h-[50vh] min-h-[40vh] flex flex-col hide-scrollbar"
          >
            {messages.length === 0 ? (
              <div className="my-auto text-center text-neutral-500 font-mono text-[10px] uppercase tracking-wider">
                Establish message node link...
              </div>
            ) : (
              messages.map((m) => {
                const isMe = m.sender === activeUser.username;
                return (
                  <div
                    key={m.id}
                    className={`p-3 text-xs rounded-2xl max-w-[75%] shadow-sm font-sans select-text break-words leading-relaxed ${
                      isMe
                        ? 'bg-[#0095F6] ml-auto text-white rounded-br-sm'
                        : 'bg-[#262626] mr-auto text-white rounded-bl-sm'
                    }`}
                  >
                    {m.text}
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Send Panel */}
          <form
            onSubmit={handleSendMessage}
            className="flex space-x-2.5 p-3.5 border-t border-[#262626] sticky bottom-0 bg-black flex-shrink-0"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs rounded-full bg-[#121212] border border-[#262626] text-white focus:border-neutral-400 focus:outline-none transition-colors font-sans"
              placeholder="Message..."
            />
            <button
              type="submit"
              className="text-[#0095F6] hover:text-white transition-colors text-xs font-bold px-4 uppercase tracking-wider cursor-pointer"
              disabled={!inputText.trim()}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
