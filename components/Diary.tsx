import React, { useEffect, useMemo, useState } from "react";
import { Entry } from "../types";
import { getAudioBlob } from "../audioStore";
import { decryptText } from "../crypto";

interface DiaryProps {
  entries: Entry[];
  onUpdateEntries: React.Dispatch<React.SetStateAction<Entry[]>>;
  onDeleteEntry: (id: string) => void;
}

type SortMode = "newest" | "oldest";
type FilterType = "all" | "vent" | "reflection" | "letter";

const Diary: React.FC<DiaryProps> = ({ entries, onUpdateEntries, onDeleteEntry }) => {
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterEmotion, setFilterEmotion] = useState<string>("all");
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // ✅ Lock Mode
  const [lockMode, setLockMode] = useState(false);

  // ✅ Undo delete
  const [undoEntry, setUndoEntry] = useState<Entry | null>(null);
  const [undoTimer, setUndoTimer] = useState<any>(null);

  // ✅ Voice note open/close
  const [openAudioId, setOpenAudioId] = useState<string | null>(null);
  const [openAudioUrl, setOpenAudioUrl] = useState<string | null>(null);

  // ✅ Helper: day key
  const getDayKey = (ts: number) => {
    const d = new Date(ts);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // ✅ Open/close voice note
  const openVoiceNote = async (audioId: string) => {
    try {
      if (openAudioId === audioId) {
        setOpenAudioId(null);
        setOpenAudioUrl(null);
        return;
      }

      const blob = await getAudioBlob(audioId);
      if (!blob) {
        alert("Audio not found 😢");
        return;
      }

      const url = URL.createObjectURL(blob);
      setOpenAudioId(audioId);
      setOpenAudioUrl(url);
    } catch (err) {
      console.error(err);
      alert("Could not open voice note 😢");
    }
  };

  // ✅ Stats
  const totalEntries = entries.length;
  const todayKey = getDayKey(Date.now());
  const todayEntriesCount = entries.filter((e) => getDayKey(e.timestamp) === todayKey).length;

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

  // ✅ Pinned entry
  const pinnedEntry = useMemo(() => {
    return entries.find((e) => e.isPinned);
  }, [entries]);

  // ✅ Filter + sort
  const filteredEntries = useMemo(() => {
    let result = [...entries];

    if (pinnedEntry) {
      result = result.filter((e) => e.id !== pinnedEntry.id);
    }

    result.sort((a, b) =>
      sortMode === "newest" ? b.timestamp - a.timestamp : a.timestamp - b.timestamp
    );

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter((e) => (e.content || "").toLowerCase().includes(q));
    }

    if (filterType !== "all") {
      result = result.filter((e) => e.type === filterType);
    }

    if (filterEmotion !== "all") {
      result = result.filter((e) => e.emotions?.includes(filterEmotion));
    }

    if (showOnlyFavorites) {
      result = result.filter((e) => e.isFavorite);
    }

    return result;
  }, [entries, query, sortMode, filterType, filterEmotion, showOnlyFavorites, pinnedEntry]);

  // ✅ Pin entry
  const pinEntry = (id: string) => {
    onUpdateEntries((prev) =>
      prev.map((e) => {
        if (e.id === id) return { ...e, isPinned: true };
        return { ...e, isPinned: false };
      })
    );
  };

  // ✅ Toggle favourite
  const toggleFavorite = (id: string) => {
    onUpdateEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isFavorite: !e.isFavorite } : e))
    );
  };

  // ✅ Delete + Undo
  const deleteWithUndo = (entry: Entry) => {
    onDeleteEntry(entry.id);
    setUndoEntry(entry);

    if (undoTimer) clearTimeout(undoTimer);

    const t = setTimeout(() => {
      setUndoEntry(null);
    }, 5000);

    setUndoTimer(t);
  };

  const handleUndo = () => {
    if (!undoEntry) return;
    onUpdateEntries((prev) => [undoEntry, ...prev]);
    setUndoEntry(null);
    if (undoTimer) clearTimeout(undoTimer);
  };

  // ✅ Decrypt component
  const DecryptedText: React.FC<{ text: string; lockMode: boolean }> = ({ text, lockMode }) => {
    const [decoded, setDecoded] = useState("Decrypting...");

    useEffect(() => {
      let mounted = true;

      const run = async () => {
        try {
          if (!text) {
            if (mounted) setDecoded("");
            return;
          }

          // ✅ Not encrypted (old entries)
          if (!text.includes(":")) {
            if (mounted) setDecoded(text);
            return;
          }

          const plain = await decryptText(text);
          if (mounted) setDecoded(plain);
        } catch (e) {
          console.error(e);
          if (mounted) setDecoded("⚠️ Could not decrypt this entry.");
        }
      };

      run();

      return () => {
        mounted = false;
      };
    }, [text]);

    return (
      <p
        className={`text-aura-900 font-serif text-lg leading-relaxed whitespace-pre-wrap transition-all ${
          lockMode ? "blur-sm select-none" : ""
        }`}
      >
        {decoded}
      </p>
    );
  };

  return (
    <div className="space-y-8 fade-in">
      {/* ✅ Undo bar */}
      {undoEntry && (
        <div className="bg-aura-800 text-white rounded-[2.5rem] px-6 py-4 shadow-2xl flex items-center justify-between">
          <p className="font-bold text-sm">✅ Entry deleted. Undo?</p>
          <button
            onClick={handleUndo}
            className="px-5 py-2 rounded-2xl bg-white text-aura-800 font-bold text-sm hover:bg-aura-50 transition-all"
          >
            Undo
          </button>
        </div>
      )}

      {/* ✅ Dashboard */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-aura-100 shadow-sm">
        <h2 className="text-2xl font-serif text-aura-900 italic">Your Diary</h2>
        <p className="text-aura-400 text-sm mt-1">A calm record of your thoughts and feelings.</p>

        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="p-4 rounded-2xl bg-aura-50 border border-aura-100">
            <p className="text-[10px] font-bold text-aura-400 uppercase tracking-widest">Total</p>
            <p className="text-2xl font-serif text-aura-900 mt-1">{totalEntries}</p>
          </div>

          <div className="p-4 rounded-2xl bg-aura-50 border border-aura-100">
            <p className="text-[10px] font-bold text-aura-400 uppercase tracking-widest">Today</p>
            <p className="text-2xl font-serif text-aura-900 mt-1">{todayEntriesCount}</p>
          </div>

          <div className="p-4 rounded-2xl bg-aura-50 border border-aura-100">
            <p className="text-[10px] font-bold text-aura-400 uppercase tracking-widest">Streak</p>
            <p className="text-2xl font-serif text-aura-900 mt-1">{streak} 🔥</p>
          </div>
        </div>

        {/* ✅ Mood Map */}
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
                      <div className="h-full bg-aura-600 rounded-full" style={{ width: `${width}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ✅ Pinned Entry */}
      {pinnedEntry && (
        <div className="bg-gradient-to-br from-aura-800 to-aura-900 text-white rounded-[2.5rem] p-7 shadow-2xl">
          <p className="text-[10px] font-bold uppercase tracking-widest text-aura-200">
            Pinned Entry 📌
          </p>
          <p className={`font-serif text-xl mt-3 leading-relaxed whitespace-pre-wrap ${lockMode ? "blur-sm select-none" : ""}`}>
            {pinnedEntry.content}
          </p>
          <p className="text-aura-200 text-xs mt-4 font-bold">
            {new Date(pinnedEntry.timestamp).toLocaleString()}
          </p>
        </div>
      )}

      {/* ✅ Filters */}
      <div className="bg-white rounded-[2.5rem] p-6 border border-aura-100 shadow-sm space-y-4">
        <p className="text-[10px] font-bold text-aura-400 uppercase tracking-widest">Search & Filter</p>

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
            <div key={entry.id} className="bg-white rounded-[2.5rem] p-6 border border-aura-100 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-aura-400">
                  {entry.type}
                </span>
                <span className="text-[10px] text-aura-300 font-bold">
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
              </div>

              {/* ✅ decrypted text */}
              <DecryptedText text={entry.content} lockMode={lockMode} />

              {/* ✅ emotions */}
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

              {/* ✅ voice note open/close */}
              {entry.audioId && (
                <div className="mt-4 space-y-3">
                  <button
                    onClick={() => openVoiceNote(entry.audioId!)}
                    className="w-full py-3 rounded-2xl bg-aura-50 border border-aura-100 text-aura-700 font-bold text-sm hover:bg-aura-100 transition-all"
                  >
                    {openAudioId === entry.audioId ? "✖ Close Voice Note" : "🎧 Open Voice Note"}
                  </button>

                  {openAudioId === entry.audioId && openAudioUrl && (
                    <div className="p-4 rounded-2xl bg-aura-50/60 border border-aura-100">
                      <p className="text-[10px] font-bold text-aura-400 uppercase tracking-widest mb-2">
                        Voice Note
                      </p>
                      <audio controls className="w-full">
                        <source src={openAudioUrl} type="audio/webm" />
                      </audio>
                    </div>
                  )}
                </div>
              )}

              {/* ✅ actions */}
              <div className="grid grid-cols-3 gap-2 mt-5">
                <button
                  onClick={() => pinEntry(entry.id)}
                  className="py-3 rounded-2xl bg-aura-50 border border-aura-100 text-aura-700 font-bold text-sm hover:bg-aura-100 transition-all"
                >
                  📌 Pin
                </button>

                <button
                  onClick={() => toggleFavorite(entry.id)}
                  className={`py-3 rounded-2xl border font-bold text-sm transition-all ${
                    entry.isFavorite
                      ? "bg-aura-800 text-white border-aura-800 hover:bg-aura-900"
                      : "bg-white text-aura-700 border-aura-200 hover:bg-aura-50"
                  }`}
                >
                  ⭐
                </button>

                <button
                  onClick={() => deleteWithUndo(entry)}
                  className="py-3 rounded-2xl bg-white border border-red-200 text-red-500 font-bold text-sm hover:bg-red-50 transition-all"
                >
                  🗑 Delete
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
