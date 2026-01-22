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
      return res.status(500).json({ error: "Missing GEMINI_API_KEY in Vercel" });
    }

    // ✅ Using Gemini v1beta + gemini-1.5-flash (correct)
    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
      GEMINI_API_KEY;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text }] }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 250,
        },
      }),
    });

    const data = await response.json();

    // ✅ If Google returns an error, show it properly
    if (!response.ok) {
      console.log("Gemini Error:", data);
      return res.status(500).json({
        error: "Gemini API error",
        details: data,
      });
    }

    const aiText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I’m here with you 💙 Tell me a little more.";

    return res.status(200).json({ reply: aiText });
  } catch (err: any) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
}

