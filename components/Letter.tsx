
import React, { useState } from 'react';
import { Entry } from '../types';

interface LetterProps {
  onSave: (entry: Partial<Entry>) => void;
  onClose: () => void;
}

const Letter: React.FC<LetterProps> = ({ onSave, onClose }) => {
  const [recipient, setRecipient] = useState('');
  const [content, setContent] = useState('');

  const handleSave = () => {
    if (!content.trim()) return;
    onSave({
      content: `To: ${recipient || 'Unknown'}\n\n${content}`,
      type: 'letter',
      timestamp: Date.now()
    });
    onClose();
  };

  return (
    <div className="flex-1 flex flex-col fade-in">
      <div className="mb-8 space-y-3">
        <h2 className="text-3xl font-serif text-aura-800 italic">Unsent Letter</h2>
        <p className="text-aura-500 leading-relaxed max-w-lg">Release the words you've been holding. Whether for someone else or your own heart, these are your secrets.</p>
      </div>

      <div className="flex-1 bg-white rounded-[2.5rem] p-10 border border-aura-100 shadow-sm flex flex-col">
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="To whom..."
          className="w-full mb-8 py-3 border-b border-aura-50 text-aura-800 font-serif text-xl focus:outline-none focus:border-aura-300 bg-transparent placeholder-aura-100"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="I've been meaning to say..."
          className="w-full flex-1 resize-none bg-transparent focus:outline-none font-serif text-aura-900 leading-relaxed text-xl placeholder-aura-100"
        />
      </div>

      <div className="mt-8 flex justify-end items-center gap-6">
        <button
          onClick={onClose}
          className="px-6 py-3 text-aura-400 hover:text-aura-600 font-medium transition-colors"
        >
          Discard
        </button>
        <button
          onClick={handleSave}
          disabled={!content.trim()}
          className={`px-12 py-4 rounded-2xl bg-aura-800 text-white font-bold shadow-xl transition-all ${
            !content.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-aura-900 active:scale-95'
          }`}
        >
          Release & Save
        </button>
      </div>
    </div>
  );
};

export default Letter;
