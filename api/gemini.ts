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

    // ✅ MOST COMPATIBLE MODEL (works for most keys)
    const MODEL = "gemini-1.0-pro";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.log("❌ Gemini Error Body:", JSON.stringify(data));
      return res.status(500).json({
        error: data?.error?.message || "Gemini API failed",
      });
    }

    const aiText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "I’m here with you. Tell me more.";

    return res.status(200).json({ reply: aiText });
  } catch (err) {
    console.error("❌ Server crash:", err);
    return res.status(500).json({ error: "Server crashed" });
  }
}
