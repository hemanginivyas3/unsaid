import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";

export async function saveEncryptedEntry(entry: {
  userId: string;
  encryptedContent: string;
  type: string;
  emotions: string[];
  audioId?: string;
  timestamp: number;
}) {
  const ref = collection(db, "entries");

  return await addDoc(ref, {
    userId: entry.userId,
    encryptedContent: entry.encryptedContent,
    type: entry.type,
    emotions: entry.emotions || [],
    timestamp: entry.timestamp,
    
    audioId: null,
  });
}

export async function getEncryptedEntries(userId: string) {
  const ref = collection(db, "entries");

  const q = query(ref, where("userId", "==", userId));
  const snap = await getDocs(q);

  return snap.docs.map((doc) => {
    const d = doc.data();

    return {
      id: doc.id,
      timestamp: d.timestamp,
      content: d.encryptedContent, // ✅ encrypted stays in `content`
      type: d.type,
      emotions: d.emotions || [],
      audioId: d.audioId || undefined,
      isPinned: false,
      isFavorite: false,
    };
  });
}
