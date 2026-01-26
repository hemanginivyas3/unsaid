import { addDoc, collection, getDocs, orderBy, query, serverTimestamp, where } from "firebase/firestore";
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
    content: entry.encryptedContent, // ✅ encrypted only
    type: entry.type,
    emotions: entry.emotions || [],
    audioId: entry.audioId || null,
    timestamp: entry.timestamp,
    createdAt: serverTimestamp(),
  });
}

export async function getEncryptedEntries(userId: string) {
  const ref = collection(db, "entries");

  const q = query(ref, where("userId", "==", userId), orderBy("timestamp", "desc"));
  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as any),
  }));
}
