
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from '../types';

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'I\'m here if you want to talk. How has your day truly been?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      // We pass the conversation history for a truly "human" context
      const history = messages.map(m => `${m.role === 'user' ? 'User' : 'Unsaid'}: ${m.text}`).join('\n');
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `${history}\nUser: ${userMsg}\nUnsaid:`,
        config: {
          systemInstruction: "You are Unsaid, a gentle, human-like companion. Engage in a natural, flowing conversation. Don't be formal. Use empathy, ask gentle follow-up questions, and avoid bullet points. Keep it warm and concise.",
          temperature: 0.9,
        }
      });

      setMessages(prev => [...prev, { role: 'model', text: response.text || 'I hear you. Tell me more about that.' }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: "I'm having a quiet moment, but I'm still listening." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[70vh] bg-white rounded-[2.5rem] border border-aura-100 shadow-sm overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-5 py-3 rounded-2xl font-serif text-lg leading-relaxed ${
              m.role === 'user' 
                ? 'bg-aura-800 text-white rounded-tr-none' 
                : 'bg-aura-50 text-aura-900 rounded-tl-none border border-aura-100'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-aura-50 px-5 py-3 rounded-2xl rounded-tl-none flex gap-1 items-center">
              <div className="w-1.5 h-1.5 bg-aura-300 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-aura-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-aura-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 bg-aura-50/50 border-t border-aura-100">
        <div className="flex gap-2 bg-white rounded-2xl border border-aura-200 p-2 focus-within:ring-2 ring-aura-200 transition-all">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 bg-transparent outline-none font-serif text-aura-900 text-lg"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-10 h-10 bg-aura-800 text-white rounded-xl flex items-center justify-center disabled:opacity-30 hover:bg-aura-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
