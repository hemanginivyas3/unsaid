import React from 'react';
import { UserProfile } from '../types';

interface ProfileProps {
  user: UserProfile;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onLogout }) => {
  return (
    <div className="space-y-8 fade-in">
      <div className="bg-white rounded-[2.5rem] p-8 border border-aura-100 shadow-sm text-center">
        <div className="w-20 h-20 bg-gradient-to-tr from-aura-400 to-aura-100 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl text-white font-serif italic shadow-inner">
          {user.name.charAt(0)}
        </div>
        <h2 className="text-2xl font-serif text-aura-900">{user.name}</h2>
        <p className="text-aura-300 text-sm font-medium uppercase tracking-widest mt-1">
          Joined {new Date(user.joinedDate).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
        </p>

        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="bg-aura-50 p-4 rounded-2xl border border-aura-100">
            <div className="text-2xl font-serif text-aura-800">{user.streak}</div>
            <div className="text-[10px] font-bold text-aura-400 uppercase tracking-tighter">Day Streak</div>
          </div>
          <div className="bg-aura-50 p-4 rounded-2xl border border-aura-100">
            <div className="text-2xl font-serif text-aura-800">∞</div>
            <div className="text-[10px] font-bold text-aura-400 uppercase tracking-tighter">Space Used</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 border border-aura-100 shadow-sm">
        <h3 className="text-xl font-serif text-aura-800 mb-4 italic">About Unsaid</h3>
        <p className="text-aura-600 leading-relaxed font-serif text-lg mb-4">
          Unsaid was built to be a safe, private vault for your soul. Unlike social media, there are no likes, no followers, and no judgments.
        </p>
        <p className="text-aura-500 text-sm leading-relaxed">
          Your data is stored locally on this device. We use the Gemini API to provide a listening ear, but we never share your identity. Unsaid is a tool for self-reflection and emotional clarity.
        </p>

        {/* ✅ Made by line */}
        <p className="mt-6 text-center text-[11px] text-aura-300 font-serif italic tracking-wide">
          Made by Hemangini Vyas ✨
        </p>
      </div>

      <button
        onClick={onLogout}
        className="w-full py-4 border-2 border-aura-100 rounded-2xl text-red-400 font-bold hover:bg-red-50 hover:border-red-100 transition-all flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Sign Out & Lock Vault
      </button>
    </div>
  );
};

export default Profile;
