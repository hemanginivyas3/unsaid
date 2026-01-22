import React, { useMemo, useState } from "react";
import { Entry } from "../types";

interface DiaryProps {
  entries: Entry[];
}

const Diary: React.FC<DiaryProps> = ({ entries }) => {
  const [query, setQuery] = useState("");

  // ✅ Helper: format day key (YYYY-MM-DD)
  const getDayKey = (ts: number) => {
    const d = new Date(ts);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // ✅ Search filter (basic)
  const filteredEntries = useMemo(() => {
    if (!query.trim()) return entries;
    const q = query.toLowerCase();
    return entries.filter((e) => e.content.toLowerCase().includes(q));
  }, [entries, query]);

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

  const maxEmotionCount =
    emotionStats.length > 0 ? emotionStats[0][1] : 1;

  return (
    <div className="space-y-8 fade-in">
      {/* ✅ Dashboard Card */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-aura-100 shadow-sm">
        <h2 className="text-2xl font-serif text-aura-900 italic">
          Your Diary
        </h2>
        <p className="text-aura-400 text-sm mt-1">
          A calm record of your thoughts, feelings, and wins.
        </p>

        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="p-4 rounded-2xl bg-aura-50 border border-aura-100">
            <p className="text-[10px] font-bold text-aura-400 uppercase tracking-widest">
              Total Entries
            </p>
            <p className="text-2xl font-serif text-aura-900 mt-1">
              {totalEntries}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-aura-50 border border-aura-100">
            <p className="text-[10px] font-bold text-aura-400 uppercase tracking-widest">
              Today
            </p>
            <p className="text-2xl font-serif text-aura-900 mt-1">
              {todayEntriesCount}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-aura-50 border border-aura-100">
            <p className="text-[10px] font-bold text-aura-400 uppercase tracking-widest">
              Streak
            </p>
            <p className="text-2xl font-serif text-aura-900 mt-1">
              {streak} 🔥
            </p>
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

      {/* ✅ Search */}
      <div className="bg-white rounded-[2.5rem] p-6 border border-aura-100 shadow-sm">
        <p className="text-[10px] font-bold text-aura-400 uppercase tracking-widest mb-3">
          Search
        </p>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search inside your diary..."
          className="w-full px-4 py-3 rounded-2xl border border-aura-200 outline-none font-serif text-aura-900 bg-aura-50/30 focus:ring-2 ring-aura-200"
        />
      </div>

      {/* ✅ Entries */}
      <div className="space-y-4">
        <h3 className="text-xl font-serif italic text-aura-900">
          Your Entries
        </h3>

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
