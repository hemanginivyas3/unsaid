import React, { useState, useEffect, useRef } from "react";
import { EmotionType, Entry } from "../types";
import { getEmpatheticResponse } from "../services/geminiService";
import { saveEmotionEntry } from "../firestoreService";

import { auth } from "../firebase";
import { canUseGemini, incrementGeminiUsage } from "../usageService";

interface ListenerProps {
  onSave: (entry: Partial<Entry>) => void;
  onClose: () => void;
}

const Listener: React.FC<ListenerProps> = ({ onSave, onClose }) => {
  const [text, setText] = useState("");
  const [response, setResponse] = useState<string | null>(null);

  const [isTyping, setIsTyping] = useState(false);

  // ✅ Mic
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const [mode, setMode] = useState<"listen-respond" | "just-listen">("listen-respond");

  const [showEmotions, setShowEmotions] = useState(false);
  const [selectedEmotions, setSelectedEmotions] = useState<EmotionType[]>([]);

  // ✅ Anti-spam states
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [infoMsg, setInfoMsg] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) textareaRef.current.focus();
  }, []);

  // ✅ Setup Speech Recognition once
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("SpeechRecognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setText(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Mic error:", event);
      setInfoMsg("⚠️ Microphone error. Please allow mic permission in browser settings.");
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const toggleEmotion = (emotion: EmotionType) => {
    setSelectedEmotions((prev) =>
      prev.includes(emotion) ? prev.filter((e) => e !== emotion) : [...prev, emotion]
    );
  };

  const toggleMic = async () => {
    if (!recognitionRef.current) {
      setInfoMsg("⚠️ Your browser does not support mic input. Use Chrome.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      return;
    }

    try {
      // ✅ force permission request
      await navigator.mediaDevices.getUserMedia({ audio: true });

      setInfoMsg("");
      recognitionRef.current.start();
      setIsRecording(true);
    } catch (e) {
      console.error(e);
      setInfoMsg("⚠️ Mic permission blocked. Please allow mic in Chrome settings.");
      setIsRecording(false);
    }
  };

  const handleFinish = async () => {
    if (!text.trim()) return;

    if (loading) return;

    if (cooldown) {
      setInfoMsg("Please wait a few seconds before sending again 🙂");
      return;
    }

    setCooldown(true);
    setTimeout(() => setCooldown(false), 8000);

    const uid = auth.currentUser?.uid;
    if (!uid) {
      setInfoMsg("Please login again.");
      return;
    }

    // stop mic if running
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    if (mode === "listen-respond") {
      const usage = await canUseGemini(uid);

      if (!usage.allowed) {
        setInfoMsg("Daily limit reached 💙 Please come back tomorrow.");
        return;
      }

      try {
        setLoading(true);
        setIsTyping(true);

        const res = await getEmpatheticResponse(text);

        await incrementGeminiUsage(uid);

        await saveEmotionEntry({
          userId: uid,
          userText: text,
          aiReply: res,
        });

        setResponse(res);
        setShowEmotions(true);

        setInfoMsg(`✅ Saved. You have ${Math.max(usage.remaining - 1, 0)} messages left today.`);
      } catch (e) {
        console.error(e);
        setInfoMsg("❌ Something went wrong. Please try again.");
      } finally {
        setLoading(false);
        setIsTyping(false);
      }
    } else {
      setResponse("Thank you for sharing that with me. Your words are safe.");
      setShowEmotions(true);
      setInfoMsg("");
    }
  };

  // ✅ Emotion label screen
  if (showEmotions) {
    return (
      <div className="flex-1 flex flex-col justify-center fade-in max-w-lg mx-auto w-full">
        {response && (
          <div className="mb-10 p-8 bg-white rounded-[2.5rem] text-aura-900 font-serif text-xl leading-relaxed italic border border-aura-100 shadow-xl relative">
            <div className="absolute top-0 left-8 -translate-y-1/2 bg-aura-800 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
              Unsaid&apos;s Thought
            </div>
            "{response}"
          </div>
        )}

        <div className="text-center space-y-6">
          <p className="text-aura-800 font-serif text-lg">Label your feelings to release them.</p>

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
                onSave({ content: text, type: "reflection", emotions: selectedEmotions });
                onClose();
              }}
              className="px-10 py-4 bg-aura-800 text-white rounded-2xl font-bold shadow-lg"
            >
              Seal reflection
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
        <h2 className="text-3xl font-serif text-aura-900 italic">Deep Reflection</h2>

        <div className="flex bg-aura-100/50 p-1 rounded-xl">
          <button
            onClick={() => setMode("listen-respond")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === "listen-respond"
                ? "bg-white text-aura-800 shadow-sm"
                : "text-aura-400"
            }`}
          >
            Reflect
          </button>

          <button
            onClick={() => setMode("just-listen")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === "just-listen" ? "bg-white text-aura-800 shadow-sm" : "text-aura-400"
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
          placeholder="Speak your truth..."
          className="w-full flex-1 bg-transparent text-xl text-aura-900 placeholder-aura-200 focus:outline-none resize-none font-serif leading-relaxed"
        />

        {infoMsg && <p className="mt-3 text-sm text-aura-500 text-center">{infoMsg}</p>}

        <div className="flex items-center justify-between mt-4">
          <button
            onClick={toggleMic}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isRecording
                ? "bg-red-400 animate-pulse text-white"
                : "bg-aura-50 text-aura-400 hover:text-aura-600"
            }`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            disabled={!text.trim() || isTyping || loading}
            className="px-8 py-3 bg-aura-800 text-white rounded-2xl font-bold shadow-lg disabled:opacity-30"
          >
            {isTyping || loading ? "Thinking..." : "Finish"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Listener;
