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

    // ✅ System instruction to avoid repetition & be helpful
    const systemInstruction = `
You are Unsaid, a calm, warm, human-like emotional support companion.
Rules:
- DO NOT repeat the same line again and again.
- Give helpful, personalized responses.
- Ask 1 gentle question at the end (not always "tell me more").
- Keep responses under 80 words.
- No bullet points.
`;

    // ✅ Convert history into Gemini format
    const safeHistory = Array.isArray(history) ? history.slice(-10) : [];

    const contents = [
      {
        role: "user",
        parts: [{ text: systemInstruction }],
      },
      ...safeHistory.map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      })),
      {
        role: "user",
        parts: [{ text }],
      },
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 180,
          },
        }),
      }
    );

    const data = await response.json();

    // ✅ If Gemini fails, show error in logs
    if (!response.ok) {
      console.log("❌ Gemini API error status:", response.status);
      console.log("❌ Gemini API error body:", JSON.stringify(data));
      return res.status(500).json({
        error: "Gemini API error",
        details: data,
      });
    }

    let aiText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "I’m here with you 💙 What happened exactly?";

    // ✅ Safety: avoid repeating same generic text
    if (aiText.toLowerCase().includes("tell me more")) {
      aiText =
        "That sounds painful 💙 Rejection can hit really hard. Do you want comfort right now, or do you want practical advice on what to do next?";
    }

    return res.status(200).json({ reply: aiText });
  } catch (error) {
    console.error("api/gemini.ts error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
