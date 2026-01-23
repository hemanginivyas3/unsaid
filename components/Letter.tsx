import React, { useEffect, useRef, useState } from "react";
import { Entry } from "../types";

interface LetterProps {
  onSave: (entry: Partial<Entry>) => void;
  onClose: () => void;
}

const Letter: React.FC<LetterProps> = ({ onSave, onClose }) => {
  const [to, setTo] = useState(""); // ✅ NEW
  const [text, setText] = useState("");
  const [burning, setBurning] = useState(false);
  const [burnDone, setBurnDone] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSaveLetter = () => {
    if (!text.trim()) return;

    const formattedLetter = `To: ${to.trim() || "Someone"}\n\n${text}`;

    onSave({
      content: formattedLetter,
      type: "letter",
      emotions: [],
    });

    onClose();
  };

  const handleBurnLetter = async () => {
    if (!text.trim()) return;

    setBurning(true);

    // 🔥 small dramatic burn delay
    setTimeout(() => {
      setBurnDone(true);
      setText("");
      setTo(""); // ✅ clear To also
    }, 1800);

    // close after burn
    setTimeout(() => {
      setBurning(false);
      setBurnDone(false);
      onClose();
    }, 2600);
  };

  return (
    <div className="flex-1 flex flex-col fade-in">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-serif text-aura-900 italic">
          Secret Letter
        </h2>

        <button
          onClick={onClose}
          className="text-aura-400 font-bold text-sm hover:text-aura-700 transition-all"
        >
          Close
        </button>
      </div>

      <div className="flex-1 relative flex flex-col bg-white rounded-[2.5rem] p-8 border border-aura-100 shadow-inner overflow-hidden">
        {/* ✅ Burn overlay */}
        {burning && (
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-20">
            <div className="bg-white rounded-[2.5rem] p-8 border border-aura-100 shadow-xl text-center max-w-sm mx-auto">
              {!burnDone ? (
                <>
                  <div className="text-4xl mb-2">🔥</div>
                  <p className="text-aura-900 font-serif text-xl italic">
                    Burning your letter...
                  </p>
                  <p className="text-aura-400 text-sm mt-2">
                    Let it go. You don’t need to carry it.
                  </p>
                </>
              ) : (
                <>
                  <div className="text-4xl mb-2">✨</div>
                  <p className="text-aura-900 font-serif text-xl italic">
                    It’s gone.
                  </p>
                  <p className="text-aura-400 text-sm mt-2">
                    You’re lighter now.
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* ✅ NEW: "To" field */}
        <input
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="To (optional)..."
          className="w-full mb-4 px-4 py-3 rounded-2xl border border-aura-100 bg-aura-50/30 outline-none font-serif text-aura-900 placeholder-aura-300 focus:ring-2 ring-aura-200"
        />

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write what you can’t say out loud..."
          className="w-full flex-1 bg-transparent text-xl text-aura-900 placeholder-aura-200 focus:outline-none resize-none font-serif leading-relaxed"
        />

        <div className="flex gap-3 mt-4">
          {/* ✅ Save */}
          <button
            onClick={handleSaveLetter}
            disabled={!text.trim() || burning}
            className="flex-1 px-6 py-4 bg-aura-800 text-white rounded-2xl font-bold shadow-lg disabled:opacity-30 hover:bg-aura-900 transition-all"
          >
            Seal & Save 💙
          </button>

          {/* ✅ Burn */}
          <button
            onClick={handleBurnLetter}
            disabled={!text.trim() || burning}
            className="flex-1 px-6 py-4 bg-white text-aura-800 rounded-2xl font-bold shadow-lg border border-aura-200 disabled:opacity-30 hover:bg-aura-50 transition-all"
          >
            Burn 🔥
          </button>
        </div>

        <p className="text-center text-aura-300 text-xs font-bold mt-4 uppercase tracking-widest">
          Your words stay yours.
        </p>
      </div>
    </div>
  );
};

export default Letter;
