import React from "react";
import { ViewMode } from "../types";

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  isLoggedIn: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  activeView,
  onViewChange,
  isLoggedIn,
}) => {
  if (activeView === "login") return <>{children}</>;

  const navItems: { label: string; view: ViewMode; icon: React.ReactNode }[] = [
    {
      label: "Home",
      view: "home",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },

    {
      label: "Diary",
      view: "diary",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
    },

    {
      label: "Profile",
      view: "profile",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-aura-50">
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 pt-8 pb-32">
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-aura-400 to-aura-200 shadow-inner"></div>
            <h1 className="text-2xl font-serif italic text-aura-900 tracking-tight">
              Unsaid
            </h1>
          </div>

          <div className="text-xs font-bold text-aura-300 uppercase tracking-widest">
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </div>
        </header>

        <main className="fade-in">{children}</main>
      </div>

      {/* ✅ Bottom Floating Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-[2.5rem] px-6 py-3 flex justify-between items-center z-50">
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => onViewChange(item.view)}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${
              activeView === item.view
                ? "text-aura-700 scale-110"
                : "text-aura-300 hover:text-aura-500 hover:scale-105"
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-bold tracking-tighter">
              {item.label}
            </span>

            {activeView === item.view && (
              <div className="w-1 h-1 rounded-full bg-aura-600 mt-0.5" />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
