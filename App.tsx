import NameSetup from "./NameSetup";
import { getUserProfile } from "./userService";
import React, { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";

import Auth from "./Auth";
import { auth } from "./firebase";

import Layout from "./components/Layout";
import Home from "./components/Home";
import Listener from "./components/Listener";
import Diary from "./components/Diary";
import Letter from "./components/Letter";
import Profile from "./components/Profile";
import Chat from "./components/Chat";

import { ViewMode, Entry } from "./types";

const App: React.FC = () => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [activeView, setActiveView] = useState<ViewMode>("home");
  const [entries, setEntries] = useState<Entry[]>([]);

  const [userName, setUserName] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);


  // ✅ ALWAYS runs (no conditional hooks)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setFirebaseUser(u);
      setLoadingAuth(false);

      if (u) {
        setActiveView("home");
      }
    });

    return () => unsub();
  }, []);

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


  // ✅ Load entries only after we know the user
  useEffect(() => {
    if (!firebaseUser) return;

    const savedEntries = localStorage.getItem(`aura_entries_${firebaseUser.uid}`);
    if (savedEntries) {
      try {
        setEntries(JSON.parse(savedEntries));
      } catch (e) {
        console.error("Failed to parse entries", e);
      }
    }
  }, [firebaseUser]);

  // ✅ Sync entries only after user exists
  useEffect(() => {
    if (!firebaseUser) return;

    localStorage.setItem(`aura_entries_${firebaseUser.uid}`, JSON.stringify(entries));
  }, [entries, firebaseUser]);

  const handleLogout = async () => {
    await signOut(auth);
    setEntries([]);
  };

  const handleSaveEntry = (newEntry: Partial<Entry>) => {
    const entry: Entry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      content: "",
      type: "vent",
      ...newEntry,
    };

    setEntries((prev) => [entry, ...prev]);
  };

  const renderContent = () => {
    switch (activeView) {
      case "home":
        return <Home onViewChange={setActiveView} />;

      case "listener":
        return (
          <Listener
            onSave={handleSaveEntry}
            onClose={() => setActiveView("home")}
          />
        );

      case "diary":
        return <Diary entries={entries} />;

      case "letter":
        return (
          <Letter
            onSave={handleSaveEntry}
            onClose={() => setActiveView("home")}
          />
        );

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

      case "chat":
        return <Chat />;

      default:
        return <Home onViewChange={setActiveView} />;
    }
  };

  // ✅ While auth is loading
  if (loadingAuth) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  // ✅ If not logged in
  if (!firebaseUser) {
    return <Auth />;
  }

  if (profileLoading) {
    return <div style={{ padding: 20 }}>Loading profile...</div>;
}

if (!userName) {
  return (
    <NameSetup
      uid={firebaseUser.uid}
      onDone={(name) => setUserName(name)}
    />
  );
}


  // ✅ If logged in → show full app
  return (
    <Layout
      activeView={activeView}
      onViewChange={setActiveView}
      isLoggedIn={true}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;

