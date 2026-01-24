export const DAILY_PROMPTS: string[] = [
  "What’s one thing you’re proud of today, even if it’s small?",
  "What are you avoiding right now—and why?",
  "If your heart could speak, what would it ask for?",
  "What did you need today but didn’t receive?",
  "What is one thought you want to release tonight?",
  "Describe your day in 3 words. Now explain why.",
  "What is something you wish someone understood about you?",
  "What did you do today that was brave?",
  "What made you feel calm today?",
  "Write a letter to your future self (just 2 lines).",
  "What is one emotion you are carrying silently?",
  "What is one thing you can forgive yourself for today?",
  "What are you grateful for, but you rarely say out loud?",
  "If today had a color, what would it be and why?",
  "What do you need more of in your life right now?",
];

export function getDailyPrompt(): { prompt: string; index: number } {
  const today = new Date();
  const key = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

  // deterministic index for the day
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) % 1000000;
  }

  const index = hash % DAILY_PROMPTS.length;
  return { prompt: DAILY_PROMPTS[index], index };
}
