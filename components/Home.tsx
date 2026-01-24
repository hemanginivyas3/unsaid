import React, { useState } from "react";
import { ViewMode, Entry } from "../types";
import { getDailyPrompt } from "../services/dailyPrompt";

interface HomeProps {
  onViewChange: (view: ViewMode) => void;

  // ✅ NEW
  onQuickSave: (entry: Partial<Entry>) => void;
}

const moods = [
  { label: "Calm", emoji: "😌" },
  { label: "Happy", emoji: "😊" },
  { label: "Sad", emoji: "😔" },
  { label: "Angry", emoji: "😡" },
  { label: "Anxious", emoji: "😰" },
];

const Home: React.FC<HomeProps> = ({ onViewChange, onQuickSave }) => {
  const { prompt } = getDailyPrompt();

  const [copied, setCopied] = useState(false);
  const [savedMood, setSavedMood] = useState<string | null>(null);

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMoodTap = (mood: string) => {
    setSavedMood(mood);

    onQuickSave({
      type: "reflection",
      content: `🌿 Mood check-in: ${mood}`,
      mood,
      emotions: [],
    });

    setTimeout(() => setSavedMood(null), 1500);
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

      {/* ✅ Daily Mood Check-in */}
      <div className="bg-white rounded-[2.5rem] p-7 border border-aura-100 shadow-sm">
        <p className="text-[10px] font-bold text-aura-400 uppercase tracking-widest">
          Daily Check-in
        </p>

        <p className="text-aura-900 font-serif text-lg mt-2">
          How are you feeling right now?
        </p>

        <div className="flex flex-wrap gap-2 mt-5">
          {moods.map((m) => (
            <button
              key={m.label}
              onClick={() => handleMoodTap(m.label)}
              className="px-4 py-2 rounded-full border border-aura-100 bg-aura-50 text-aura-800 font-bold text-sm hover:bg-aura-100 transition-all"
            >
              {m.emoji} {m.label}
            </button>
          ))}
        </div>

        {savedMood && (
          <p className="mt-4 text-center text-sm text-aura-500 font-serif italic">
            Saved: {savedMood} ✅
          </p>
        )}
      </div>

      {/* ✅ Daily Prompt Card */}
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
      </div>

      {/* ✅ Open Diary Card */}
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
      </button>

      {/* ✅ Reflection + Letter Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onViewChange("listener")}
          className="bg-white p-6 rounded-[2.5rem] border border-aura-100 shadow-sm text-left hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-aura-50 flex items-center justify-center mb-4 group-hover:bg-aura-100 transition-colors">
            🎙️
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
            ✉️
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
  );
};

export default Home;
