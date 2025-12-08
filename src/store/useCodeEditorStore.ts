import { CodeEditorState, FileNode } from "./../types/index";
import { LANGUAGE_CONFIG } from "@/app/(root)/_constants";
import { create } from "zustand";
import type * as monaco from "monaco-editor";

const FILE_STORAGE_KEY = "editor-files-v1";

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const persistFilesState = (
  files: Record<string, FileNode>,
  activeFileId: string | null,
  openFileIds: string[]
) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    FILE_STORAGE_KEY,
    JSON.stringify({ files, activeFileId, openFileIds })
  );
};

const normalizeFiles = (files: Record<string, FileNode>, fallbackLanguage: string) => {
  const next: Record<string, FileNode> = {};
  Object.entries(files).forEach(([id, node]) => {
    if (node.type === "file") {
      next[id] = {
        ...node,
        language: node.language || fallbackLanguage,
      };
    } else {
      next[id] = node;
    }
  });
  return next;
};

const getInitialState = () => {
  // if we're on the server, return default values
  if (typeof window === "undefined") {
    return {
      language: "javascript",
      fontSize: 16,
      theme: "vs-dark",
    };
  }

  // if we're on the client, return values from local storage bc localStorage is a browser API.
  const savedLanguage = localStorage.getItem("editor-language") || "javascript";
  const savedTheme = localStorage.getItem("editor-theme") || "vs-dark";
  const savedFontSize = localStorage.getItem("editor-font-size") || 16;

  return {
    language: savedLanguage,
    theme: savedTheme,
    fontSize: Number(savedFontSize),
  };
};

export const useCodeEditorStore = create<CodeEditorState>((set, get) => {
  const initialState = getInitialState();

  return {
    ...initialState,
    files: {},
    activeFileId: null,
    openFileIds: [],
    output: "",
    isRunning: false,
    error: null,
    editor: null,
    executionResult: null,

    // AI initial state
    chatMessages: [],
    isChatPanelOpen: false,
    isAIThinking: false,
    selectedCode: "",
    aiConfig: {
      endpoint: process.env.NEXT_PUBLIC_OLLAMA_ENDPOINT || "http://localhost:11434",
      model: process.env.NEXT_PUBLIC_AI_MODEL || "qwen3:4b",
      temperature: 0.7,
      maxTokens: 2000,
      stream: true,
    },
    isAutocompleteEnabled: true,
    autocompleteDelay: 300, // Reduced from 500ms for faster autocomplete

    getCode: () => {
      const state = get();
      if (state.editor) {
        return state.editor.getValue();
      }

      if (state.activeFileId) {
        const node = state.files[state.activeFileId];
        if (node && node.type === "file") {
          return node.content ?? "";
        }
      }

      return "";
    },

    setEditor: (editor: monaco.editor.IStandaloneCodeEditor) => {
      set({ editor });
    },

    setTheme: (theme: string) => {
      localStorage.setItem("editor-theme", theme);
      set({ theme });
    },

    setFontSize: (fontSize: number) => {
      localStorage.setItem("editor-font-size", fontSize.toString());
      set({ fontSize });
    },

    setLanguage: (language: string) => {
      localStorage.setItem("editor-language", language);
      const state = get();
      let files = state.files;

      if (state.activeFileId) {
        const node = state.files[state.activeFileId];
        if (node && node.type === "file") {
          files = {
            ...state.files,
            [state.activeFileId]: {
              ...node,
              language,
            },
          };
        }
      }

      set({
        language,
        output: "",
        error: null,
        files,
      });

      persistFilesState(files, state.activeFileId, state.openFileIds);
    },

    runCode: async () => {
      const { language, getCode } = get();
      const code = getCode();

      if (!code) {
        set({ error: "Please enter some code" });
        return;
      }

      set({ isRunning: true, error: null, output: "" });

      try {
        const runtime = LANGUAGE_CONFIG[language].pistonRuntime;
        const response = await fetch("https://emkc.org/api/v2/piston/execute", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            language: runtime.language,
            version: runtime.version,
            files: [{ content: code }],
          }),
        });

        const data = await response.json();

        console.log("data back from piston:", data);

        // handle API-level erros
        if (data.message) {
          set({ error: data.message, executionResult: { code, output: "", error: data.message } });
          return;
        }

        // handle compilation errors
        if (data.compile && data.compile.code !== 0) {
          const error = data.compile.stderr || data.compile.output;
          set({
            error,
            executionResult: {
              code,
              output: "",
              error,
            },
          });
          return;
        }

        if (data.run && data.run.code !== 0) {
          const error = data.run.stderr || data.run.output;
          set({
            error,
            executionResult: {
              code,
              output: "",
              error,
            },
          });
          return;
        }

        // if we get here, execution was successful
        const output = data.run.output;

        set({
          output: output.trim(),
          error: null,
          executionResult: {
            code,
            output: output.trim(),
            error: null,
          },
        });
      } catch (error) {
        console.log("Error running code:", error);
        set({
          error: "Error running code",
          executionResult: { code, output: "", error: "Error running code" },
        });
      } finally {
        set({ isRunning: false });
      }
    },

    initializeFileSystem: () => {
      if (typeof window === "undefined") return;

      const current = get();
      if (Object.keys(current.files).length > 0) return;

      try {
        const saved = localStorage.getItem(FILE_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as {
            files: Record<string, FileNode>;
            activeFileId: string | null;
            openFileIds: string[];
          };

          const files = normalizeFiles(parsed.files, current.language || "javascript");
          const activeFile =
            parsed.activeFileId && files[parsed.activeFileId]?.type === "file"
              ? files[parsed.activeFileId]
              : null;
          const nextLanguage = activeFile?.language || current.language || "javascript";

          set({
            files,
            activeFileId: parsed.activeFileId,
            openFileIds: parsed.openFileIds,
            language: nextLanguage,
          });

          if (activeFile?.content && current.editor) {
            current.editor.setValue(activeFile.content);
          }
          return;
        }
      } catch {
        // ignore parse errors and fall back to default
      }

      const language = current.language || "javascript";
      const defaultCode = LANGUAGE_CONFIG[language].defaultCode;
      const id = createId();

      const file: FileNode = {
        id,
        name: "main." + (language === "javascript" ? "js" : language),
        type: "file",
        parentId: null,
        content: defaultCode,
        language,
      };

      const files: Record<string, FileNode> = { [id]: file };
      const openFileIds = [id];

      set({
        files,
        activeFileId: id,
        openFileIds,
        language,
      });

      if (current.editor) {
        current.editor.setValue(defaultCode);
      }

      persistFilesState(files, id, openFileIds);
    },

    createFile: (parentId) => {
      if (typeof window === "undefined") return;
      const state = get();

      const language = state.language || "javascript";
      const defaultCode = LANGUAGE_CONFIG[language].defaultCode;
      const id = createId();

      const file: FileNode = {
        id,
        name: "untitled." + (language === "javascript" ? "js" : language),
        type: "file",
        parentId: parentId ?? null,
        content: defaultCode,
        language,
      };

      const files = { ...state.files, [id]: file };
      const openFileIds = [...state.openFileIds, id];

      set({
        files,
        activeFileId: id,
        openFileIds,
        language,
      });

      if (state.editor) {
        state.editor.setValue(defaultCode);
      }

      persistFilesState(files, id, openFileIds);
    },

    createFolder: (parentId) => {
      if (typeof window === "undefined") return;
      const state = get();
      const id = createId();

      const folder: FileNode = {
        id,
        name: "New Folder",
        type: "folder",
        parentId: parentId ?? null,
        isOpen: true,
      };

      const files = { ...state.files, [id]: folder };

      set({ files });

      persistFilesState(files, state.activeFileId, state.openFileIds);
    },

    renameNode: (id, name) => {
      if (typeof window === "undefined") return;
      const state = get();
      const node = state.files[id];
      if (!node) return;

      const files = {
        ...state.files,
        [id]: { ...node, name },
      };

      set({ files });

      persistFilesState(files, state.activeFileId, state.openFileIds);
    },

    toggleFolderOpen: (id) => {
      if (typeof window === "undefined") return;
      const state = get();
      const node = state.files[id];
      if (!node || node.type !== "folder") return;

      const files: Record<string, FileNode> = {
        ...state.files,
        [id]: {
          ...node,
          isOpen: !node.isOpen,
        },
      };

      set({ files });

      localStorage.setItem(
        FILE_STORAGE_KEY,
        JSON.stringify({ files, activeFileId: state.activeFileId, openFileIds: state.openFileIds })
      );
    },

    deleteNode: (id) => {
      if (typeof window === "undefined") return;
      const state = get();
      if (!state.files[id]) return;

      const collectIdsToDelete = (targetId: string, files: Record<string, FileNode>): string[] => {
        const children = Object.values(files)
          .filter((f) => f.parentId === targetId)
          .map((f) => f.id);

        return [targetId, ...children.flatMap((childId) => collectIdsToDelete(childId, files))];
      };

      const idsToDelete = collectIdsToDelete(id, state.files);
      const files: Record<string, FileNode> = {};

      Object.entries(state.files).forEach(([key, value]) => {
        if (!idsToDelete.includes(key)) {
          files[key] = value;
        }
      });

      const openFileIds = state.openFileIds.filter((fid) => !idsToDelete.includes(fid));
      let activeFileId = state.activeFileId;

      if (activeFileId && idsToDelete.includes(activeFileId)) {
        activeFileId = openFileIds[openFileIds.length - 1] ?? null;
      }

      const activeFile =
        activeFileId && files[activeFileId]?.type === "file" ? files[activeFileId] : null;
      const nextLanguage = activeFile?.language || state.language;

      set({
        files,
        openFileIds,
        activeFileId,
        language: nextLanguage,
      });

      const active = activeFileId ? files[activeFileId] : null;
      if (state.editor) {
        state.editor.setValue(active?.content ?? "");
      }

      persistFilesState(files, activeFileId, openFileIds);
    },

    setActiveFile: (id) => {
      if (typeof window === "undefined") return;
      const state = get();
      const node = state.files[id];
      if (!node || node.type !== "file") return;

      const openFileIds = state.openFileIds.includes(id)
        ? state.openFileIds
        : [...state.openFileIds, id];

      const nextLanguage = node.language || state.language || "javascript";

      set({
        activeFileId: id,
        openFileIds,
        language: nextLanguage,
      });

      if (state.editor) {
        state.editor.setValue(node.content ?? "");
      }

      persistFilesState(state.files, id, openFileIds);
    },

    closeFileTab: (id) => {
      if (typeof window === "undefined") return;
      const state = get();
      const openFileIds = state.openFileIds.filter((fid) => fid !== id);
      let activeFileId = state.activeFileId;

      if (activeFileId === id) {
        activeFileId = openFileIds[openFileIds.length - 1] ?? null;
      }

      const activeFile =
        activeFileId && state.files[activeFileId]?.type === "file"
          ? state.files[activeFileId]
          : null;
      const nextLanguage = activeFile?.language || state.language;

      set({
        openFileIds,
        activeFileId,
        language: nextLanguage,
      });

      const active = activeFileId ? state.files[activeFileId] : null;
      if (state.editor) {
        state.editor.setValue(active?.content ?? "");
      }

      persistFilesState(state.files, activeFileId, openFileIds);
    },

    updateActiveFileContent: (content: string) => {
      if (typeof window === "undefined") return;
      const state = get();
      const activeId = state.activeFileId;
      if (!activeId) return;

      const node = state.files[activeId];
      if (!node || node.type !== "file") return;

      const files: Record<string, FileNode> = {
        ...state.files,
        [activeId]: {
          ...node,
          content,
        },
      };

      set({
        files,
        executionResult: state.executionResult
          ? { ...state.executionResult, code: content }
          : state.executionResult,
      });

      persistFilesState(files, state.activeFileId, state.openFileIds);
    },

    // AI methods
    addChatMessage: (message) => {
      const state = get();
      set({ chatMessages: [...state.chatMessages, message] });
    },

    toggleChatPanel: () => {
      const state = get();
      set({ isChatPanelOpen: !state.isChatPanelOpen });
    },

    setAIThinking: (thinking) => {
      set({ isAIThinking: thinking });
    },

    setSelectedCode: (code) => {
      set({ selectedCode: code });
    },

    updateAIConfig: (config) => {
      const state = get();
      set({ aiConfig: { ...state.aiConfig, ...config } });
    },

    clearChatHistory: () => {
      set({ chatMessages: [] });
    },

    setAutocompleteEnabled: (enabled) => {
      set({ isAutocompleteEnabled: enabled });
      if (typeof window !== "undefined") {
        localStorage.setItem("ai-autocomplete-enabled", String(enabled));
      }
    },

    setAutocompleteDelay: (delay) => {
      set({ autocompleteDelay: delay });
      if (typeof window !== "undefined") {
        localStorage.setItem("ai-autocomplete-delay", String(delay));
      }
    },
  };
});

export const getExecutionResult = () => useCodeEditorStore.getState().executionResult;
