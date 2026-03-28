# Vibe Recipe Generator

Describe a mood, vibe, or feeling — get a recipe that matches. Powered by Claude AI.

> "cozy Sunday with rain outside" → Slow-Simmered Tomato Basil Soup with Grilled Cheese Dippers

## How It Works

1. Type a vibe into the input ("chaotic brunch energy", "impress a date but I can't really cook")
2. Claude interprets the mood and generates a unique recipe
3. Get a full recipe with ingredients, steps, time estimate, and a playful vibe note
4. Hit "Try a different take" for an alternate recipe on the same vibe

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite + CSS Modules
- **Backend:** Node.js + Express
- **AI:** Anthropic Claude API (Sonnet) with structured JSON output

## Project Structure

```
vibe-recipe-generator/
├── client/                # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── VibeInput.tsx         # Vibe text input with character counter
│   │   │   ├── RecipeCard.tsx        # Full recipe display card
│   │   │   └── LoadingState.tsx      # Animated loading with fun messages
│   │   ├── App.tsx                   # Main app orchestration
│   │   ├── types.ts                  # Recipe & Ingredient interfaces
│   │   └── index.css                 # Global styles (Inter font)
│   └── index.html
├── server/                # Express backend
│   ├── server.js          # API server with Claude integration
│   ├── .env.example       # API key template
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)

### Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/NSurawski/vibe-recipe-generator.git
   cd vibe-recipe-generator
   ```

2. **Set up the backend**
   ```bash
   cd server
   cp .env.example .env
   # Add your ANTHROPIC_API_KEY to .env
   npm install
   npm run dev
   ```

3. **Set up the frontend** (in a new terminal)
   ```bash
   cd client
   npm install
   npm run dev
   ```

4. Open http://localhost:5173 and start vibing

## Recipe Schema

Each generated recipe returns:

| Field | Description |
|-------|-------------|
| `title` | Creative, evocative recipe name |
| `description` | How this recipe matches the vibe |
| `ingredients` | List with item, amount, and optional notes |
| `steps` | Ordered cooking instructions |
| `time` | Total time estimate |
| `difficulty` | Easy, Medium, or Hard |
| `vibe_notes` | Playful note about why the recipe fits |

## Features

- **Vibe-based input** — open-ended text, not dropdowns or filters
- **Structured output** — Claude returns typed JSON, not freeform text
- **Regenerate** — get a different take on the same vibe
- **Animated loading** — rotating fun messages while Claude cooks
- **Input validation** — 500 character limit, empty input prevention
- **Error handling** — graceful handling of API errors, rate limits, and auth issues
