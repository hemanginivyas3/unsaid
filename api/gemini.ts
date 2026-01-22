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
      return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
    }

    // ✅ System instruction to reduce repetition
    const systemInstruction =
      "You are Unsaid, a gentle, warm, human-like companion. Be empathetic, natural, and concise. Avoid repeating the same lines. Ask gentle follow-up questions when helpful.";

    // ✅ Convert chat history into Gemini format
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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 200,
          },
        }),
      }
    );

    const data = await response.json();

    const aiText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I’m here with you. Tell me more.";

    return res.status(200).json({ reply: aiText });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
