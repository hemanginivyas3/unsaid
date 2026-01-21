
import React from 'react';
import { Entry } from '../types';

interface DiaryProps {
  entries: Entry[];
}

const Diary: React.FC<DiaryProps> = ({ entries }) => {
  const sortedEntries = [...entries].sort((a, b) => b.timestamp - a.timestamp);

  if (sortedEntries.length === 0) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center text-center fade-in py-20">
        <div className="w-20 h-20 bg-aura-50 rounded-[2rem] flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-aura-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h2 className="text-2xl font-serif text-aura-800 mb-2 italic">A quiet beginning</h2>
        <p className="text-aura-400 max-w-xs leading-relaxed">Your future reflections will be safely stored here for when you wish to revisit them.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 fade-in">
      <h2 className="text-3xl font-serif text-aura-800 mb-10 italic">Past Reflections</h2>
      <div className="space-y-10">
        {sortedEntries.map((entry) => (
          <div key={entry.id} className="group">
            <div className="flex items-start gap-6">
              <div className="pt-2 text-aura-200 text-xs font-bold uppercase tracking-[0.2em] whitespace-nowrap w-24">
                {new Date(entry.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </div>
              <div className="flex-1 bg-white p-8 rounded-[2rem] border border-aura-50 group-hover:border-aura-200 transition-all shadow-sm hover:shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-lg text-[10px] uppercase font-bold tracking-widest ${
                    entry.type === 'letter' ? 'bg-amber-50 text-amber-700' : 'bg-aura-50 text-aura-700'
                  }`}>
                    {entry.type}
                  </span>
                  <span className="text-xs text-aura-200 font-medium">
                    {new Date(entry.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-aura-900 font-serif leading-relaxed text-lg line-clamp-4 group-hover:line-clamp-none transition-all duration-500 whitespace-pre-wrap">
                  {entry.content}
                </p>
                {entry.emotions && entry.emotions.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {entry.emotions.map(emotion => (
                      <span key={emotion} className="text-[10px] bg-aura-50 text-aura-600 px-3 py-1 rounded-full border border-aura-100 font-medium">
                        {emotion}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Diary;
