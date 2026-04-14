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
  handler: (req, res, _next, options) => {
    const retryAfter = Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000);
    res.set("Retry-After", retryAfter);
    res.status(options.statusCode).json({
      error: "Too many requests — please wait a moment before trying again.",
      retryAfter,
    });
  },
});

app.use("/api/recipe", recipeRateLimit);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", mode: process.env.ANTHROPIC_API_KEY ? "live" : "demo" });
});

const hasApiKey = !!process.env.ANTHROPIC_API_KEY;
const anthropic = hasApiKey
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const DEMO_RECIPES = [
  {
    title: "Brown Butter Cardamom French Toast",
    description: "Warm, nutty brown butter meets aromatic cardamom in this cozy weekend brunch classic that feels like a hug on a plate.",
    ingredients: [
      { item: "thick-cut brioche", amount: "2 slices" },
      { item: "eggs", amount: "2" },
      { item: "unsalted butter", amount: "3 tbsp", note: "for browning" },
      { item: "ground cardamom", amount: "1/4 tsp" },
      { item: "whole milk", amount: "1/4 cup" },
      { item: "maple syrup", amount: "to serve" },
    ],
    steps: [
      "Melt butter in a skillet over medium heat, swirling until golden brown and nutty — about 3 minutes.",
      "Whisk eggs, milk, cardamom, and vanilla in a shallow bowl.",
      "Dip each brioche slice, soaking 15 seconds per side.",
      "Cook each slice for 3 minutes per side until deeply golden.",
      "Serve drizzled with brown butter and maple syrup.",
    ],
    time: "20 min", difficulty: "Easy", servings: "2 servings",
    tags: ["Cozy", "Brunch", "Vegetarian", "Quick"],
    vibe_notes: "The recipe equivalent of wearing your favorite sweater on a rainy morning.",
  },
  {
    title: "Spicy Mango Coconut Noodles",
    description: "A chaotic, craveable tangle of rice noodles in a sweet-heat mango coconut sauce — messy in the best way.",
    ingredients: [
      { item: "rice noodles", amount: "200g" },
      { item: "coconut milk", amount: "1 can" },
      { item: "ripe mango", amount: "1, diced" },
      { item: "sriracha", amount: "2 tbsp" },
      { item: "lime", amount: "1, juiced" },
      { item: "cilantro", amount: "handful" },
    ],
    steps: [
      "Cook rice noodles according to package, drain and set aside.",
      "Blend half the mango with coconut milk and sriracha until smooth.",
      "Heat the sauce in a pan, toss in noodles, and stir to coat.",
      "Top with remaining diced mango, cilantro, and a squeeze of lime.",
    ],
    time: "15 min", difficulty: "Easy", servings: "2 servings",
    tags: ["Spicy", "Tropical", "Vegan", "Quick"],
    vibe_notes: "This is what happens when a beach sunset and a street food cart have a delicious baby.",
  },
  {
    title: "Midnight Mushroom Risotto",
    description: "A rich, deeply savory risotto for those late-night 'I deserve something fancy' moments.",
    ingredients: [
      { item: "arborio rice", amount: "1 cup" },
      { item: "mixed mushrooms", amount: "300g", note: "sliced" },
      { item: "shallot", amount: "1, minced" },
      { item: "white wine", amount: "1/2 cup" },
      { item: "parmesan", amount: "1/2 cup, grated" },
      { item: "vegetable broth", amount: "4 cups, warm" },
      { item: "butter", amount: "2 tbsp" },
    ],
    steps: [
      "Sauté mushrooms in butter until golden, set aside.",
      "Cook shallot until soft, add rice and toast for 1 minute.",
      "Pour in wine, stir until absorbed.",
      "Add broth one ladle at a time, stirring until each is absorbed — about 18 minutes total.",
      "Fold in mushrooms and parmesan. Season and serve immediately.",
    ],
    time: "35 min", difficulty: "Medium", servings: "2 servings",
    tags: ["Fancy", "Comfort", "Vegetarian", "Date Night"],
    vibe_notes: "Dim the lights, put on some jazz, and pretend you're in a tiny Italian restaurant at midnight.",
  },
];

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

  // Demo mode — stream a random mock recipe when no API key is configured
  if (!hasApiKey) {
    const recipe = DEMO_RECIPES[Math.floor(Math.random() * DEMO_RECIPES.length)];
    const json = JSON.stringify(recipe);
    // Simulate streaming by sending chunks
    for (let i = 0; i < json.length; i += 20) {
      res.write(`data: ${JSON.stringify({ text: json.slice(i, i + 20) })}\n\n`);
    }
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
    console.log(`[DEMO MODE] Served: ${recipe.title}`);
    return;
  }

  try {
    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
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

const MODIFY_PROMPT = `You are a creative chef who modifies existing recipes based on specific requests. Given an original recipe and a modification instruction, return an updated version of the recipe.

Return ONLY valid JSON matching this exact schema:
{
  "title": "string — updated recipe name if appropriate",
  "description": "string — updated 1-2 sentence description",
  "ingredients": [
    { "item": "string", "amount": "string", "note": "string (optional)" }
  ],
  "steps": ["string — each step as a clear instruction"],
  "time": "string — total time estimate (e.g. '30 min')",
  "difficulty": "string — Easy, Medium, or Hard",
  "servings": "string — e.g. '2 servings'",
  "tags": ["string — 2-4 short tags"],
  "vibe_notes": "string — a playful note about the recipe"
}

Keep the spirit and character of the original. Only change what is necessary to fulfill the modification. Be specific and thoughtful — if asked to make it spicier, add actual chili or heat. If asked to make it vegan, swap every non-vegan ingredient.`;

app.post("/api/modify", async (req, res) => {
  const { recipe, modification } = req.body;

  if (!modification || typeof modification !== "string" || modification.trim().length === 0) {
    return res.status(400).json({ error: "Please provide a modification" });
  }
  if (!recipe || typeof recipe !== "object") {
    return res.status(400).json({ error: "Please provide a recipe to modify" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  if (!hasApiKey) {
    const demo = { ...recipe, title: `${recipe.title} (modified)`, vibe_notes: `Modified: ${modification}` };
    const json = JSON.stringify(demo);
    for (let i = 0; i < json.length; i += 20) {
      res.write(`data: ${JSON.stringify({ text: json.slice(i, i + 20) })}\n\n`);
    }
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
    return;
  }

  try {
    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: `Original recipe:\n${JSON.stringify(recipe, null, 2)}\n\nModification request: ${modification.trim()}`,
        },
      ],
      system: MODIFY_PROMPT,
    });

    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    console.error("Recipe modification failed:", err.message);
    let errorMessage = "Failed to modify recipe. Please try again.";
    if (err.status === 401) errorMessage = "Invalid API key";
    else if (err.status === 429) errorMessage = "Rate limited — try again in a moment";
    res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
    res.end();
  }
});

export { app };

if (process.env.NODE_ENV !== "test") {
  const server = app.listen(port, () => {
    console.log(`Vibe Recipe Server running on http://localhost:${port}`);
    if (!hasApiKey) {
      console.log("⚠ No ANTHROPIC_API_KEY — running in DEMO MODE (mock recipes)");
    }
  });

  const shutdown = (signal) => {
    console.log(`${signal} received — shutting down gracefully`);
    server.close(() => {
      console.log("Server closed");
      process.exit(0);
    });
    setTimeout(() => {
      console.error("Forced shutdown after timeout");
      process.exit(1);
    }, 10_000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}
