import React, { useState, useEffect, useRef } from "react";
import { ChatMessage } from "../types";

import { auth } from "../firebase";
import { canUseGemini, incrementGeminiUsage } from "../usageService";

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "model", text: "I’m here with you 💙 Take your time. What’s been on your mind today?" },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Anti-spam
  const [cooldown, setCooldown] = useState(false);
  const [infoMsg, setInfoMsg] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const buildHistory = () => {
    // ✅ last 8 messages only (good for cost + context)
    return messages.slice(-8).map((m) => ({
      role: m.role === "user" ? "user" : "model",
      text: m.text,
    }));
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    if (isLoading) return;

    if (cooldown) {
      setInfoMsg("Please wait a few seconds before sending again 🙂");
      return;
    }

    setCooldown(true);
    setTimeout(() => setCooldown(false), 4000);

    const uid = auth.currentUser?.uid;
    if (!uid) {
      setInfoMsg("Please login again.");
      return;
    }

    const usage = await canUseGemini(uid);
    if (!usage.allowed) {
      setInfoMsg("Daily limit reached 💙 Please come back tomorrow.");
      return;
    }

    const userMsg = input.trim();
    setInput("");

    const newMessages: ChatMessage[] = [...messages, { role: "user", text: userMsg }];
    setMessages(newMessages);

    setIsLoading(true);
    setInfoMsg("");

    try {
      // ✅ send text + history
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: userMsg,
          history: buildHistory(),
        }),
      });

      const data = await res.json();
      const aiText = data?.reply || "I’m here with you 💙 Want comfort or a solution right now?";

      await incrementGeminiUsage(uid);

      setMessages((prev) => [...prev, { role: "model", text: aiText }]);

      setInfoMsg(`✅ You have ${Math.max(usage.remaining - 1, 0)} messages left today.`);
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "I’m having a quiet moment, but I’m still here with you 💙",
        },
      ]);
      setInfoMsg("❌ Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[70vh] bg-white rounded-[2.5rem] border border-aura-100 shadow-sm overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] px-5 py-3 rounded-2xl font-serif text-lg leading-relaxed ${
                m.role === "user"
                  ? "bg-aura-800 text-white rounded-tr-none"
                  : "bg-aura-50 text-aura-900 rounded-tl-none border border-aura-100"
              }`}
            >
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
        {infoMsg && <p className="text-center text-sm text-aura-500 mb-2">{infoMsg}</p>}

        <div className="flex gap-2 bg-white rounded-2xl border border-aura-200 p-2 focus-within:ring-2 ring-aura-200 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 bg-transparent outline-none font-serif text-aura-900 text-lg"
          />

          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 bg-aura-800 text-white rounded-xl flex items-center justify-center disabled:opacity-30 hover:bg-aura-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
