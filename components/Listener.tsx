import React, { useEffect, useRef, useState } from "react";
import { EmotionType, Entry } from "../types";
import { saveEmotionEntry } from "../firestoreService";
import { auth } from "../firebase";

interface ListenerProps {
  onSave: (entry: Partial<Entry>) => void;
  onClose: () => void;
}

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

const Listener: React.FC<ListenerProps> = ({ onSave, onClose }) => {
  const [text, setText] = useState("");
  const [showEmotions, setShowEmotions] = useState(false);
  const [selectedEmotions, setSelectedEmotions] = useState<EmotionType[]>([]);
  const [mode, setMode] = useState<"reflection" | "vent">("reflection");

  // ✅ mic states
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // ✅ UI message
  const [infoMsg, setInfoMsg] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) textareaRef.current.focus();
  }, []);

  // ✅ Setup Speech Recognition once
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setInfoMsg("🎙️ Voice typing not supported on this browser (try Chrome).");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      // ✅ Update text smoothly
      setText((prev) => prev + finalTranscript);

      // ✅ show interim (optional)
      if (interimTranscript.trim()) {
        setInfoMsg("🎙️ Listening...");
      }
    };

    recognition.onerror = (e: any) => {
      console.error("Mic error:", e);
      setInfoMsg("❌ Mic issue. Please allow microphone permission.");
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setInfoMsg("");
    };

    recognitionRef.current = recognition;
  }, []);

  const toggleRecording = async () => {
    try {
      // ✅ trigger mic permission prompt
      await navigator.mediaDevices.getUserMedia({ audio: true });

      if (!recognitionRef.current) {
        setInfoMsg("🎙️ Voice typing not supported.");
        return;
      }

      if (isRecording) {
        recognitionRef.current.stop();
        setIsRecording(false);
        setInfoMsg("");
      } else {
        recognitionRef.current.start();
        setIsRecording(true);
        setInfoMsg("🎙️ Listening...");
      }
    } catch (err) {
      console.error(err);
      setInfoMsg("❌ Please allow microphone access in browser settings.");
    }
  };

  const toggleEmotion = (emotion: EmotionType) => {
    setSelectedEmotions((prev) =>
      prev.includes(emotion)
        ? prev.filter((e) => e !== emotion)
        : [...prev, emotion]
    );
  };

  const handleFinish = async () => {
    if (!text.trim()) {
      setInfoMsg("Write or speak something first 🙂");
      return;
    }

    const uid = auth.currentUser?.uid;

    if (!uid) {
      setInfoMsg("Please login again.");
      return;
    }

    try {
      await saveEmotionEntry({
       userId: uid,
       userText: text,
       type: mode === "reflection" ? "reflection" : "vent",
       emotions: selectedEmotions,
      });


      setShowEmotions(true);
      setInfoMsg("");
    } catch (e) {
      console.error(e);
      setInfoMsg("❌ Could not save. Please try again.");
    }
  };

  // ✅ Emotion label screen
  if (showEmotions) {
    return (
      <div className="flex-1 flex flex-col justify-center fade-in max-w-lg mx-auto w-full">
        <div className="text-center space-y-6">
          <p className="text-aura-800 font-serif text-lg">
            Label your feelings to release them.
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            {Object.values(EmotionType).map((emotion) => (
              <button
                key={emotion}
                onClick={() => toggleEmotion(emotion)}
                className={`px-4 py-2 rounded-full border text-sm transition-all ${
                  selectedEmotions.includes(emotion)
                    ? "bg-aura-800 border-aura-800 text-white"
                    : "bg-white border-aura-100 text-aura-600"
                }`}
              >
                {emotion}
              </button>
            ))}
          </div>

          <div className="pt-6 flex flex-col gap-3">
            <button
              onClick={() => {
                onSave({
                  content: text,
                  type: mode === "reflection" ? "reflection" : "vent",
                  emotions: selectedEmotions,
                });
                onClose();
              }}
              className="px-10 py-4 bg-aura-800 text-white rounded-2xl font-bold shadow-lg"
            >
              Seal entry
            </button>

            <button onClick={onClose} className="text-aura-300 font-medium">
              Discard session
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Main screen
  return (
    <div className="flex-1 flex flex-col fade-in">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-serif text-aura-900 italic">
          {mode === "reflection" ? "Deep Reflection" : "Just Vent"}
        </h2>

        <div className="flex bg-aura-100/50 p-1 rounded-xl">
          <button
            onClick={() => setMode("reflection")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === "reflection"
                ? "bg-white text-aura-800 shadow-sm"
                : "text-aura-400"
            }`}
          >
            Reflect
          </button>

          <button
            onClick={() => setMode("vent")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === "vent"
                ? "bg-white text-aura-800 shadow-sm"
                : "text-aura-400"
            }`}
          >
            Vent
          </button>
        </div>
      </div>

      <div className="flex-1 relative flex flex-col bg-white rounded-[2.5rem] p-8 border border-aura-100 shadow-inner">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Speak or write your truth..."
          className="w-full flex-1 bg-transparent text-xl text-aura-900 placeholder-aura-200 focus:outline-none resize-none font-serif leading-relaxed"
        />

        {infoMsg && (
          <p className="mt-3 text-sm text-aura-500 text-center">{infoMsg}</p>
        )}

        <div className="flex items-center justify-between mt-4">
          <button
            onClick={toggleRecording}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isRecording
                ? "bg-red-400 animate-pulse text-white"
                : "bg-aura-50 text-aura-400 hover:text-aura-600"
            }`}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </button>

          <button
            onClick={handleFinish}
            disabled={!text.trim()}
            className="px-8 py-3 bg-aura-800 text-white rounded-2xl font-bold shadow-lg disabled:opacity-30"
          >
            Finish
          </button>
        </div>
      </div>
    </div>
  );
};

export default Listener;
