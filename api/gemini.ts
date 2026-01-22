import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text } = req.body as { text?: string };

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "No text provided" });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      return res
        .status(500)
        .json({ error: "GEMINI_API_KEY missing in Vercel env" });
    }

    console.log("✅ API HIT /api/gemini");
    console.log("✅ Using model: gemini-pro");

    const prompt = `
You are Unsaid, a calm, kind, human-like companion.
Reply naturally and helpfully in 2-5 lines.
Avoid repeating the same phrase.
Always give a helpful answer + 1 gentle follow-up question.

User message: ${text}
`;

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

    if (!response.ok) {
      console.log("❌ Gemini Error:", JSON.stringify(data));
      return res.status(500).json({ error: "Gemini error", details: data });
    }

    const aiText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "I’m here with you 💙 What do you want to do next — relax or fix the boredom?";

    return res.status(200).json({ reply: aiText });
  } catch (error) {
    console.error("❌ api/gemini.ts error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
