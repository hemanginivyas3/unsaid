import React, { useState } from "react";
import { ViewMode } from "../types";
import { getDailyPrompt } from "../services/dailyPrompt";

interface HomeProps {
  onViewChange: (view: ViewMode) => void;
}

const Home: React.FC<HomeProps> = ({ onViewChange }) => {
  const { prompt } = getDailyPrompt();

  const [copied, setCopied] = useState(false);

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-10 fade-in">
      <div className="space-y-2">
        <h1 className="text-4xl font-serif text-aura-900 leading-tight">
          Welcome to your sanctuary.
        </h1>
        <p className="text-aura-400 font-medium text-lg leading-relaxed italic">
          "Take a deep breath. You are safe here."
        </p>
      </div>

      {/* ✅ Daily Prompt Card (NEW) */}
      <div className="bg-white rounded-[2.5rem] p-7 border border-aura-100 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold text-aura-400 uppercase tracking-widest">
              Daily Prompt
            </p>
            <p className="text-aura-900 font-serif text-lg leading-relaxed mt-2">
              {prompt}
            </p>
          </div>

          <button
            onClick={copyPrompt}
            className="shrink-0 px-4 py-2 rounded-2xl bg-aura-50 border border-aura-100 text-aura-700 font-bold text-xs hover:bg-aura-100 transition-all"
          >
            {copied ? "Copied ✅" : "Copy"}
          </button>
        </div>

        <div className="absolute right-[-30px] top-[-30px] opacity-10">
          <svg
            className="w-40 h-40 text-aura-900"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
          </svg>
        </div>
      </div>

      {/* ✅ Main Action Card */}
      <button
        onClick={() => onViewChange("diary")}
        className="w-full bg-gradient-to-br from-aura-800 to-aura-900 p-8 rounded-[2.5rem] text-left shadow-2xl relative overflow-hidden group hover:scale-[1.01] transition-all"
      >
        <div className="relative z-10">
          <span className="text-aura-200 text-xs font-bold uppercase tracking-widest mb-2 block">
            Your Space
          </span>
          <h2 className="text-white text-3xl font-serif mb-2">Open Diary</h2>
          <p className="text-aura-300 text-sm max-w-[260px] leading-relaxed">
            Read your past reflections, vents, letters and emotions — anytime.
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

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onViewChange("listener")}
          className="bg-white p-6 rounded-[2.5rem] border border-aura-100 shadow-sm text-left hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-aura-50 flex items-center justify-center mb-4 group-hover:bg-aura-100 transition-colors">
            <svg
              className="h-5 w-5 text-aura-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-serif text-aura-800 mb-1">
            Deep Reflection
          </h3>
          <p className="text-[10px] text-aura-400 font-bold uppercase tracking-tighter">
            Speak or write freely
          </p>
        </button>

        <button
          onClick={() => onViewChange("letter")}
          className="bg-white p-6 rounded-[2.5rem] border border-aura-100 shadow-sm text-left hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-aura-50 flex items-center justify-center mb-4 group-hover:bg-aura-100 transition-colors">
            <svg
              className="h-5 w-5 text-aura-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-serif text-aura-800 mb-1">
            Secret Letter
          </h3>
          <p className="text-[10px] text-aura-400 font-bold uppercase tracking-tighter">
            Seal & release
          </p>
        </button>
      </div>

      <div className="bg-aura-100/50 p-6 rounded-[2.5rem] border border-aura-200/50 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-aura-400 uppercase tracking-widest">
            Daily Wisdom
          </span>
          <p className="text-aura-800 font-serif italic text-sm mt-1">
            "Your heart is a sanctuary. Keep its doors open to yourself."
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
