export interface User {
  username: string;
  name: string;
  password?: string; // Hashed secure password
  bio: string;
  avatar: string; // Base64 or Image URL
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: number;
}

export interface Post {
  id: string;
  author: string;
  avatar: string;
  url: string; // Base64 or Image URL
  caption: string;
  timestamp: number;
  likes: Record<string, boolean>; // Key is username, value is true/false
  comments: Record<string, Comment>; // Key is commentId
}

export interface Story {
  username: string;
  avatar: string;
  url: string; // Base64 or Image URL
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
}

export type TabType = 'feed' | 'search' | 'messages' | 'profile';
export type ConnectionType = 'followers' | 'following';
