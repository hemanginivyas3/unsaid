import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export const DAILY_LIMIT = 20;

function getTodayKey() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export async function canUseGemini(uid: string) {
  const today = getTodayKey();
  const ref = doc(db, "usage", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return { allowed: true, remaining: DAILY_LIMIT };
  }

  const data = snap.data() as any;

  if (data.date !== today) {
    return { allowed: true, remaining: DAILY_LIMIT };
  }

  const count = data.countToday || 0;
  const remaining = DAILY_LIMIT - count;

  if (remaining <= 0) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining };
}

export async function incrementGeminiUsage(uid: string) {
  const today = getTodayKey();
  const ref = doc(db, "usage", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      date: today,
      countToday: 1,
      updatedAt: serverTimestamp(),
    });
    return;
  }

  const data = snap.data() as any;

  if (data.date !== today) {
    await setDoc(
      ref,
      {
        date: today,
        countToday: 1,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return;
  }

  const count = data.countToday || 0;

  await setDoc(
    ref,
    {
      date: today,
      countToday: count + 1,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
