import React, { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";

import { auth } from "./firebase";
import Auth from "./Auth";

import Layout from "./components/Layout";
import Home from "./components/Home";
import Listener from "./components/Listener";
import Diary from "./components/Diary";
import Letter from "./components/Letter";
import Profile from "./components/Profile";
import Calendar from "./components/Calendar";
import Journal from "./components/Journal";

import NameSetup from "./NameSetup";
import { getUserProfile } from "./userService";

import { ViewMode, Entry } from "./types";

import { encryptText } from "./crypto";
import { saveEncryptedEntry, getEncryptedEntries } from "./entriesService";

const App: React.FC = () => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [activeView, setActiveView] = useState<ViewMode>("home");
  const [entries, setEntries] = useState<Entry[]>([]);

  const [userName, setUserName] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // ✅ Auth Listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setFirebaseUser(u);
      setLoadingAuth(false);

      if (u) setActiveView("home");
    });

    return () => unsub();
  }, []);

  // ✅ Load Profile
  useEffect(() => {
    const loadProfile = async () => {
      if (!firebaseUser) return;

      setProfileLoading(true);
      const profile = await getUserProfile(firebaseUser.uid);

      setUserName(profile?.name || null);
      setProfileLoading(false);
    };

    loadProfile();
  }, [firebaseUser]);

  // ✅ Load entries from Firestore first, fallback to localStorage
  useEffect(() => {
  const loadEntries = async () => {
    if (!firebaseUser) return;

    try {
      const cloudEntries = await getEncryptedEntries(firebaseUser.uid);

      // ✅ ALWAYS load from Firestore if possible
      if (cloudEntries && cloudEntries.length >= 0) {
        setEntries(cloudEntries);
        return;
      }
    } catch (err) {
      console.error("Firestore load failed. Using local backup:", err);
    }

    // ✅ fallback localStorage
    const savedEntries = localStorage.getItem(`aura_entries_${firebaseUser.uid}`);
    if (savedEntries) {
      try {
        setEntries(JSON.parse(savedEntries));
      } catch (e) {
        console.error("Failed to parse local entries", e);
      }
    }
  };

  loadEntries();
}, [firebaseUser]);


  // ✅ Sync localStorage backup (only as backup)
  useEffect(() => {
    if (!firebaseUser) return;

    localStorage.setItem(
      `aura_entries_${firebaseUser.uid}`,
      JSON.stringify(entries)
    );
  }, [entries, firebaseUser]);

  const handleLogout = async () => {
    if (firebaseUser) {
    localStorage.removeItem(`aura_entries_${firebaseUser.uid}`);
  }
    await signOut(auth);
    setEntries([]);
  };

  // ✅ SAVE ENTRY (encrypt + local + firestore)
  const handleSaveEntry = async (newEntry: Partial<Entry>) => {
    if (!firebaseUser) return;

    const rawContent = newEntry.content || "";

    const encryptedContent = rawContent.trim()
      ? await encryptText(rawContent)
      : "";

    const entry: Entry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      type: newEntry.type || "vent",
      emotions: newEntry.emotions || [],
      audioId: newEntry.audioId,
      content: encryptedContent, // ✅ encrypted stored here
      isPinned: newEntry.isPinned || false,
      isFavorite: newEntry.isFavorite || false,
    };

    // ✅ Save locally (fast UI)
    setEntries((prev) => [entry, ...prev]);

    // ✅ Save encrypted to Firestore (cloud sync)
    try {
      await saveEncryptedEntry({
        userId: firebaseUser.uid,
        encryptedContent: encryptedContent,
        type: entry.type,
        emotions: entry.emotions || [],
        audioId: entry.audioId,
        timestamp: entry.timestamp,
      });
    } catch (err) {
      console.error("Firestore save failed:", err);
    }
  };

  const deleteEntryById = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const renderContent = () => {
    switch (activeView) {
      case "home":
        return (
          <Home
            onViewChange={setActiveView}
            entries={entries}
            onQuickSave={handleSaveEntry}
          />
        );

      case "calendar":
        return <Calendar entries={entries} />;

      case "listener":
        return (
          <Listener
            onSave={handleSaveEntry}
            onClose={() => setActiveView("home")}
          />
        );

      case "diary":
        return (
          <Diary
            entries={entries}
            onUpdateEntries={setEntries}
            onDeleteEntry={deleteEntryById}
          />
        );

      case "letter":
        return (
          <Letter
            onSave={handleSaveEntry}
            onClose={() => setActiveView("home")}
          />
        );

      case "journal":
        return <Journal />;

      case "profile":
        return (
          <Profile
            user={{
              name: userName,
              joinedDate: Date.now(),
              streak: 1,
              lastUsed: Date.now(),
            }}
            onLogout={handleLogout}
          />
        );

      default:
        return (
          <Home
            onViewChange={setActiveView}
            entries={entries}
            onQuickSave={handleSaveEntry}
          />
        );
    }
  };

  // ✅ Auth loading
  if (loadingAuth) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  // ✅ Not logged in
  if (!firebaseUser) {
    return <Auth />;
  }

  // ✅ Profile loading
  if (profileLoading) {
    return <div style={{ padding: 20 }}>Loading profile...</div>;
  }

  // ✅ Ask name if missing
  if (!userName) {
    return (
      <NameSetup uid={firebaseUser.uid} onDone={(name) => setUserName(name)} />
    );
  }

  // ✅ Logged in → show app
  return (
    <Layout activeView={activeView} onViewChange={setActiveView} isLoggedIn>
      {renderContent()}
    </Layout>
  );
};

export default App;
