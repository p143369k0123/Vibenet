import { User, Post, Story } from '../types';

export const SEED_USERS: User[] = [
  {
    username: 'cosmic_vibe',
    name: 'Aria Sterling',
    bio: 'Visual artist exploring the intersection of digital neon aesthetics and cyber-brutalism. 🌌',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
  },
  {
    username: 'neon_rider',
    name: 'Kai Takahashi',
    bio: 'Late night wanderer, tech developer, and synthesist. Building the future in dark mode.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
  },
  {
    username: 'luna_eclipse',
    name: 'Luna Thorne',
    bio: 'Obsessed with negative space, high contrast, and dark theme UI components.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
  },
  {
    username: 'cyber_architect',
    name: 'Viktor Vance',
    bio: 'Designing digital monoliths and high-fidelity code structures. Always optimized.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
  }
];

export const SEED_POSTS: Post[] = [
  {
    id: 'post_101',
    author: 'cosmic_vibe',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    url: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?q=80&w=600&auto=format&fit=crop',
    caption: 'Lost in the digital violet haze. The core is warm.',
    timestamp: Date.now() - 3600000 * 2, // 2 hours ago
    likes: {
      'neon_rider': true,
      'luna_eclipse': true
    },
    comments: {
      'com_1': {
        id: 'com_1',
        author: 'neon_rider',
        text: 'This is absolutely gorgeous, Aria! Love the violet frequencies.',
        timestamp: Date.now() - 3600000 * 1.8,
      },
      'com_2': {
        id: 'com_2',
        author: 'luna_eclipse',
        text: 'Visual perfection. The gradients are so smooth.',
        timestamp: Date.now() - 3600000 * 1.5,
      }
    }
  },
  {
    id: 'post_102',
    author: 'neon_rider',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop',
    caption: 'Tokyo late-night exploration. Cyberpunk vibes are alive and well.',
    timestamp: Date.now() - 3600000 * 5, // 5 hours ago
    likes: {
      'cosmic_vibe': true,
      'cyber_architect': true
    },
    comments: {
      'com_3': {
        id: 'com_3',
        author: 'cyber_architect',
        text: 'Incredible perspective grid here.',
        timestamp: Date.now() - 3600000 * 4.5,
      }
    }
  },
  {
    id: 'post_103',
    author: 'luna_eclipse',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    url: 'https://images.unsplash.com/photo-1515260268569-9271009adfdb?q=80&w=600&auto=format&fit=crop',
    caption: 'Brutalist architecture in high contrast. Light finds a way.',
    timestamp: Date.now() - 3600000 * 24, // 1 day ago
    likes: {
      'cosmic_vibe': true,
      'neon_rider': true,
      'cyber_architect': true
    },
    comments: {
      'com_4': {
        id: 'com_4',
        author: 'cosmic_vibe',
        text: 'The shadows are so dramatic. Incredible shot.',
        timestamp: Date.now() - 3600000 * 23.5,
      }
    }
  }
];

export const SEED_STORIES: Story[] = [
  {
    username: 'cosmic_vibe',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=400&auto=format&fit=crop',
    timestamp: Date.now() - 3600000 * 1, // 1 hour ago
  },
  {
    username: 'neon_rider',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    url: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=400&auto=format&fit=crop',
    timestamp: Date.now() - 3600000 * 3, // 3 hours ago
  },
  {
    username: 'luna_eclipse',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400&auto=format&fit=crop',
    timestamp: Date.now() - 3600000 * 4, // 4 hours ago
  }
];

// Seed initial relationships
export const SEED_FOLLOWERS: Record<string, Record<string, boolean>> = {
  'cosmic_vibe': { 'neon_rider': true, 'luna_eclipse': true },
  'neon_rider': { 'cosmic_vibe': true, 'cyber_architect': true },
  'luna_eclipse': { 'cosmic_vibe': true },
  'cyber_architect': { 'neon_rider': true, 'luna_eclipse': true }
};

export const SEED_FOLLOWING: Record<string, Record<string, boolean>> = {
  'cosmic_vibe': { 'neon_rider': true, 'luna_eclipse': true },
  'neon_rider': { 'cosmic_vibe': true, 'cyber_architect': true },
  'luna_eclipse': { 'cosmic_vibe': true, 'cyber_architect': true },
  'cyber_architect': { 'neon_rider': true }
};
