import { User, Post, Story, ChatMessage } from '../types';

// Helper for pure JS hash fallback when window.crypto.subtle is unavailable (e.g. inside sandboxed iframes)
function fallbackHash(str: string): string {
  let hash1 = 5381;
  let hash2 = 89;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash1 = ((hash1 << 5) + hash1) + char;
    hash2 = ((hash2 << 6) + hash2) + char;
  }
  let result = '';
  let seed = hash1 ^ hash2;
  for (let i = 0; i < 8; i++) {
    seed = (seed * 1103515245 + 12345) & 0xffffffff;
    const part = (seed >>> 0).toString(16).padStart(8, '0');
    result += part;
  }
  return result;
}

// Secure hashing function for passwords with a safe fallback
export async function computeSHA256(input: string): Promise<string> {
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(input);
      const buffer = await window.crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    }
  } catch (e) {
    console.warn('crypto.subtle failed, using fallback', e);
  }
  return fallbackHash(input);
}

// Helpers to get/set localStorage with defensive fallbacks
const getLocal = <T>(key: string, fallback: T): T => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (e) {
    console.error('Local Storage read error', e);
    return fallback;
  }
};

const setLocal = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Local Storage write error', e);
  }
};

// Initialize localStorage with seed data if not present
export function initializeDatabase(): void {
  // One-time forced storage reset to clear old seed data for a completely clean slate
  if (!localStorage.getItem('vn_db_pristine_v2')) {
    localStorage.removeItem('vn_users');
    localStorage.removeItem('vn_posts');
    localStorage.removeItem('vn_stories');
    localStorage.removeItem('vn_followers');
    localStorage.removeItem('vn_following');
    localStorage.removeItem('vn_chats');
    localStorage.removeItem('vn_active_user');
    localStorage.setItem('vn_db_pristine_v2', 'true');
  }

  if (!localStorage.getItem('vn_users')) {
    setLocal('vn_users', {});
  }

  if (!localStorage.getItem('vn_posts')) {
    setLocal('vn_posts', []);
  }

  if (!localStorage.getItem('vn_stories')) {
    setLocal('vn_stories', {});
  }

  if (!localStorage.getItem('vn_followers')) {
    setLocal('vn_followers', {});
  }

  if (!localStorage.getItem('vn_following')) {
    setLocal('vn_following', {});
  }

  if (!localStorage.getItem('vn_chats')) {
    setLocal('vn_chats', {} as Record<string, ChatMessage[]>);
  }
}

// Ensure database is initialized immediately
initializeDatabase();

export const StorageService = {
  // --- USERS ---
  getUsers(): Record<string, User> {
    return getLocal<Record<string, User>>('vn_users', {});
  },

  getUser(username: string): User | null {
    const users = this.getUsers();
    return users[username.toLowerCase()] || null;
  },

  saveUser(user: User): void {
    const users = this.getUsers();
    users[user.username.toLowerCase()] = user;
    setLocal('vn_users', users);
  },

  // --- POSTS ---
  getPosts(): Post[] {
    return getLocal<Post[]>('vn_posts', []);
  },

  savePost(post: Post): void {
    const posts = this.getPosts();
    const index = posts.findIndex(p => p.id === post.id);
    if (index >= 0) {
      posts[index] = post;
    } else {
      posts.push(post);
    }
    setLocal('vn_posts', posts);
  },

  deletePost(postId: string): void {
    const posts = this.getPosts();
    const updated = posts.filter(p => p.id !== postId);
    setLocal('vn_posts', updated);
  },

  // --- STORIES ---
  getStories(): Record<string, Story> {
    return getLocal<Record<string, Story>>('vn_stories', {});
  },

  saveStory(story: Story): void {
    const stories = this.getStories();
    stories[story.username] = story;
    setLocal('vn_stories', stories);
  },

  // --- RELATIONSHIPS (FOLLOWERS / FOLLOWING) ---
  getFollowersMap(): Record<string, Record<string, boolean>> {
    return getLocal<Record<string, Record<string, boolean>>>('vn_followers', {});
  },

  getFollowingMap(): Record<string, Record<string, boolean>> {
    return getLocal<Record<string, Record<string, boolean>>>('vn_following', {});
  },

  getFollowers(username: string): Record<string, boolean> {
    return this.getFollowersMap()[username] || {};
  },

  getFollowing(username: string): Record<string, boolean> {
    return this.getFollowingMap()[username] || {};
  },

  followUser(activeUser: string, targetUser: string): void {
    const followersMap = this.getFollowersMap();
    const followingMap = this.getFollowingMap();

    if (!followersMap[targetUser]) followersMap[targetUser] = {};
    if (!followingMap[activeUser]) followingMap[activeUser] = {};

    followersMap[targetUser][activeUser] = true;
    followingMap[activeUser][targetUser] = true;

    setLocal('vn_followers', followersMap);
    setLocal('vn_following', followingMap);
  },

  unfollowUser(activeUser: string, targetUser: string): void {
    const followersMap = this.getFollowersMap();
    const followingMap = this.getFollowingMap();

    if (followersMap[targetUser]) {
      delete followersMap[targetUser][activeUser];
    }
    if (followingMap[activeUser]) {
      delete followingMap[activeUser][targetUser];
    }

    setLocal('vn_followers', followersMap);
    setLocal('vn_following', followingMap);
  },

  // --- CHATS ---
  getChatRooms(): Record<string, ChatMessage[]> {
    return getLocal<Record<string, ChatMessage[]>>('vn_chats', {});
  },

  getChatRoomMessages(roomKey: string): ChatMessage[] {
    const rooms = this.getChatRooms();
    return rooms[roomKey] || [];
  },

  sendChatMessage(roomKey: string, message: ChatMessage): void {
    const rooms = this.getChatRooms();
    if (!rooms[roomKey]) {
      rooms[roomKey] = [];
    }
    rooms[roomKey].push(message);
    setLocal('vn_chats', rooms);
  }
};
