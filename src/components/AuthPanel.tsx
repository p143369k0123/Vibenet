import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { StorageService, computeSHA256 } from '../lib/storage';
import { User } from '../types';

interface AuthPanelProps {
  onAuthSuccess: (user: User) => void;
}

export default function AuthPanel({ onAuthSuccess }: AuthPanelProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || (!isLogin && !name)) {
      alert('Please fill out all required fields.');
      return;
    }

    const normalizedUsername = username.trim().toLowerCase().replace(/[.#$[\]]/g, '_');
    setLoading(true);

    try {
      if (isLogin) {
        const dbUser = StorageService.getUser(normalizedUsername);
        if (dbUser) {
          const hashedPassword = await computeSHA256(password);
          if (dbUser.password === hashedPassword) {
            onAuthSuccess(dbUser);
          } else {
            alert('Incorrect password. Please try again.');
          }
        } else {
          alert('User not found. Check your username or sign up!');
        }
      } else {
        // Sign Up
        const existingUser = StorageService.getUser(normalizedUsername);
        if (existingUser) {
          alert('Username is already taken. Please choose another.');
          setLoading(false);
          return;
        }

        const hashedPassword = await computeSHA256(password);
        const newUser: User = {
          username: normalizedUsername,
          name: name.trim(),
          password: hashedPassword,
          bio: 'Digital Space Node. Ready to share.',
          avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200'
        };

        StorageService.saveUser(newUser);
        onAuthSuccess(newUser);
      }
    } catch (err) {
      console.error(err);
      alert('Authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm px-4 mx-auto flex flex-col justify-center min-h-[85vh]">
      <div className="bg-[#0a0a0a] border border-[#262626] rounded-xl p-8 text-center mb-4 shadow-xl">
        <h1 className="text-4xl italic font-black tracking-wider mb-8 text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-400 font-sans">
          VibeNet
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              id="signupName"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 text-xs rounded-lg bg-[#121212] border border-[#262626] text-white focus:border-neutral-400 focus:outline-none transition-colors"
              placeholder="Full Name"
            />
          )}

          <input
            id="loginUsername"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 text-xs rounded-lg bg-[#121212] border border-[#262626] text-white focus:border-neutral-400 focus:outline-none transition-colors"
            placeholder="Username"
          />

          <div className="relative w-full">
            <input
              id="loginPassword"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-4 pr-10 py-3 text-xs rounded-lg bg-[#121212] border border-[#262626] text-white focus:border-neutral-400 focus:outline-none transition-colors"
              placeholder="Password"
            />
            <button
              type="button"
              id="togglePassword"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-neutral-400 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <button
            type="submit"
            id="btnSubmit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-[#0095F6] hover:bg-[#1877F2] active:scale-[0.99] transition-all text-xs font-bold text-white tracking-wider cursor-pointer"
          >
            {loading ? 'Processing...' : isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-[#262626]"></div>
          <span className="px-3 text-[9px] text-neutral-500 font-bold tracking-widest uppercase">OR</span>
          <div className="flex-1 border-t border-[#262626]"></div>
        </div>

        <p className="text-[10px] tracking-widest text-neutral-500 font-mono uppercase">
          Secure Interface Data Core
        </p>
      </div>

      <div className="bg-[#0a0a0a] border border-[#262626] rounded-xl p-5 text-center shadow-lg">
        <p id="authToggleText" className="text-neutral-400 text-xs">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            id="btnToggleAuth"
            onClick={() => {
              setIsLogin(!isLogin);
              setUsername('');
              setPassword('');
              setName('');
            }}
            className="text-[#0095F6] hover:underline font-bold transition-all ml-1 cursor-pointer"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  );
}
