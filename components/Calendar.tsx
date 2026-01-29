import { decryptText } from "../crypto";
import { useEffect } from "react";
import React, { useMemo, useState } from "react";
import { Entry } from "../types";

interface CalendarProps {
  entries: Entry[];
}

const Calendar: React.FC<CalendarProps> = ({ entries }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  // ✅ helper: YYYY-MM-DD
  const dayKey = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const monthName = new Date(currentYear, currentMonth).toLocaleString(
    undefined,
    { month: "long" }
  );

  // ✅ Map entries by day
  const entriesByDay = useMemo(() => {
    const map: Record<string, Entry[]> = {};
    entries.forEach((e) => {
      const key = dayKey(new Date(e.timestamp));
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });
    return map;
  }, [entries]);

  // ✅ Calendar grid
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);

  const startWeekday = firstDay.getDay(); // 0 Sun
  const daysInMonth = lastDay.getDate();

  const daysArray = Array.from({ length: startWeekday }, () => null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );

  // ✅ selected day
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const selectedEntries = selectedDay ? entriesByDay[selectedDay] || [] : [];

  const goPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((p) => p - 1);
    } else {
      setCurrentMonth((p) => p - 1);
    }
    setSelectedDay(null);
  };

  const goNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((p) => p + 1);
    } else {
      setCurrentMonth((p) => p + 1);
    }
    setSelectedDay(null);
  };

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const DecryptedText: React.FC<{ text: string }> = ({ text }) => {
  const [decoded, setDecoded] = useState("Decrypting...");

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        // If plain text (old entries)
        if (!text.includes(":")) {
          if (mounted) setDecoded(text);
          return;
        }

        const plain = await decryptText(text);
        if (mounted) setDecoded(plain);
      } catch (e) {
        console.error(e);
        if (mounted) setDecoded("⚠️ Could not decrypt entry");
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [text]);

  return (
    <p className="text-aura-900 font-serif text-base leading-relaxed whitespace-pre-wrap">
      {decoded}
    </p>
  );
};


  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="bg-white rounded-[2.5rem] p-7 border border-aura-100 shadow-sm">
        <div className="flex items-center justify-between">
          <button
            onClick={goPrevMonth}
            className="w-10 h-10 rounded-2xl bg-aura-50 border border-aura-100 text-aura-700 font-bold hover:bg-aura-100 transition-all"
          >
            ‹
          </button>

          <div className="text-center">
            <h2 className="text-2xl font-serif text-aura-900 italic">
              {monthName} {currentYear}
            </h2>
            <p className="text-aura-400 text-sm">
              Tap a day to see your entries 💙
            </p>
          </div>

          <button
            onClick={goNextMonth}
            className="w-10 h-10 rounded-2xl bg-aura-50 border border-aura-100 text-aura-700 font-bold hover:bg-aura-100 transition-all"
          >
            ›
          </button>
        </div>

        {/* Weekdays */}
        <div className="grid grid-cols-7 gap-2 mt-6 text-[10px] font-bold text-aura-400 uppercase tracking-widest">
          {weekdays.map((w) => (
            <div key={w} className="text-center">
              {w}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-2 mt-3">
          {daysArray.map((day, idx) => {
            if (!day) return <div key={idx} />;

            const dateObj = new Date(currentYear, currentMonth, day);
            const key = dayKey(dateObj);
            const hasEntries = !!entriesByDay[key];
            const isToday = key === dayKey(new Date());
            const isSelected = selectedDay === key;

            return (
              <button
                key={idx}
                onClick={() => setSelectedDay(key)}
                className={`h-12 rounded-2xl border text-sm font-bold transition-all ${
                  isSelected
                    ? "bg-aura-800 text-white border-aura-800"
                    : "bg-white border-aura-100 text-aura-700 hover:bg-aura-50"
                }`}
              >
                <div className="flex flex-col items-center justify-center">
                  <span className={`${isToday ? "underline" : ""}`}>{day}</span>
                  {hasEntries && (
                    <span
                      className={`mt-1 w-2 h-2 rounded-full ${
                        isSelected ? "bg-white" : "bg-aura-600"
                      }`}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Entries */}
      <div className="bg-white rounded-[2.5rem] p-7 border border-aura-100 shadow-sm">
        <h3 className="text-xl font-serif italic text-aura-900">
          {selectedDay ? `Entries on ${selectedDay}` : "Select a day"}
        </h3>

        {!selectedDay ? (
          <p className="text-aura-400 text-sm mt-2">
            Your calendar becomes your story timeline ✨
          </p>
        ) : selectedEntries.length === 0 ? (
          <p className="text-aura-400 text-sm mt-2">
            No entries saved on this day.
          </p>
        ) : (
          <div className="space-y-4 mt-5">
            {selectedEntries
              .sort((a, b) => b.timestamp - a.timestamp)
              .map((entry) => (
                <div
                  key={entry.id}
                  className="p-5 rounded-[2rem] border border-aura-100 bg-aura-50/20"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-aura-400">
                      {entry.type}
                    </span>
                    <span className="text-[10px] text-aura-300 font-bold">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <DecryptedText text={entry.content} />


                  {entry.emotions && entry.emotions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {entry.emotions.map((em) => (
                        <span
                          key={em}
                          className="px-3 py-1 rounded-full text-[10px] font-bold bg-white text-aura-700 border border-aura-100"
                        >
                          {em}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;
