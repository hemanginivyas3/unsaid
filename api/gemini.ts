import type { VercelRequest, VercelResponse } from "@vercel/node";

type HistoryMsg = {
  role: "user" | "model";
  text: string;
};

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
      return res.status(500).json({ error: "GEMINI_API_KEY missing in Vercel env" });
    }

    // ✅ Strong system instruction
    const systemInstruction = `
You are Unsaid — a calm, kind, human-like companion.
Reply like a real supportive friend.
Rules:
- Never repeat the same sentence again and again.
- Avoid generic replies like "Tell me more" repeatedly.
- Keep it short (2-5 lines).
- Give helpful, personalized responses.
- Ask 1 gentle follow-up question at the end.
`;

    // ✅ Keep only last 8 messages for history
    const safeHistory = Array.isArray(history) ? history.slice(-8) : [];

    // ✅ Convert history into a single prompt (most reliable)
    const historyText = safeHistory
      .map((m) => `${m.role === "user" ? "User" : "Unsaid"}: ${m.text}`)
      .join("\n");

    const prompt = `${systemInstruction}\n\n${historyText}\nUser: ${text}\nUnsaid:`;

    // ✅ IMPORTANT FIX: using gemini-pro (works, no 404)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

    // ✅ Log errors if Gemini fails
    if (!response.ok) {
      console.log("❌ Gemini Status:", response.status);
      console.log("❌ Gemini Body:", JSON.stringify(data));
      return res.status(500).json({
        error: "Gemini API error",
        details: data,
      });
    }

    let aiText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "I’m here with you 💙 Want comfort right now or a solution?";

    // ✅ Stop repetitive default lines
    if (aiText.toLowerCase().includes("tell me more")) {
      aiText =
        "I got you 💙 If you’re bored, we can fix it right now — want something relaxing, something fun, or something productive?";
    }

    return res.status(200).json({ reply: aiText });
  } catch (error) {
    console.error("api/gemini.ts error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}

