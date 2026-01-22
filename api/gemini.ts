import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text, history } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "No text provided" });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY in environment variables" });
    }

    // ✅ Best stable model for free tier usage
    const MODEL = "gemini-1.5-flash";

    const contents = [
      ...(Array.isArray(history)
        ? history.map((m: any) => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: String(m.text || "") }],
          }))
        : []),
      { role: "user", parts: [{ text }] },
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 250,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.log("❌ Gemini error body:", data);
      return res.status(500).json({
        error: "Gemini API error",
        details: data,
      });
    }

    const aiText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "I’m here with you. Tell me what’s been feeling heavy lately.";

    return res.status(200).json({ reply: aiText });
  } catch (err: any) {
    console.log("❌ Server error:", err?.message || err);
    return res.status(500).json({ error: "Server crashed", details: String(err?.message || err) });
  }
}

