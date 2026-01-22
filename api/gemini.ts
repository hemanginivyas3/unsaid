import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "No text provided" });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
    }

    // ✅ USE A MODEL THAT YOUR KEY ACTUALLY SUPPORTS
    const MODEL = "gemini-2.0-flash";

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text }],
          },
        ],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 300,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Gemini error body:", data);
      return res.status(500).json({
        error: "Gemini API error",
        details: data,
      });
    }

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I’m here with you. Tell me more.";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("❌ Server error:", err);
    return res.status(500).json({ error: "Server crashed" });
  }
}
