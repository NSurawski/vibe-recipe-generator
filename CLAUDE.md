# Vibe Recipe Generator

An AI-powered recipe generator that interprets vibes, moods, and feelings to create unique, personality-rich recipes using Claude.

## Project Overview

- **Stack:** React 19 + TypeScript + Vite (frontend), Node.js + Express (backend)
- **AI:** Anthropic Claude API (Sonnet) via `@anthropic-ai/sdk` on the server
- **Styling:** CSS Modules (`.module.css` files per component)
- **Branch:** `main` is the working branch

## Architecture

### Backend (`server/`)

Single Express server with one endpoint:

- `POST /api/recipe` — accepts `{ vibe: string }`, sends a crafted prompt to Claude, returns structured JSON recipe

The prompt instructs Claude to return a specific schema: `{ title, description, ingredients[], steps[], time, difficulty, vibe_notes }`.

### Frontend (`client/`)

- `App.tsx` — orchestration: manages state, API calls, error display
- `VibeInput.tsx` — textarea with placeholder vibes, character counter, gradient submit button
- `RecipeCard.tsx` — full recipe display with numbered steps, ingredient grid, vibe notes, regenerate button
- `LoadingState.tsx` — animated emoji with rotating fun messages
- `types.ts` — `Recipe` and `Ingredient` interfaces

## Commands

```bash
# Backend
cd server
npm run dev        # Start Express server (port 3001, with --watch)
npm start          # Production start

# Frontend
cd client
npm run dev        # Start Vite dev server (port 5173)
npm run build      # Type-check + production build
```

## Git Identity

Always commit as the repository owner — never use Claude's identity:

```bash
git config user.name "NSurawski"
git config user.email "nicolesurawski@gmail.com"
```

Run this at the start of any session before making commits.

## Skills

### Planning (`nimbalyst-planning:planning`)

Use for tracking features, bugs, ideas, and tasks.

- Plans live in `nimbalyst-local/plans/` with YAML frontmatter
- Trackers live in `nimbalyst-local/tracker/` — `bugs.md`, `tasks.md`, `ideas.md`
- Use `/plan` to create a new plan, `/track` to log items, `/implement` to execute a plan

### MockupLM (`nimbalyst-mockuplm:mockuplm`)

Use for designing UI before building it.

- Mockup files: `nimbalyst-local/mockups/[name].mockup.html`
- Existing screen replicas: `nimbalyst-local/existing-screens/`
- Standalone HTML with inline CSS only — no external dependencies
- Use `/mockup` to create a new design

## Conventions

- **CSS Modules:** Each component has a co-located `.module.css` file. Use `styles.className` imports, not global classes.
- **API key:** Stored server-side in `.env` only. Never expose to the frontend.
- **Error handling:** Backend returns structured `{ error: string }` on failure. Frontend displays errors in a styled banner.
- **TypeScript:** Strict mode on the frontend. Backend is plain JavaScript (ES modules).
- **Structured output:** Claude returns JSON matching the `Recipe` schema. The prompt enforces this — no freeform text parsing needed.
