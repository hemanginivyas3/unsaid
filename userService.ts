import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function getUserProfile(uid: string) {
  try {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) return null;

    return snap.data();
  } catch (error) {
    console.error("getUserProfile error:", error);
    return null;
  }
}

