import React, { useEffect, useMemo, useState } from "react";
import { Entry } from "../types";
import { getAudioBlob } from "../audioStore";
import { decryptText } from "../crypto";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

interface DiaryProps {
  entries: Entry[];
  onUpdateEntries: React.Dispatch<React.SetStateAction<Entry[]>>;
  onDeleteEntry: (id: string) => void;
}

type SortMode = "newest" | "oldest";
type FilterType = "all" | "vent" | "reflection" | "letter";

const Diary: React.FC<DiaryProps> = ({
  entries,
  onUpdateEntries,
}) => {
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterEmotion, setFilterEmotion] = useState("all");
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [lockMode, setLockMode] = useState(false);

  const [undoEntry, setUndoEntry] = useState<Entry | null>(null);
  const [undoTimer, setUndoTimer] = useState<NodeJS.Timeout | null>(null);

  const [openAudioId, setOpenAudioId] = useState<string | null>(null);
  const [openAudioUrl, setOpenAudioUrl] = useState<string | null>(null);

  /* ---------- helpers ---------- */

  const dayKey = (ts: number) => {
    const d = new Date(ts);
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  };

  /* ---------- decrypt text ---------- */

  const DecryptedText: React.FC<{ text?: string; lock: boolean }> = ({
    text,
    lock,
  }) => {
    const [decoded, setDecoded] = useState("Decrypting...");

    useEffect(() => {
      let mounted = true;

      const run = async () => {
        if (!text) {
          mounted && setDecoded("(Empty entry)");
          return;
        }

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
        className={`whitespace-pre-wrap font-serif text-lg ${
          lock ? "blur-sm select-none" : ""
        }`}
      >
        {decoded}
      </p>
    );
  };

  /* ---------- pin / unpin ---------- */

  const pinEntry = async (entry: Entry) => {
    const newPinnedState = !entry.isPinned;

    onUpdateEntries((prev) =>
      prev.map((e) =>
        e.id === entry.id
          ? { ...e, isPinned: newPinnedState }
          : { ...e, isPinned: false }
      )
    );

    await updateDoc(doc(db, "entries", entry.id), {
      isPinned: newPinnedState,
    });
  };

  /* ---------- delete ---------- */

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

  /* ---------- filtering ---------- */

  const pinnedEntry = useMemo(
    () => entries.find((e) => e.isPinned),
    [entries]
  );

  const filteredEntries = useMemo(() => {
    let result = entries.filter((e) => !e.isPinned);

    if (query.trim()) {
      result = result.filter((e) =>
        (e.content || "").toLowerCase().includes(query.toLowerCase())
      );
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

    result.sort((a, b) =>
      sortMode === "newest"
        ? b.timestamp - a.timestamp
        : a.timestamp - b.timestamp
    );

    return result;
  }, [
    entries,
    query,
    sortMode,
    filterType,
    filterEmotion,
    showOnlyFavorites,
  ]);

  /* ---------- render ---------- */

  return (
    <div className="space-y-6">
      {undoEntry && (
        <div className="bg-aura-800 text-white p-4 rounded-xl flex justify-between">
          <span>Entry deleted</span>
        </div>
      )}

      {pinnedEntry && (
        <div className="bg-aura-900 text-white p-6 rounded-2xl">
          <p className="text-xs uppercase">Pinned</p>
          <DecryptedText text={pinnedEntry.content} lock={lockMode} />
          <button
            onClick={() => pinEntry(pinnedEntry)}
            className="mt-3 text-sm underline"
          >
            Unpin
          </button>
        </div>
      )}

      {filteredEntries.map((entry) => (
        <div key={entry.id} className="bg-white p-6 rounded-2xl shadow">
          <DecryptedText text={entry.content} lock={lockMode} />

          <div className="flex gap-2 mt-4">
            <button onClick={() => pinEntry(entry)}>📌</button>
            <button onClick={() => deleteWithUndo(entry)}>🗑</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Diary;
