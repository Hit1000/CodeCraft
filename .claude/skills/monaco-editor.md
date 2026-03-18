# Monaco Editor & Zustand State Skill

## When to Use
Use this skill when working on the editor UI — Monaco configuration, file system, tabs, themes, or Zustand store state.

## Key Files
- **Main Store**: `src/store/useCodeEditorStore.ts` — complete editor state
- **Challenge Store**: `src/store/useChallengeStore.ts` — challenge filters and solving
- **Types**: `src/types/index.ts` — FileNode, CodeEditorState, ExecutionResult, Theme, Language
- **Constants**: `src/app/(root)/_constants/index.ts` — language configs, Monaco themes

## Virtual File System
The editor has an in-memory file system persisted to localStorage:
- `files: FileNode[]` — tree of files/folders (discriminated union: `"file"` | `"folder"`)
- `activeFileId: string | null` — currently open file
- `openFileIds: string[]` — open tabs

### FileNode shape
```ts
type FileNode = {
  id: string;
  name: string;
  type: "file" | "folder";
  content?: string;  // only for files
  children?: FileNode[];  // only for folders
  language?: string;
};
```

### Store methods for file system
- `createFile(name, parentId?, content?)` — create file
- `createFolder(name, parentId?)` — create folder
- `renameNode(id, newName)` — rename file/folder
- `deleteNode(id)` — delete file/folder
- `setActiveFile(id)` — switch active file
- `closeFileTab(id)` — close a tab
- `updateActiveFileContent(content)` — save file content
- `initializeFileSystem()` — load from localStorage

## Monaco Themes (5 built-in)
- `vs-dark` (default)
- `vs-light`
- `github-dark`
- `monokai`
- `solarized-dark`

## Key Conventions
- Always use `"use client"` for components using Monaco or Zustand
- Zustand stores are in `src/store/`
- Monaco editor instance stored in `editor` state
- Language switching updates Monaco's language mode AND starter code
- Theme changes applied via `editor.updateOptions({ theme })`
- State is SSR-safe with `typeof window !== "undefined"` guards

## Persistence
- **localStorage**: language, theme, fontSize, files (with activeFileId and openFileIds)
- **Convex**: snippets, executions, user data (persistent across devices)
