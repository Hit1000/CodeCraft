# ✨ CodeCraft - SaaS Code Editor ✨

CodeCraft is a modern, in-browser IDE built with Next.js 15, offering a seamless coding experience with powerful AI capabilities, real-time collaboration features, and a robust backend powered by Convex.

## Key Features

- **Advanced Code Editor**: Utilizes Monaco Editor, the engine behind VS Code, for a familiar and powerful editing experience with support for 5 themes and customizable font sizes.
- **Multi-Language Support**: Write and execute code in 10 different languages, including JavaScript, TypeScript, Python, Java, and Rust.
- **AI-Powered Assistant**:
    - **AI Chat**: An integrated chat panel to ask questions about your code.
    - **Quick Actions**: Instantly explain, fix, or optimize selected code.
    - **AI Autocomplete**: Intelligent, inline code suggestions powered by Ollama.
- **Virtual File System**: Manage your project with a built-in file explorer that supports files and folders, with state persisted in local storage.
- **Code Snippet Sharing**: Share your code with the community by creating snippets. Others can view, comment on, and star your work.
- **User Profiles & Stats**: Track your coding activity with a personal profile page displaying execution history, favorite languages, and starred snippets.
- **Monetization Ready**: Integrated with Lemon Squeezy for handling Pro plan subscriptions, with free and pro tiers.
- **Authentication**: Secure user authentication and management handled by Clerk.

## Tech Stack

- **Framework**: Next.js 15 (React 19)
- **Backend & Database**: Convex
- **Authentication**: Clerk
- **AI Integration**: Ollama
- **UI**: Tailwind CSS & Framer Motion
- **Code Editor**: Monaco Editor
- **State Management**: Zustand
- **Payments**: Lemon Squeezy (via Webhooks)

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

Create a `.env.local` file in the root of your project and add the following variables. Obtain the necessary keys from [Convex](https://convex.dev) and [Clerk](https://clerk.com).

```env
# Convex Deployment URL
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=

# Clerk Authentication Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Ollama AI Configuration (run Ollama locally)
NEXT_PUBLIC_OLLAMA_ENDPOINT=http://localhost:11434
NEXT_PUBLIC_AI_MODEL=deepseek-coder:1.3b


## optional
# CLERK_WEBHOOK_SECRET=
# LEMON_SQUEEZY_WEBHOOK_SECRET=
```

### 4. Run the Development Servers

You need to run two separate processes in parallel.

**Run the Next.js frontend:**
```bash
npm run dev
```

**Run the Convex backend:**
```bash
npx convex dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

- `convex/`: Contains all backend logic, including database schema, queries, mutations, and actions.
- `src/app/`: The main application code, following the Next.js App Router structure.
  - `(root)/`: The primary editor interface.
  - `profile/`: User profile page with stats and execution history.
  - `snippets/`: Pages for browsing, viewing, and commenting on shared code snippets.
  - `pricing/`: The pricing page for the Pro plan.
- `src/components/`: Shared React components used across the application.
- `src/store/`: Zustand store (`useCodeEditorStore`) for global state management of the editor, file system, and AI features.
- `src/lib/ai/`: Contains the `OllamaService` for handling communication with the local Ollama AI model.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.