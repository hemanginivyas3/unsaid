import { auth } from "../firebase";
import React, { useState, useEffect, useRef } from 'react';
import { EmotionType, Entry } from '../types';
import { getEmpatheticResponse } from '../services/geminiService';
import { saveEmotionEntry } from "../firestoreService";

interface ListenerProps {
  onSave: (entry: Partial<Entry>) => void;
  onClose: () => void;
}

const Listener: React.FC<ListenerProps> = ({ onSave, onClose }) => {
  const [text, setText] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mode, setMode] = useState<'listen-respond' | 'just-listen'>('listen-respond');
  const [showEmotions, setShowEmotions] = useState(false);
  const [selectedEmotions, setSelectedEmotions] = useState<EmotionType[]>([]);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) textareaRef.current.focus();
  }, []);

  const handleFinish = async () => {
    if (!text.trim()) return;
    if (mode === 'listen-respond') {
      setIsTyping(true);
      const res = await getEmpatheticResponse(text);
      console.log("✅ Saving emotion entry...");
      console.log("TEXT:", text);
      console.log("AI:", res);

      await saveEmotionEntry({
       userId: auth.currentUser?.uid || "unknown",
       userText: text,
       aiReply: res,
      });

      console.log("✅ Saved to Firestore!");

      
      setResponse(res);
      setIsTyping(false);
      setShowEmotions(true);
    } else {
      setResponse("Thank you for sharing that with me. Your words are safe.");
      setShowEmotions(true);
    }
  };

  const toggleEmotion = (emotion: EmotionType) => {
    setSelectedEmotions(prev => 
      prev.includes(emotion) ? prev.filter(e => e !== emotion) : [...prev, emotion]
    );
  };

  if (showEmotions) {
    return (
      <div className="flex-1 flex flex-col justify-center fade-in max-w-lg mx-auto w-full">
        {response && (
          <div className="mb-10 p-8 bg-white rounded-[2.5rem] text-aura-900 font-serif text-xl leading-relaxed italic border border-aura-100 shadow-xl relative">
             <div className="absolute top-0 left-8 -translate-y-1/2 bg-aura-800 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Unsaid's Thought</div>
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
                  selectedEmotions.includes(emotion) ? 'bg-aura-800 border-aura-800 text-white' : 'bg-white border-aura-100 text-aura-600'
                }`}
              >
                {emotion}
              </button>
            ))}
          </div>
          <div className="pt-6 flex flex-col gap-3">
            <button
              onClick={() => { onSave({ content: text, type: 'reflection', emotions: selectedEmotions }); onClose(); }}
              className="px-10 py-4 bg-aura-800 text-white rounded-2xl font-bold shadow-lg"
            >
              Seal reflection
            </button>
            <button onClick={onClose} className="text-aura-300 font-medium">Discard session</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col fade-in">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-serif text-aura-900 italic">Deep Reflection</h2>
        <div className="flex bg-aura-100/50 p-1 rounded-xl">
          <button onClick={() => setMode('listen-respond')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === 'listen-respond' ? 'bg-white text-aura-800 shadow-sm' : 'text-aura-400'}`}>Reflect</button>
          <button onClick={() => setMode('just-listen')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === 'just-listen' ? 'bg-white text-aura-800 shadow-sm' : 'text-aura-400'}`}>Vent</button>
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
        
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setIsRecording(!isRecording)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-400 animate-pulse text-white' : 'bg-aura-50 text-aura-400 hover:text-aura-600'}`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
          </button>
          <button
            onClick={handleFinish}
            disabled={!text.trim() || isTyping}
            className="px-8 py-3 bg-aura-800 text-white rounded-2xl font-bold shadow-lg disabled:opacity-30"
          >
            {isTyping ? 'Thinking...' : 'Finish'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Listener;
