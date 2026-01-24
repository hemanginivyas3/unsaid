import React, { useMemo } from "react";
import { Entry, ViewMode } from "../types";

interface HomeProps {
  onViewChange: (view: ViewMode) => void;
  entries?: Entry[];
}

const Home: React.FC<HomeProps> = ({ onViewChange, entries = [] }) => {
  const todayCount = useMemo(() => {
    const today = new Date().toDateString();
    return entries.filter((e) => new Date(e.timestamp).toDateString() === today)
      .length;
  }, [entries]);

  const totalCount = entries.length;

  return (
    <div className="space-y-10 fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-serif text-aura-900 leading-tight">
          Welcome to your sanctuary.
        </h1>
        <p className="text-aura-400 font-medium text-lg leading-relaxed italic">
          "Take a deep breath. You are safe here."
        </p>
      </div>

      {/* Mini Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-[2.5rem] p-6 border border-aura-100 shadow-sm">
          <p className="text-[10px] font-bold text-aura-400 uppercase tracking-widest">
            Today
          </p>
          <p className="text-3xl font-serif text-aura-900 mt-2">{todayCount}</p>
          <p className="text-aura-400 text-xs mt-1">entries written</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-6 border border-aura-100 shadow-sm">
          <p className="text-[10px] font-bold text-aura-400 uppercase tracking-widest">
            Total
          </p>
          <p className="text-3xl font-serif text-aura-900 mt-2">{totalCount}</p>
          <p className="text-aura-400 text-xs mt-1">saved in diary</p>
        </div>
      </div>

      {/* Main Action Card */}
      <button
        onClick={() => onViewChange("diary")}
        className="w-full bg-gradient-to-br from-aura-800 to-aura-900 p-8 rounded-[2.5rem] text-left shadow-2xl relative overflow-hidden group hover:scale-[1.01] transition-all"
      >
        <div className="relative z-10">
          <span className="text-aura-200 text-xs font-bold uppercase tracking-widest mb-2 block">
            Your Diary
          </span>
          <h2 className="text-white text-3xl font-serif mb-2">
            Open your vault
          </h2>
          <p className="text-aura-300 text-sm max-w-[260px] leading-relaxed">
            Read your reflections, vents, letters, voice notes — anytime.
          </p>
        </div>

        <div className="absolute right-[-20px] bottom-[-20px] opacity-10 group-hover:opacity-20 transition-opacity">
          <svg
            className="w-48 h-48 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M6 4h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2zm2 4h8v2H8V8zm0 4h8v2H8v-2z" />
          </svg>
        </div>
      </button>

      {/* Quick Actions */}
      <div>
        <p className="text-[10px] font-bold text-aura-400 uppercase tracking-widest mb-3">
          Quick actions
        </p>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => onViewChange("listener")}
            className="bg-white p-6 rounded-[2.5rem] border border-aura-100 shadow-sm text-left hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-2xl bg-aura-50 flex items-center justify-center mb-4 group-hover:bg-aura-100 transition-colors">
              🎙️
            </div>
            <h3 className="text-lg font-serif text-aura-800 mb-1">
              Reflection / Vent
            </h3>
            <p className="text-[10px] text-aura-400 font-bold uppercase tracking-tighter">
              Write or record
            </p>
          </button>

          <button
            onClick={() => onViewChange("letter")}
            className="bg-white p-6 rounded-[2.5rem] border border-aura-100 shadow-sm text-left hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-2xl bg-aura-50 flex items-center justify-center mb-4 group-hover:bg-aura-100 transition-colors">
              💌
            </div>
            <h3 className="text-lg font-serif text-aura-800 mb-1">
              Secret Letter
            </h3>
            <p className="text-[10px] text-aura-400 font-bold uppercase tracking-tighter">
              Seal & release
            </p>
          </button>
        </div>
      </div>

      {/* Daily quote */}
      <div className="bg-aura-100/50 p-6 rounded-[2.5rem] border border-aura-200/50 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-aura-400 uppercase tracking-widest">
            Daily Wisdom
          </span>
          <p className="text-aura-800 font-serif italic text-sm mt-1">
            "You deserve the same softness you give others."
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
