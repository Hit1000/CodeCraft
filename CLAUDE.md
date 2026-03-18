# CLAUDE.md

## Project Overview

**CodeCraft** is a browser-based IDE (SaaS Code Editor) built with Next.js 16, React 19, Convex (backend/database), Clerk (auth), and Monaco Editor. It supports code editing in 9+ languages, AI-powered features via Ollama, a coding challenges system (DSA & AI/ML), and code snippet sharing.

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion
- **Backend:** Convex (real-time serverless database + functions)
- **Auth:** Clerk
- **State:** Zustand (`src/store/`)
- **Editor:** Monaco Editor (VS Code engine)
- **Code Execution:** Piston (Docker-based sandboxed compiler, port 2000)
- **AI:** Ollama (local, port 11434)
- **Payments:** Lemon Squeezy

## Commands

```bash
npm run dev          # Start Next.js dev server (port 3000)
npm run build        # Production build
npm start            # Start production server
npm run lint         # Run ESLint
npx convex dev       # Start Convex backend (separate terminal)
docker compose -f docker-compose.piston.yml up -d   # Start Piston code execution engine
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (root)/page.tsx     # Main editor homepage
│   ├── (root)/_constants/  # Language configs, Monaco themes
│   ├── api/execute/        # Piston proxy route
│   ├── challenges/         # Coding challenges pages
│   ├── snippets/           # Code snippet pages
│   ├── profile/            # User profile
│   ├── leaderboard/        # Challenge leaderboard
│   └── pricing/            # Pro subscription
├── components/             # Shared React components
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities and services
│   └── ai/ollama-service.ts  # Ollama AI integration
├── store/                  # Zustand stores
│   ├── useCodeEditorStore.ts  # Core editor state
│   └── useChallengeStore.ts   # Challenge filter state
├── types/                  # TypeScript interfaces
└── middleware.ts           # Clerk auth middleware
convex/
├── schema.ts               # Database schema (11 tables)
├── challenges.ts           # Challenge queries/mutations
├── users.ts                # User management
├── snippets.ts             # Snippet CRUD
├── codeExecutions.ts       # Execution tracking
└── http.ts                 # Webhooks (Clerk, Lemon Squeezy)
```

## Path Aliases

- `@/*` maps to `./src/*` (configured in tsconfig.json)

## Key Conventions

- Use `"use client"` directive for client-side components (Monaco, Zustand, etc.)
- Zustand stores in `src/store/` for global state management
- Convex functions in `convex/` for all server-side logic (queries, mutations, actions)
- Tailwind CSS utility classes for styling; custom themes via CSS variables
- Framer Motion for animations
- ESLint extends `next/core-web-vitals` and `next/typescript`

## Code Execution Flow

1. User writes code in Monaco Editor
2. `runCode()` sends request to `/api/execute/` (Next.js API route)
3. API route proxies to local Piston instance at `http://localhost:2000/api/v2/execute`
4. Piston executes code in Docker sandbox, returns output/error

## AI Integration

- Ollama runs locally on `http://localhost:11434`
- Default model: `deepseek-coder:1.3b`
- Features: inline code completion, explanation, fixing, optimization, chat
- Streaming responses supported

## Environment Variables (`.env.local`)

```
CONVEX_DEPLOYMENT=              # Convex deployment name
NEXT_PUBLIC_CONVEX_URL=         # Convex URL
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_OLLAMA_ENDPOINT=http://localhost:11434
NEXT_PUBLIC_AI_MODEL=deepseek-coder:1.3b
NEXT_PUBLIC_PISTON_API_URL=http://localhost:2000/api/v2/execute
```

## Important Files

- `src/app/(root)/page.tsx` — Main editor page
- `src/store/useCodeEditorStore.ts` — Core editor state (files, tabs, language, execution)
- `src/app/(root)/_constants/index.ts` — Language configs and theme definitions
- `convex/schema.ts` — Full database schema
- `convex/challenges.ts` — Challenge system logic
- `src/lib/buildExecutableCode.ts` — Wraps challenge code with driver/test templates
- `src/lib/ai/ollama-service.ts` — AI service integration
