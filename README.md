# ✨ CodeCraft - SaaS Code Editor ✨
<img src="./public/home0.png" alt=" " align="center" />
CodeCraft is a modern, in-browser IDE built with Next.js 16, offering a seamless coding experience with powerful AI capabilities, real-time collaboration features, and a robust backend powered by Convex.

## Key Features

- **Advanced Code Editor**: Utilizes Monaco Editor, the engine behind VS Code, for a familiar and powerful editing experience with support for 5 themes and customizable font sizes.
- **Multi-Language Support**: Write and execute code in 8 different languages, including JavaScript, TypeScript, Python, Java, Rust, C++, Ruby, and Swift.
- **AI-Powered Assistant**:
  - **AI Chat**: An integrated chat panel to ask questions about your code.
  - **Quick Actions**: Instantly explain, fix, or optimize selected code.
  - **AI Autocomplete**: Intelligent, inline code suggestions powered by OpenRouter.
- **Coding Challenges (DSA & AI/ML)**: Practice curated Data Structures & Algorithms and AI/ML-focused problems with hidden/visible test cases, difficulty and topic filters, progress tracking, and a competitive leaderboard.
- **Virtual File System**: Manage your project with a built-in file explorer that supports files and folders, with state persisted in local storage.
- **Code Snippet Sharing**: Share your code with the community by creating snippets. Others can view, comment on, and star your work.
- **User Profiles & Stats**: Track your coding activity with a personal profile page displaying execution history, favorite languages, and starred snippets.
- **Monetization Ready**: Integrated with Lemon Squeezy for handling Pro plan subscriptions, with free and pro tiers.
- **Authentication**: Secure user authentication and management handled by Clerk.

## Tech Stack

- **Framework**: Next.js 16 (React 19)
- **Backend & Database**: Convex
- **Authentication**: Clerk
- **AI Integration**: OpenRouter
- **Code Execution**: Piston (self-hosted via Docker)
- **UI**: Tailwind CSS & Framer Motion
- **Code Editor**: Monaco Editor
- **State Management**: Zustand
- **Payments**: Lemon Squeezy (via Webhooks)

## Prerequisites

Before you begin, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for code execution)
- An account on [OpenRouter](https://openrouter.ai) (for AI features — optional)
- Accounts on [Convex](https://convex.dev) and [Clerk](https://clerk.com)

---

## Getting Started

Follow these steps to get the project running locally.

### 1. Clone the Repository

```bash
git clone https://github.com/Hit1000/CodeCraft.git
cd CodeCraft
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root of your project and add the following:

```env
# Convex Deployment URL (get from convex.dev)
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=

# Clerk Authentication Keys (get from clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# OpenRouter AI Configuration (get API key from openrouter.ai)
NEXT_PUBLIC_OPENROUTER_MODEL=openrouter/free
OPENROUTER_API_KEY=

# Piston Code Execution (set after completing Step 4 below)
NEXT_PUBLIC_PISTON_API_URL=http://localhost:2000/api/v2/execute

## Optional
# CLERK_WEBHOOK_SECRET=
# LEMON_SQUEEZY_WEBHOOK_SECRET=
```

### 4. Set Up Piston (Code Execution Engine)

CodeCraft uses [Piston](https://github.com/engineer-man/piston) for secure, sandboxed code execution. You need Docker Desktop running for this step.

#### 4a. Start the Piston container

```bash
docker compose -f docker-compose.piston.yml up -d
```

Verify it's running:
```bash
docker logs piston_api
# Should show: API server started on 0.0.0.0:2000
```

#### 4b. Install language runtimes

Run each command and wait for a JSON response before running the next one (each takes ~30–60 seconds):

```bash
curl -X POST http://localhost:2000/api/v2/packages -H "Content-Type: application/json" -d "{\"language\": \"node\", \"version\": \"*\"}"
curl -X POST http://localhost:2000/api/v2/packages -H "Content-Type: application/json" -d "{\"language\": \"python\", \"version\": \"*\"}"
curl -X POST http://localhost:2000/api/v2/packages -H "Content-Type: application/json" -d "{\"language\": \"typescript\", \"version\": \"*\"}"
curl -X POST http://localhost:2000/api/v2/packages -H "Content-Type: application/json" -d "{\"language\": \"java\", \"version\": \"*\"}"
curl -X POST http://localhost:2000/api/v2/packages -H "Content-Type: application/json" -d "{\"language\": \"rust\", \"version\": \"*\"}"
curl -X POST http://localhost:2000/api/v2/packages -H "Content-Type: application/json" -d "{\"language\": \"gcc\", \"version\": \"*\"}"
curl -X POST http://localhost:2000/api/v2/packages -H "Content-Type: application/json" -d "{\"language\": \"ruby\", \"version\": \"*\"}"
curl -X POST http://localhost:2000/api/v2/packages -H "Content-Type: application/json" -d "{\"language\": \"swift\", \"version\": \"*\"}"
```

> **Windows users:** A convenience script `install-piston-runtimes.bat` is included in the project root to install all runtimes at once.

#### 4c. Verify installed runtimes

```bash
curl "http://localhost:2000/api/v2/runtimes"
```

> **Important:** After installing, check the version numbers returned and make sure they match the `pistonRuntime.version` values in `src/app/(root)/_constants/index.ts`. Update any mismatches.

#### 4d. Test execution

```bash
curl -X POST http://localhost:2000/api/v2/execute -H "Content-Type: application/json" -d "{\"language\": \"javascript\", \"version\": \"20.11.1\", \"files\": [{\"content\": \"console.log('hello')\"}]}"
# Expected: {"run":{"stdout":"hello\n",...}}
```

### 5. Set Up OpenRouter (AI Features — Optional)

1. Create an account at [OpenRouter](https://openrouter.ai) and get your API key.
2. Add the API key to your `.env.local` file as `OPENROUTER_API_KEY`.
3. Set `NEXT_PUBLIC_OPENROUTER_MODEL` to your preferred model (e.g., `openrouter/free`).

### 6. Run the Development Servers

You need to run **three** processes — open separate terminals for each:

**Terminal 1 — Next.js frontend:**
```bash
npm run dev
```

**Terminal 2 — Convex backend:**
```bash
npx convex dev
npx convex run seed/seedChallenges:seedChallenges
```

**Terminal 3 — Piston (if not already running):**
```bash
docker compose -f docker-compose.piston.yml up
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Piston Management

| Command | Description |
|---|---|
| `docker compose -f docker-compose.piston.yml up -d` | Start Piston in background |
| `docker compose -f docker-compose.piston.yml down` | Stop Piston |
| `docker logs piston_api` | View Piston logs |
| `curl "http://localhost:2000/api/v2/runtimes"` | List installed languages |

> **Note:** Piston must be running whenever you use the code execution features. Docker Desktop must also be open.

---

## Project Structure

- `convex/`: Contains all backend logic, including database schema, queries, mutations, and actions.
- `src/app/`: The main application code, following the Next.js App Router structure.
  - `(root)/`: The primary editor interface.
  - `api/execute/`: Server-side proxy route that forwards code to the local Piston instance (avoids CORS).
  - `api/openrouter/`: Server-side proxy route that forwards AI requests to the OpenRouter API.
  - `challenges/`: Coding challenge pages with DSA & AI/ML problems, tagged by category/difficulty, with test case execution, progress tracking, and editorial/leaderboard views.
  - `challenges/admin/`: Challenge admin panel for managing problems, reviewing proposals, and user management.
  - `challenges/propose/`: Community challenge proposal page.
  - `leaderboard/`: Competitive leaderboard ranking users by challenge performance.
  - `admin/`: Platform admin panel for user management and site administration.
  - `profile/`: User profile page with stats and execution history.
  - `snippets/`: Pages for browsing, viewing, and commenting on shared code snippets.
  - `pricing/`: The pricing page for the Pro plan.
- `src/components/`: Shared React components used across the application.
- `src/store/`: Zustand stores — `useCodeEditorStore` for editor/file system/AI state, and `useChallengeStore` for challenge filters and problem-solving state.
- `src/lib/ai/`: Contains the `OpenRouterService` for handling communication with the OpenRouter AI API.
- `docker-compose.piston.yml`: Docker Compose config for the Piston code execution engine.

## Coding Challenges (DSA & AI/ML)

The `challenges` section of CodeCraft turns the editor into a practice platform for both classic DSA and modern AI/ML-style coding problems.

- **Curated problem sets**:
  - Problems are organized by **category** (for example, DSA vs AI/ML domains), **subcategory**, and **difficulty** (`Easy`, `Medium`, `Hard`).
  - Each challenge includes constraints, examples, hints, and optional editorial content.
- **Judge & test cases**:
  - Solve challenges directly in the in-browser editor using language-specific **starter code**.
  - Run your solution against **visible test cases** to debug, then submit against all cases (including hidden ones) for final verdicts like *Accepted*, *Wrong Answer*, or *Runtime Error*.
- **Progress tracking & filters**:
  - Your attempts, last submitted code, and status (`todo`, `attempted`, `solved`, `bookmarked`) are tracked per challenge.
  - Use rich filters (search, difficulty, category, subcategory, tags, status) to focus on DSA-only sets, AI/ML-only sets, or specific topics.
- **Leaderboard & stats**:
  - A dedicated **leaderboard** ranks users by points, solved count, streaks, and separate totals for **DSA** vs **AI/ML** problems.
  - Personalized stats show how many challenges you have solved overall and by difficulty.
- **Community challenge proposals**:
  - Any logged-in user can **propose new challenges** (including DSA or AI/ML problems) with starter code, driver code, and full test cases.
  - Admins review proposals, approve them into the main challenge set, and manage publication/order.

## Images
<img src="./public/home.png" alt=" " align="center" />
<img src="./public/home2.png" alt=" " align="center" />

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.