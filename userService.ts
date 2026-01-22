import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export async function getUserProfile(uid: string) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;
  return snap.data();
}

export async function saveUserProfile(uid: string, name: string) {
  const ref = doc(db, "users", uid);

  await setDoc(
    ref,
    {
      name,
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );

  return true;
}
