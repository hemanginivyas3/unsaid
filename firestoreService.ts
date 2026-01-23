import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export async function saveEmotionEntry(entry: {
  userId: string;
  userText: string;
  aiReply: string;
}) {
  const ref = collection(db, "emotions");

  // ✅ PRIVACY MODE:
  // Don't store the actual text at all.
  return await addDoc(ref, {
    userId: entry.userId,
    createdAt: serverTimestamp(),

    // Store ONLY safe metadata
    hasText: !!entry.userText?.trim(),
    textLength: entry.userText?.length || 0,
    hasAudio: entry.userText === "(Voice Note)",
    aiUsed: false, // since we removed AI
  });
}
