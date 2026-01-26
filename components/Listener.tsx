import React, { useEffect, useRef, useState } from "react";
import { EmotionType, Entry } from "../types";
import { auth } from "../firebase";
import { saveEmotionEntry } from "../firestoreService";
import { saveAudioBlob } from "../audioStore";

interface ListenerProps {
  onSave: (entry: Partial<Entry>) => void;
  onClose: () => void;
}

const Listener: React.FC<ListenerProps> = ({ onSave, onClose }) => {
  const [text, setText] = useState("");
  const [showEmotions, setShowEmotions] = useState(false);
  const [selectedEmotions, setSelectedEmotions] = useState<EmotionType[]>([]);
  const [mode, setMode] = useState<"reflection" | "vent">("reflection");

  // ✅ UI message
  const [infoMsg, setInfoMsg] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ✅ Audio recorder states
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioId, setRecordedAudioId] = useState<string | null>(null);
  const [recordedAudioURL, setRecordedAudioURL] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  useEffect(() => {
    if (textareaRef.current) textareaRef.current.focus();
  }, []);

  const toggleEmotion = (emotion: EmotionType) => {
    setSelectedEmotions((prev) =>
      prev.includes(emotion)
        ? prev.filter((e) => e !== emotion)
        : [...prev, emotion]
    );
  };

  // ✅ Start/Stop REAL Audio Recording
  const toggleRecording = async () => {
    try {
      if (isRecording) {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
        return;
      }

      // ✅ Ask mic permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        // stop mic stream
        stream.getTracks().forEach((t) => t.stop());

        const blob = new Blob(chunksRef.current, { type: "audio/webm" });

        // ✅ create local playback URL
        const url = URL.createObjectURL(blob);
        setRecordedAudioURL(url);

        // ✅ Save blob in IndexedDB
        const audioId = "audio-" + Date.now();
        await saveAudioBlob(audioId, blob);
        setRecordedAudioId(audioId);

        setInfoMsg("✅ Voice note saved! You can still write too.");
      };

      recorder.start();
      setIsRecording(true);
      setInfoMsg("🎙️ Recording... tap again to stop.");
    } catch (err) {
      console.error(err);
      setInfoMsg("❌ Please allow microphone permission in your browser.");
    }
  };

  const handleFinish = async () => {
    if (!text.trim() && !recordedAudioId) {
      setInfoMsg("Write something or record a voice note first 🙂");
      return;
    }

    const uid = auth.currentUser?.uid;
    if (!uid) {
      setInfoMsg("Please login again.");
      return;
    }

    try {
      // ✅ Save in Firestore (optional)
      await saveEmotionEntry({
        userId: uid,
        userText: text || "(Voice Note)",
        aiReply: "",
      });

      // ✅ VENT mode → NO emotion tagging screen
      if (mode === "vent") {
        onSave({
          content: text || "(Voice Note)",
          type: "vent",
          emotions: [],
          audioId: recordedAudioId || undefined,
        });

        onClose();
        return;
      }

      // ✅ REFLECTION mode → show emotion screen
      setShowEmotions(true);
      setInfoMsg("");
    } catch (e) {
      console.error(e);
      setInfoMsg("❌ Could not save. Please try again.");
    }
  };

  // ✅ Emotion label screen (ONLY for Reflection)
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
                  content: text || "(Voice Note)",
                  type: "reflection",
                  emotions: selectedEmotions,
                  audioId: recordedAudioId || undefined,
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
          placeholder={
            mode === "vent"
              ? "Let it out. No filters. No judgement..."
              : "Speak or write your truth..."
          }
          className="w-full flex-1 bg-transparent text-xl text-aura-900 placeholder-aura-200 focus:outline-none resize-none font-serif leading-relaxed"
        />

        {infoMsg && (
          <p className="mt-3 text-sm text-aura-500 text-center">{infoMsg}</p>
        )}

        {/* ✅ audio preview */}
        {recordedAudioURL && (
          <div className="mt-4 p-4 rounded-2xl bg-aura-50 border border-aura-100">
            <p className="text-[10px] font-bold text-aura-400 uppercase tracking-widest mb-2">
              Voice Note Preview
            </p>
            <audio controls className="w-full">
              <source src={recordedAudioURL} type="audio/webm" />
            </audio>
          </div>
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
            disabled={!text.trim() && !recordedAudioId}
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
