import { Post, User } from '../types';
import { StorageService } from './storage';

const FRESH_POSTS_POOL = [
  {
    author: 'retro_neon',
    name: 'Retro Future',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&h=600&q=80',
    caption: 'Tokyo alleys in late midnight rain. High contrast analog reflections 🌧️✨',
  },
  {
    author: 'cyber_lens',
    name: 'Neo Cyber',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    url: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?auto=format&fit=crop&w=600&h=600&q=80',
    caption: 'Deep pink chromatic aberrations in the synth lab. Visual overload.',
  },
  {
    author: 'minimalist_arc',
    name: 'Form & Space',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&h=150&q=80',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&h=600&q=80',
    caption: 'Concrete curves, high negative space, brutalist simplicity.',
  },
  {
    author: 'vibe_architect',
    name: 'Nostalgia Grid',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&h=150&q=80',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&h=600&q=80',
    caption: 'Vintage synthesizer dials and analog meters glow. Pure sound-wave architecture.',
  },
  {
    author: 'shadow_vogue',
    name: 'Sartorial Dark',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=80',
    url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&h=600&q=80',
    caption: 'Midnight silhouette draped in charcoal. Textured street style.',
  },
  {
    author: 'cosmic_wander',
    name: 'Cosmos Horizon',
    avatar: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=150&h=150&q=80',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&h=600&q=80',
    caption: 'Satellites drifting into high orbit. Earth glow in cosmic silence.',
  }
];

export function injectRandomFreshPost(activeUserUsername: string): Post | null {
  // Filter out posts that are already present in the feed to avoid duplicates
  const currentPosts = StorageService.getPosts();
  const availablePool = FRESH_POSTS_POOL.filter(
    (item) => !currentPosts.some((p) => p.caption === item.caption)
  );

  // If we ran out of new unique ones, pick any random one from the main pool
  const candidate = availablePool.length > 0 
    ? availablePool[Math.floor(Math.random() * availablePool.length)]
    : FRESH_POSTS_POOL[Math.floor(Math.random() * FRESH_POSTS_POOL.length)];

  if (!candidate) return null;

  // Make sure the candidate author is also present in the users db so we can search/DM them
  const authorUser: User = {
    username: candidate.author,
    name: candidate.name,
    bio: `Aesthetic creator node. Curating high fidelity visual textures. Follow to join the frequency.`,
    avatar: candidate.avatar
  };
  StorageService.saveUser(authorUser);

  // Generate the new post
  const newPostId = `post_fresh_${Date.now()}`;
  const newPost: Post = {
    id: newPostId,
    author: candidate.author,
    avatar: candidate.avatar,
    url: candidate.url,
    caption: candidate.caption,
    timestamp: Date.now(),
    likes: {},
    comments: {
      'c_1': {
        id: 'c_1',
        author: candidate.author,
        text: 'Drop a reply if you vibe with this perspective!',
        timestamp: Date.now() - 3000
      }
    }
  };

  // Prepend or save post
  StorageService.savePost(newPost);
  return newPost;
}
