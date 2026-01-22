import type { VercelRequest, VercelResponse } from "@vercel/node";

type HistoryMsg = { role: "user" | "model"; text: string };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text, history } = req.body as {
      text?: string;
      history?: HistoryMsg[];
    };

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "No text provided" });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY missing" });
    }

    // ✅ Strong system prompt
    const systemInstruction = `
You are Unsaid — a calm, kind, human-like companion.
Your job is to reply like a real supportive friend.
Rules:
- Never repeat the same sentence.
- Avoid generic replies like "Tell me more" again and again.
- Give short actionable help in 2-4 lines.
- Ask 1 gentle follow-up question.
- Keep it warm and natural.
`;

    // ✅ Prepare safe short history
    const safeHistory = Array.isArray(history) ? history.slice(-8) : [];

    // ✅ Build conversation as ONE prompt string (most reliable)
    const historyText = safeHistory
      .map((m) => `${m.role === "user" ? "User" : "Unsaid"}: ${m.text}`)
      .join("\n");

    const prompt = `${systemInstruction}\n\n${historyText}\nUser: ${text}\nUnsaid:`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 200,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.log("❌ Gemini Status:", response.status);
      console.log("❌ Gemini Body:", JSON.stringify(data));
      return res.status(500).json({ error: "Gemini API error", details: data });
    }

    let aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    // ✅ Hard fallback (but NOT boring)
    if (!aiText || aiText.length < 5) {
      aiText =
        "Okay 💙 If you’re bored, let’s fix it right now: want something relaxing, something productive, or something fun?";
    }

    // ✅ Never allow repeating tell-me-more
    if (aiText.toLowerCase().includes("tell me more")) {
      aiText =
        "I got you 💙 If you’re bored, let’s pick one: 1) mini self-care reset 2) quick fun challenge 3) plan something useful. Which one?";
    }

    return res.status(200).json({ reply: aiText });
  } catch (err) {
    console.error("api/gemini error:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
