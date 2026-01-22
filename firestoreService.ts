import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export async function saveEmotionEntry(entry: {
  userId: string;
  userText: string;
  emotions?: string[];
  type?: "reflection" | "vent";
}) {
  const ref = collection(db, "emotions");

  return await addDoc(ref, {
    userId: entry.userId,
    userText: entry.userText,
    emotions: entry.emotions || [],
    type: entry.type || "reflection",
    createdAt: serverTimestamp(), // ✅ time sorting
  });
}

