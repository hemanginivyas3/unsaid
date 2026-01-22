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

    // ✅ FIXED MODEL NAME (works)
    const MODEL = "gemini-1.5-flash";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text }] }],
        }),
      }
    );

    const data = await response.json();

    // ✅ If Google returns an API error, show it
    if (!response.ok) {
      console.log("Gemini API Error Body:", data);
      return res.status(response.status).json({
        error: data?.error?.message || "Gemini API failed",
      });
    }

    const aiText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I’m here with you. Tell me more.";

    return res.status(200).json({ reply: aiText });
  } catch (error) {
    console.error("API crash:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
