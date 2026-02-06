import React, { useEffect, useMemo, useState } from "react";
import { Entry } from "../types";
import { decryptText } from "../crypto";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

/* =======================
   Props
======================= */

interface DiaryProps {
  entries: Entry[];
  onUpdateEntries: React.Dispatch<React.SetStateAction<Entry[]>>;
}

/* =======================
   Component
======================= */

const Diary: React.FC<DiaryProps> = ({ entries, onUpdateEntries }) => {
  const [search, setSearch] = useState("");
  const [lockMode, setLockMode] = useState(false);

  const [undoEntry, setUndoEntry] = useState<Entry | null>(null);
  const [undoTimer, setUndoTimer] = useState<ReturnType<typeof setTimeout> | null>(
    null
  );

  /* =======================
     Decryption renderer
  ======================= */

  const DecryptedText: React.FC<{ text?: string }> = ({ text }) => {
    const [decoded, setDecoded] = useState("Decrypting…");

    useEffect(() => {
      let mounted = true;

      const run = async () => {
        if (!text) {
          mounted && setDecoded("(Empty entry)");
          return;
        }

        // plain text (fallback)
        if (!text.includes(":")) {
          mounted && setDecoded(text);
          return;
        }

        try {
          const plain = await decryptText(text);
          mounted && setDecoded(plain || "⚠️ Could not decrypt");
        } catch {
          mounted && setDecoded("⚠️ Could not decrypt");
        }
      };

      run();
      return () => {
        mounted = false;
      };
    }, [text]);

    return (
      <p
        className={`font-serif text-lg whitespace-pre-wrap transition-all ${
          lockMode ? "blur-sm select-none" : ""
        }`}
      >
        {decoded}
      </p>
    );
  };

  /* =======================
     Pin / Unpin
  ======================= */

  const pinEntry = async (entry: Entry) => {
    const newPinned = !entry.isPinned;

    // UI update
    onUpdateEntries((prev) =>
      prev.map((e) =>
        e.id === entry.id
          ? { ...e, isPinned: newPinned }
          : { ...e, isPinned: false }
      )
    );

    // Persist
    await updateDoc(doc(db, "entries", entry.id), {
      isPinned: newPinned,
    });
  };

  /* =======================
     Delete + Undo
  ======================= */

  const deleteWithUndo = async (entry: Entry) => {
    onUpdateEntries((prev) => prev.filter((e) => e.id !== entry.id));
    await deleteDoc(doc(db, "entries", entry.id));

    setUndoEntry(entry);

    if (undoTimer) clearTimeout(undoTimer);

    const t = setTimeout(() => {
      setUndoEntry(null);
    }, 5000);

    setUndoTimer(t);
  };

  /* =======================
     Derived state
  ======================= */

  const pinnedEntry = useMemo(
    () => entries.find((e) => e.isPinned),
    [entries]
  );

  const visibleEntries = useMemo(() => {
    const base = entries.filter((e) => !e.isPinned);

    if (!search.trim()) return base;

    const q = search.toLowerCase();
    return base.filter((e) =>
      (e.content || "").toLowerCase().includes(q)
    );
  }, [entries, search]);

  /* =======================
     Render
  ======================= */

  return (
    <div className="space-y-6 fade-in">

      {/* Undo bar */}
      {undoEntry && (
        <div className="bg-aura-800 text-white px-6 py-4 rounded-2xl flex justify-between items-center">
          <span className="font-bold text-sm">Entry deleted</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-[2.5rem] p-6 border border-aura-100 shadow-sm">
        <h2 className="text-2xl font-serif italic text-aura-900">Your Diary</h2>
        <p className="text-aura-400 text-sm mt-1">
          A private record of your thoughts.
        </p>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your diary…"
            className="px-4 py-3 rounded-2xl border border-aura-200 bg-aura-50/40 font-serif outline-none"
          />

          <button
            onClick={() => setLockMode((p) => !p)}
            className={`rounded-2xl font-bold text-sm transition-all ${
              lockMode
                ? "bg-aura-800 text-white"
                : "bg-white border border-aura-200 text-aura-700 hover:bg-aura-50"
            }`}
          >
            {lockMode ? "🔒 Lock Mode ON" : "🔓 Turn ON Lock Mode"}
          </button>
        </div>
      </div>

      {/* Pinned */}
      {pinnedEntry && (
        <div className="bg-gradient-to-br from-aura-800 to-aura-900 text-white rounded-[2.5rem] p-6 shadow-xl">
          <p className="text-[10px] uppercase tracking-widest opacity-80">
            Pinned Entry
          </p>

          <DecryptedText text={pinnedEntry.content} />

          <button
            onClick={() => pinEntry(pinnedEntry)}
            className="mt-4 text-sm underline opacity-80"
          >
            Unpin
          </button>
        </div>
      )}

      {/* Entries */}
      {visibleEntries.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-8 border border-aura-100 text-aura-400">
          No entries found.
        </div>
      ) : (
        visibleEntries.map((entry) => (
          <div
            key={entry.id}
            className="bg-white rounded-[2.5rem] p-6 border border-aura-100 shadow-sm"
          >
            <DecryptedText text={entry.content} />

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => pinEntry(entry)}
                className="px-4 py-2 rounded-xl bg-aura-50 border border-aura-100"
              >
                📌
              </button>

              <button
                onClick={() => deleteWithUndo(entry)}
                className="px-4 py-2 rounded-xl bg-white border border-red-200 text-red-500"
              >
                🗑
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Diary;
