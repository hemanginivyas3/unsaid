
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (name: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name.trim());
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 fade-in">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-5xl font-serif italic text-aura-800 mb-4">Unsaid</h1>
        <p className="text-aura-500 mb-12 leading-relaxed">
          Welcome to your private sanctuary.<br/>
          How should I address you?
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name or nickname"
              className="w-full bg-white border border-aura-200 rounded-2xl px-6 py-4 text-aura-800 focus:outline-none focus:ring-2 focus:ring-aura-300 transition-all placeholder-aura-200"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-aura-800 text-white rounded-2xl py-4 font-medium shadow-lg hover:bg-aura-900 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enter your space
          </button>
        </form>
        
        <p className="mt-10 text-xs text-aura-300 leading-relaxed px-8">
          By entering, you create a local space where your words are heard and saved just for you.
        </p>
      </div>
    </div>
  );
};

export default Login;
