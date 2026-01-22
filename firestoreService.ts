import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export async function saveEmotionEntry(entry: {
  userId: string;
  userText: string;
  aiReply?: string; // ✅ OPTIONAL now
}) {
  const ref = collection(db, "emotions");

  return await addDoc(ref, {
    userId: entry.userId,
    userText: entry.userText,
    aiReply: entry.aiReply || "", // ✅ safe default
    createdAt: serverTimestamp(),
  });
}
