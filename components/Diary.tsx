import React, { useMemo, useState } from "react";
import { Entry } from "../types";

interface DiaryProps {
  entries: Entry[];
  onUpdateEntries: React.Dispatch<React.SetStateAction<Entry[]>>;
}

type SortMode = "newest" | "oldest";
type FilterType = "all" | "vent" | "reflection" | "letter";

const Diary: React.FC<DiaryProps> = ({ entries, onUpdateEntries }) => {
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterEmotion, setFilterEmotion] = useState<string>("all");
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // ✅ NEW: Lock Mode
  const [lockMode, setLockMode] = useState(false);

  // ✅ Helper: day key
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

  // ✅ Streak
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

  // ✅ Emotion stats
  const emotionStats = useMemo(() => {
    const counts: Record<string, number> = {};
    entries.forEach((e) => {
      e.emotions?.forEach((em) => {
        counts[em] = (counts[em] || 0) + 1;
      });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [entries]);

  const maxEmotionCount = emotionStats.length > 0 ? emotionStats[0][1] : 1;

  // ✅ Emotion dropdown options
  const emotionOptions = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((e) => e.emotions?.forEach((em) => set.add(em)));
    return Array.from(set).sort();
  }, [entries]);

  // ✅ Pinned entry (one at a time)
  const pinnedEntry = useMemo(() => {
    return entries.find((e) => e.isPinned);
  }, [entries]);

  // ✅ Filter + sort
  const filteredEntries = useMemo(() => {
    let result = [...entries];

    // ✅ Remove pinned from list to avoid duplicate view
    if (pinnedEntry) {
      result = result.filter((e) => e.id !== pinnedEntry.id);
    }

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

    // ✅ favorites only
    if (showOnlyFavorites) {
      result = result.filter((e) => e.isFavorite);
    }

    return result;
  }, [entries, query, sortMode, filterType, filterEmotion, showOnlyFavorites, pinnedEntry]);

  // ✅ PIN function (only one pin)
  const pinEntry = (id: string) => {
    onUpdateEntries((prev) =>
      prev.map((e) => {
        if (e.id === id) return { ...e, isPinned: true };
        return { ...e, isPinned: false };
      })
    );
  };

  // ✅ FAV function
  const toggleFavorite = (id: string) => {
    onUpdateEntries((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, isFavorite: !e.isFavorite } : e
      )
    );
  };

  // ✅ Export to TXT
  const exportDiaryTxt = () => {
    const sorted = [...entries].sort((a, b) => b.timestamp - a.timestamp);

    const txt = sorted
      .map((e) => {
        const date = new Date(e.timestamp).toLocaleString();
        const emotions = e.emotions && e.emotions.length > 0 ? e.emotions.join(", ") : "None";
        return `TYPE: ${e.type}\nDATE: ${date}\nEMOTIONS: ${emotions}\n\n${e.content}\n\n------------------------------\n`;
      })
      .join("\n");

    const blob = new Blob([txt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "unsaid-diary.txt";
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 fade-in">
      {/* ✅ Dashboard */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-aura-100 shadow-sm">
        <h2 className="text-2xl font-serif text-aura-900 italic">Your Diary</h2>
        <p className="text-aura-400 text-sm mt-1">
          A calm record of your thoughts, feelings, and wins.
        </p>

        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="p-4 rounded-2xl bg-aura-50 border border-aura-100">
            <p className="text-[10px] font-bold text-aura-400 uppercase tracking-widest">
              Total
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

        {/* ✅ Mood map */}
        <div className="mt-7">
          <p className="text-[10px] font-bold text-aura-400 uppercase tracking-widest mb-3">
            Mood Map
          </p>

          {emotionStats.length === 0 ? (
            <p className="text-aura-400 text-sm">No emotion tags yet 💙</p>
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
                        className="h-full bg-aura-600 rounded-full"
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

      {/* ✅ Pinned Entry Card */}
      {pinnedEntry && (
        <div className="bg-gradient-to-br from-aura-800 to-aura-900 text-white rounded-[2.5rem] p-7 shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-aura-200">
              Pinned Entry 📌
            </p>

            <p
              className={`font-serif text-xl mt-3 leading-relaxed whitespace-pre-wrap transition-all ${
                lockMode ? "blur-sm select-none" : ""
              }`}
            >
              {pinnedEntry.content}
            </p>

            <p className="text-aura-200 text-xs mt-4 font-bold">
              {new Date(pinnedEntry.timestamp).toLocaleString()}
            </p>
          </div>

          <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
            <svg className="w-40 h-40 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
            </svg>
          </div>
        </div>
      )}

      {/* ✅ Filters */}
      <div className="bg-white rounded-[2.5rem] p-6 border border-aura-100 shadow-sm space-y-4">
        <p className="text-[10px] font-bold text-aura-400 uppercase tracking-widest">
          Search & Filter
        </p>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search inside your diary..."
          className="w-full px-4 py-3 rounded-2xl border border-aura-200 outline-none font-serif text-aura-900 bg-aura-50/30 focus:ring-2 ring-aura-200"
        />

        <div className="grid grid-cols-3 gap-3">
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

          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="w-full px-3 py-3 rounded-2xl border border-aura-200 bg-white text-aura-800 text-sm font-bold"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>

        {/* ✅ Favorites toggle */}
        <button
          onClick={() => setShowOnlyFavorites((p) => !p)}
          className={`w-full py-3 rounded-2xl border font-bold text-sm transition-all ${
            showOnlyFavorites
              ? "bg-aura-800 text-white border-aura-800"
              : "bg-aura-50 text-aura-700 border-aura-100 hover:bg-aura-100"
          }`}
        >
          {showOnlyFavorites ? "Showing Favourites ⭐" : "Show Only Favourites ⭐"}
        </button>

        {/* ✅ Lock mode */}
        <button
          onClick={() => setLockMode((p) => !p)}
          className={`w-full py-3 rounded-2xl border font-bold text-sm transition-all ${
            lockMode
              ? "bg-aura-800 text-white border-aura-800"
              : "bg-white text-aura-700 border-aura-200 hover:bg-aura-50"
          }`}
        >
          {lockMode ? "🔒 Lock Mode ON" : "🔓 Turn ON Lock Mode"}
        </button>

        {/* ✅ Export */}
        <button
          onClick={exportDiaryTxt}
          className="w-full py-3 rounded-2xl bg-white border border-aura-200 text-aura-700 font-bold text-sm hover:bg-aura-50 transition-all"
        >
          📤 Export Diary (.txt)
        </button>

        {/* ✅ Clear */}
        <button
          onClick={() => {
            setQuery("");
            setFilterType("all");
            setFilterEmotion("all");
            setSortMode("newest");
            setShowOnlyFavorites(false);
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

              <p
                className={`text-aura-900 font-serif text-lg leading-relaxed whitespace-pre-wrap transition-all ${
                  lockMode ? "blur-sm select-none" : ""
                }`}
              >
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

              {/* ✅ Pinned + Favourite UI */}
              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => pinEntry(entry.id)}
                  className="flex-1 py-3 rounded-2xl bg-aura-50 border border-aura-100 text-aura-700 font-bold text-sm hover:bg-aura-100 transition-all"
                >
                  📌 Pin
                </button>

                <button
                  onClick={() => toggleFavorite(entry.id)}
                  className={`flex-1 py-3 rounded-2xl border font-bold text-sm transition-all ${
                    entry.isFavorite
                      ? "bg-aura-800 text-white border-aura-800 hover:bg-aura-900"
                      : "bg-white text-aura-700 border-aura-200 hover:bg-aura-50"
                  }`}
                >
                  {entry.isFavorite ? "⭐ Favourited" : "⭐ Favourite"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Diary;
