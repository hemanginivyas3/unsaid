import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import { EmotionType } from "../types";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";

type JournalItem = {
  id: string;
  userText: string;
  createdAt?: Timestamp;
  emotions?: EmotionType[];
};

const Journal: React.FC = () => {
  const [items, setItems] = useState<JournalItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEntries = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        const q = query(
          collection(db, "emotionEntries"),
          where("userId", "==", uid),
          orderBy("createdAt", "desc")
        );

        const snap = await getDocs(q);

        const data: JournalItem[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));

        setItems(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadEntries();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center text-aura-500 font-serif">
        Loading your journal...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full px-4">
      <h2 className="text-3xl font-serif text-aura-900 italic mb-6">
        Your Journal
      </h2>

      {items.length === 0 ? (
        <div className="p-8 bg-white rounded-[2.5rem] border border-aura-100 text-center text-aura-500 font-serif">
          No entries yet 💙 Start your first reflection.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-6 bg-white rounded-[2rem] border border-aura-100 shadow-sm"
            >
              <p className="text-aura-900 font-serif text-lg leading-relaxed">
                {item.userText?.slice(0, 180)}
                {item.userText?.length > 180 ? "..." : ""}
              </p>

              {item.emotions && item.emotions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {item.emotions.map((e, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full text-xs bg-aura-50 text-aura-700 border border-aura-100"
                    >
                      {e}
                    </span>
                  ))}
                </div>
              )}

              {item.createdAt && (
                <p className="mt-3 text-xs text-aura-400">
                  {item.createdAt.toDate().toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Journal;
