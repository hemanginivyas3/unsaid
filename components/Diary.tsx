import React, { useMemo, useState } from "react";
import { Entry } from "../types";

interface DiaryProps {
  entries: Entry[];
}

type SortMode = "newest" | "oldest";
type FilterType = "all" | "vent" | "reflection" | "letter";

const Diary: React.FC<DiaryProps> = ({ entries }) => {
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterEmotion, setFilterEmotion] = useState<string>("all");

  // ✅ Helper: format day key (YYYY-MM-DD)
  const getDayKey = (ts: number) => {
    const d = new Date(ts);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // ✅ Stats
  const totalEntries = entries.length;

  const todayKey = getDayKey(Date.now());
  const todayEntriesCount = entries.filter(
    (e) => getDayKey(e.timestamp) === todayKey
  ).length;

  // ✅ Streak calculation
  const streak = useMemo(() => {
    if (entries.length === 0) return 0;

    const daySet = new Set(entries.map((e) => getDayKey(e.timestamp)));

    let s = 0;
    let cursor = new Date();
    while (true) {
      const key = getDayKey(cursor.getTime());
      if (daySet.has(key)) {
        s++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
    return s;
  }, [entries]);

  // ✅ Emotion chart
  const emotionStats = useMemo(() => {
    const counts: Record<string, number> = {};
    entries.forEach((e) => {
      if (e.emotions && e.emotions.length > 0) {
        e.emotions.forEach((em) => {
          counts[em] = (counts[em] || 0) + 1;
        });
      }
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [entries]);

  const maxEmotionCount = emotionStats.length > 0 ? emotionStats[0][1] : 1;

  // ✅ For emotion dropdown options
  const emotionOptions = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((e) => {
      e.emotions?.forEach((em) => set.add(em));
    });
    return Array.from(set).sort();
  }, [entries]);

  // ✅ Filter + Sort entries (MAIN LOGIC)
  const filteredEntries = useMemo(() => {
    let result = [...entries];

    // ✅ sort
    result.sort((a, b) =>
      sortMode === "newest" ? b.timestamp - a.timestamp : a.timestamp - b.timestamp
    );

    // ✅ search
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter((e) => e.content.toLowerCase().includes(q));
    }

    // ✅ type filter
    if (filterType !== "all") {
      result = result.filter((e) => e.type === filterType);
    }

    // ✅ emotion filter
    if (filterEmotion !== "all") {
      result = result.filter((e) => e.emotions?.includes(filterEmotion));
    }

    return result;
  }, [entries, query, sortMode, filterType, filterEmotion]);

  return (
    <div className="space-y-8 fade-in">
      {/* ✅ Dashboard Card */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-aura-100 shadow-sm">
        <h2 className="text-2xl font-serif text-aura-900 italic">Your Diary</h2>
        <p className="text-aura-400 text-sm mt-1">
          A calm record of your thoughts, feelings, and wins.
        </p>

        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="p-4 rounded-2xl bg-aura-50 border border-aura-100">
            <p className="text-[10px] font-bold text-aura-400 uppercase tracking-widest">
              Total Entries
            </p>
            <p className="text-2xl font-serif text-aura-900 mt-1">{totalEntries}</p>
          </div>

          <div className="p-4 rounded-2xl bg-aura-50 border border-aura-100">
            <p className="text-[10px] font-bold text-aura-400 uppercase tracking-widest">
              Today
            </p>
            <p className="text-2xl font-serif text-aura-900 mt-1">{todayEntriesCount}</p>
          </div>

          <div className="p-4 rounded-2xl bg-aura-50 border border-aura-100">
            <p className="text-[10px] font-bold text-aura-400 uppercase tracking-widest">
              Streak
            </p>
            <p className="text-2xl font-serif text-aura-900 mt-1">{streak} 🔥</p>
          </div>
        </div>

        {/* ✅ Mood chart */}
        <div className="mt-7">
          <p className="text-[10px] font-bold text-aura-400 uppercase tracking-widest mb-3">
            Mood Map
          </p>

          {emotionStats.length === 0 ? (
            <p className="text-aura-400 text-sm">
              No emotion tags yet. Save a reflection with emotions 💙
            </p>
          ) : (
            <div className="space-y-3">
              {emotionStats.slice(0, 6).map(([emotion, count]) => {
                const width = Math.round((count / maxEmotionCount) * 100);
                return (
                  <div key={emotion}>
                    <div className="flex justify-between text-xs text-aura-600 font-bold mb-1">
                      <span>{emotion}</span>
                      <span>{count}</span>
                    </div>
                    <div className="w-full h-3 bg-aura-50 border border-aura-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-aura-600 rounded-full transition-all"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ✅ Search + Filters */}
      <div className="bg-white rounded-[2.5rem] p-6 border border-aura-100 shadow-sm space-y-4">
        <p className="text-[10px] font-bold text-aura-400 uppercase tracking-widest">
          Search & Filter
        </p>

        {/* Search */}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search inside your diary..."
          className="w-full px-4 py-3 rounded-2xl border border-aura-200 outline-none font-serif text-aura-900 bg-aura-50/30 focus:ring-2 ring-aura-200"
        />

        {/* Filters Row */}
        <div className="grid grid-cols-3 gap-3">
          {/* Type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as FilterType)}
            className="w-full px-3 py-3 rounded-2xl border border-aura-200 bg-white text-aura-800 text-sm font-bold"
          >
            <option value="all">All Types</option>
            <option value="reflection">Reflection</option>
            <option value="vent">Vent</option>
            <option value="letter">Letter</option>
          </select>

          {/* Emotion */}
          <select
            value={filterEmotion}
            onChange={(e) => setFilterEmotion(e.target.value)}
            className="w-full px-3 py-3 rounded-2xl border border-aura-200 bg-white text-aura-800 text-sm font-bold"
          >
            <option value="all">All Emotions</option>
            {emotionOptions.map((em) => (
              <option key={em} value={em}>
                {em}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="w-full px-3 py-3 rounded-2xl border border-aura-200 bg-white text-aura-800 text-sm font-bold"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>

        {/* Clear Filters */}
        <button
          onClick={() => {
            setQuery("");
            setFilterType("all");
            setFilterEmotion("all");
            setSortMode("newest");
          }}
          className="w-full py-3 rounded-2xl bg-aura-50 border border-aura-100 text-aura-700 font-bold text-sm hover:bg-aura-100 transition-all"
        >
          Clear Filters
        </button>
      </div>

      {/* ✅ Entries */}
      <div className="space-y-4">
        <h3 className="text-xl font-serif italic text-aura-900">Your Entries</h3>

        {filteredEntries.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-8 border border-aura-100 shadow-sm text-aura-400 text-sm">
            No entries found.
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white rounded-[2.5rem] p-6 border border-aura-100 shadow-sm"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-aura-400">
                  {entry.type}
                </span>
                <span className="text-[10px] text-aura-300 font-bold">
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
              </div>

              <p className="text-aura-900 font-serif text-lg leading-relaxed whitespace-pre-wrap">
                {entry.content}
              </p>

              {entry.emotions && entry.emotions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {entry.emotions.map((em) => (
                    <span
                      key={em}
                      className="px-3 py-1 rounded-full text-[10px] font-bold bg-aura-50 text-aura-700 border border-aura-100"
                    >
                      {em}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Diary;
