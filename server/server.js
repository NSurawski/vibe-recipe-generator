import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import Anthropic from "@anthropic-ai/sdk";

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const recipeRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests — please wait a moment before trying again." },
});

app.use("/api/recipe", recipeRateLimit);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const RECIPE_PROMPT = `You are a creative chef who generates unique recipes based on vibes and moods. The user will describe a vibe, mood, or feeling, along with optional preferences, and you'll create a recipe that perfectly matches.

Return ONLY valid JSON matching this exact schema:
{
  "title": "string — creative, evocative recipe name",
  "description": "string — 1-2 sentences capturing how this recipe matches the vibe",
  "ingredients": [
    { "item": "string", "amount": "string", "note": "string (optional)" }
  ],
  "steps": ["string — each step as a clear instruction"],
  "time": "string — total time estimate (e.g. '30 min')",
  "difficulty": "string — Easy, Medium, or Hard",
  "servings": "string — e.g. '2 servings'",
  "tags": ["string — 2-4 short tags like the vibe, diet, or key characteristic"],
  "vibe_notes": "string — a playful note about why this recipe fits the vibe"
}

Be creative and specific. The recipe should feel intentional — not generic. If someone says "chaotic brunch energy", don't give them plain pancakes. Give them something that feels chaotic and brunch-y. Honor any dietary or time preferences provided.`;

app.post("/api/recipe", async (req, res) => {
  const { vibe, preferences } = req.body;

  if (!vibe || typeof vibe !== "string" || vibe.trim().length === 0) {
    return res.status(400).json({ error: "Please provide a vibe description" });
  }

  if (vibe.length > 500) {
    return res.status(400).json({ error: "Vibe description is too long (max 500 characters)" });
  }

  const prefParts = [];
  if (preferences?.diet?.length > 0) prefParts.push(`Dietary: ${preferences.diet.join(", ")}`);
  if (preferences?.time) prefParts.push(`Time: ${preferences.time}`);
  if (preferences?.skill) prefParts.push(`Skill level: ${preferences.skill}`);
  const prefString = prefParts.length > 0 ? `\nPreferences: ${prefParts.join(" | ")}` : "";

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Generate a recipe for this vibe: "${vibe.trim()}"${prefString}`,
        },
      ],
      system: RECIPE_PROMPT,
    });

    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    console.error("Recipe generation failed:", err.message);

    let errorMessage = "Failed to generate recipe. Please try again.";
    if (err.status === 401) errorMessage = "Invalid API key";
    else if (err.status === 429) errorMessage = "Rate limited — try again in a moment";

    res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
    res.end();
  }
});

export { app };

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Vibe Recipe Server running on http://localhost:${port}`);
  });
}
