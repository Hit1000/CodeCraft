"use client";
import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { getOpenRouterService } from "@/lib/ai/openrouter-service";
import { AIMessage } from "@/lib/ai/types";
import { 
  X, Send, Sparkles, Wrench, Zap, Copy, Check, RotateCw, Plus, ChevronRight, Loader2, Settings,
  Wand2, FlaskConical, BookMarked, StopCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import remarkGfm from "remark-gfm";
import toast from "react-hot-toast";
import { usePathname } from "next/navigation";
import { useChallengeStore } from "@/store/useChallengeStore";

interface ChatSession {
  id: string;
  name: string;
  messages: AIMessage[];
  createdAt: number;
}

const AI_MODELS = [
  { id: "openai/gpt-oss-120b:free", name: "GPT-OSS 120B", provider: "Free" },
  { id: "minimax/minimax-m2.5:free", name: "MiniMax M2.5", provider: "OpenRouter" },
  { id: "qwen/qwen3-coder:free", name: "Qwen3 Coder 480B A35B", provider: "OpenRouter" },
  { id: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free", name: "Venice: Uncensored", provider: "OpenRouter" },
  { id: "openrouter/free", name: "Free Models Router", provider: "OpenRouter" },
];

const CODE_TEMPLATES = [
  { id: "sort", name: "Sort Array", prompt: "Write a efficient sorting algorithm for an array in {{language}}" },
  { id: "debounce", name: "Debounce", prompt: "Create a debounce function in {{language}}" },
  { id: "fetch", name: "Fetch API", prompt: "Write a fetch wrapper with error handling in {{language}}" },
  { id: "throttle", name: "Throttle", prompt: "Create a throttle function in {{language}}" },
  { id: "promise", name: "Promise Pool", prompt: "Implement a promise pool with concurrency limit in {{language}}" },
  { id: "lru", name: "LRU Cache", prompt: "Implement an LRU cache in {{language}}" },
];

function TypewriterText({ content }: { content: string }) {
  const [displayedLength, setDisplayedLength] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const prevLengthRef = useRef(0);

  useEffect(() => {
    const targetLength = content.length;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (targetLength === 0) {
      setDisplayedLength(0);
      prevLengthRef.current = 0;
      return;
    }

    let current = prevLengthRef.current;

    if (current >= targetLength) {
      setDisplayedLength(targetLength);
      return;
    }

    intervalRef.current = setInterval(() => {
      current++;
      setDisplayedLength(current);
      prevLengthRef.current = current;

      if (current >= targetLength) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
      }
    }, 8);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [content]);

  return (
    <span className="text-gray-300 leading-relaxed whitespace-normal break-words">
      {content.slice(0, displayedLength)}
      {displayedLength < content.length && (
        <span className="inline-block w-[2px] h-[14px] bg-purple-400 ml-[1px] align-middle animate-pulse" />
      )}
    </span>
  );
}

function CodeBlock({ code, language, ...props }: { code: string; language: string; [key: string]: any }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="relative group/code">
      <motion.button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded bg-[#1e1e2e] hover:bg-[#2a2a3a] transition-colors z-10 flex items-center gap-1"
        title="Copy code"
        whileTap={{ scale: 0.9 }}
      >
        {copied ? (
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5 text-green-400" />
            <span className="text-xs text-green-400">Copied!</span>
          </motion.span>
        ) : (
          <Copy className="w-3.5 h-3.5 text-gray-400" />
        )}
      </motion.button>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={language}
        PreTag="div"
        customStyle={{ margin: 0, borderRadius: "0.5rem", fontSize: "0.8rem" }}
        {...props}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

function ChatMessage({ message, isStreaming, onInsert, onCopy, onRetry }: { 
  message: AIMessage; 
  isStreaming?: boolean;
  onInsert?: () => void;
  onCopy?: () => void;
  onRetry?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [expandedReasoning, setExpandedReasoning] = useState(true);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 p-4 rounded-lg ${
        message.role === "user" ? "bg-blue-500/10 ml-8" : "bg-purple-500/10 mr-8"
      }`}
    >
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
        message.role === "user" 
          ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white" 
          : "bg-gradient-to-br from-purple-500 to-pink-600 text-white"
      }`}>
        {message.role === "user" ? "U" : "AI"}
      </div>

      <div className="flex-1 min-w-0">
        {message.role === "assistant" && (
          <div className="absolute top-0 right-0 flex gap-1">
            <button onClick={onInsert} className="p-1 hover:bg-white/10 rounded" title="Insert to Editor">
              <Plus className="w-3 h-3 text-gray-400" />
            </button>
            <button onClick={onRetry} className="p-1 hover:bg-white/10 rounded" title="Regenerate">
              <RotateCw className="w-3 h-3 text-gray-400" />
            </button>
          </div>
        )}


        {/* Reasoning/Thought Process */}
        {message.reasoning && (
          <div className="mb-2">
            <button
              onClick={() => setExpandedReasoning(!expandedReasoning)}
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 mb-1"
            >
              {expandedReasoning ? "▼" : "▶"} Thought Process
            </button>
            {expandedReasoning && (
              <div className="p-2 bg-purple-500/10 rounded-lg text-xs text-purple-300/80 italic border-l-2 border-purple-500">
                {message.reasoning}
              </div>
            )}
          </div>
        )}

        <div className="prose prose-invert prose-sm max-w-none break-words whitespace-normal">
          {isStreaming ? (
            <div className="text-gray-300 leading-relaxed mb-2">
              <TypewriterText content={message.content} />
            </div>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || "");
                  const codeString = String(children).replace(/\n$/, "");

                  if (!inline && match) {
                    return <CodeBlock code={codeString} language={match[1]} {...props} />;
                  }
                  return <code className="px-1.5 py-0.5 rounded bg-[#1e1e2e] text-blue-400 text-sm" {...props}>{children}</code>;
                },
                p({ children }) { return <p className="text-gray-300 leading-relaxed mb-2">{children}</p>; },
                ul({ children }) { return <ul className="list-disc list-inside text-gray-300 space-y-1">{children}</ul>; },
                ol({ children }) { return <ol className="list-decimal list-inside text-gray-300 space-y-1">{children}</ol>; },
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-gray-500">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function AIChatPanel() {
  const {
    isChatPanelOpen,
    chatMessages,
    isAIThinking,
    selectedCode,
    language,
    toggleChatPanel,
    addChatMessage,
    setAIThinking,
    getCode,
    updateActiveFileContent,
  } = useCodeEditorStore();

  useEffect(() => {
    if (isChatPanelOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isChatPanelOpen]);

  const pathname = usePathname();
  const isChallengeRoute = pathname?.startsWith("/challenges/") ?? false;
  const {
    code: challengeCode,
    activeLanguage: challengeLanguage,
    setCode: setChallengeCode,
    challengeContext,
  } = useChallengeStore();

  const [inputValue, setInputValue] = useState("");
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedModel, setSelectedModel] = useState("openai/gpt-oss-120b:free");
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const currentStreamRef = useRef<AsyncGenerator<string> | null>(null);
  const aiMessageIdRef = useRef<string | null>(null);
  const openRouterService = getOpenRouterService();
  const prevMessagesLengthRef = useRef(0);

  const formatAIError = (error: unknown) => {
    if (error instanceof Error) {
      const message = error.message || "AI request failed.";
      const apiMatch = message.match(/API error\s*(\d+):\s*(.*)$/i);
      if (apiMatch) {
        const status = apiMatch[1];
        try {
          const parsed = JSON.parse(apiMatch[2]);
          if (parsed?.details) {
            try {
              const inner = JSON.parse(parsed.details);
              const raw = inner?.error?.metadata?.raw;
              if (raw) {
                return `AI error ${status}: ${raw}`;
              }
            } catch {
              // fall through
            }
          }
          if (parsed?.error) {
            return `AI error ${status}: ${parsed.error}`;
          }
        } catch {
          // fall through
        }
        if (status === "429") {
          return "AI is temporarily rate-limited. Please retry in a minute or add your own OpenRouter key.";
        }
      }

      if (/rate[-\s]?limit/i.test(message)) {
        return "AI is temporarily rate-limited. Please retry shortly.";
      }

      return `AI error: ${message}`;
    }

    return "AI error: request failed. Please try again.";
  };

  const upsertAssistantMessage = useCallback((message: AIMessage) => {
    if (currentSessionId && chatSessions.some((s) => s.id === currentSessionId)) {
      setChatSessions((prev) =>
        prev.map((s) => {
          if (s.id !== currentSessionId) return s;
          const idx = s.messages.findIndex((m) => m.id === message.id);
          if (idx === -1) {
            return { ...s, messages: [...s.messages, message] };
          }
          const nextMessages = [...s.messages];
          nextMessages[idx] = message;
          return { ...s, messages: nextMessages };
        })
      );
      return;
    }

    const currentChatMessages = useCodeEditorStore.getState().chatMessages;
    const idx = currentChatMessages.findIndex((m) => m.id === message.id);
    if (idx === -1) {
      useCodeEditorStore.setState({
        chatMessages: [...currentChatMessages, message],
      });
      return;
    }

    const nextMessages = [...currentChatMessages];
    nextMessages[idx] = message;
    useCodeEditorStore.setState({ chatMessages: nextMessages });
  }, [chatSessions, currentSessionId, setChatSessions]);

  useEffect(() => {
    let mounted = true;
    const checkConnection = async () => {
      try {
        const connected = await openRouterService.checkConnection();
        if (mounted) setIsConnected(connected);
      } catch { if (mounted) setIsConnected(false); }
    };
    checkConnection();
    return () => { mounted = false; };
  }, []);

  // Scroll to bottom when messages change or streaming
  useEffect(() => {
    const currentMessages = useCodeEditorStore.getState().chatMessages;
    const currentLength = currentMessages.length;
    
    if (isStreaming || currentLength > prevMessagesLengthRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
    prevMessagesLengthRef.current = currentLength;
  }, [isStreaming, chatMessages, chatSessions, currentSessionId]);

  // Auto-focus input after sending
  useEffect(() => {
    if (!isStreaming && prevMessagesLengthRef.current > 0) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isStreaming]);

  const createNewSession = useCallback(() => {
    const session: ChatSession = {
      id: Date.now().toString(),
      name: `Chat ${chatSessions.length + 1}`,
      messages: [],
      createdAt: Date.now(),
    };
    setChatSessions(prev => [session, ...prev]);
    setCurrentSessionId(session.id);
    return session;
  }, [chatSessions.length]);

  const getSessionMessages = useCallback(() => {
    return !currentSessionId ? chatMessages : chatSessions.find(s => s.id === currentSessionId)?.messages || chatMessages;
  }, [currentSessionId, chatSessions, chatMessages]);

  const sendMessage = useCallback(async (content: string, isUserMessage = true) => {
    if (!content.trim() || isStreaming) return;

    const session = currentSessionId ? chatSessions.find(s => s.id === currentSessionId) : null;
    const messages = session?.messages || chatMessages;

    if (isUserMessage) {
      const userMessage: AIMessage = {
        id: Date.now().toString(),
        role: "user",
        content,
        timestamp: Date.now(),
      };
      
      if (currentSessionId) {
        setChatSessions(prev => prev.map(s => 
          s.id === currentSessionId 
            ? { ...s, messages: [...s.messages, userMessage] }
            : s
        ));
      } else {
        addChatMessage(userMessage);
      }
      setInputValue("");
    }

    setAIThinking(true);
    setIsStreaming(true);

    try {
      const currentMessages = useCodeEditorStore.getState().chatMessages;
      
      const allMessages = (currentSessionId 
        ? chatSessions.find(s => s.id === currentSessionId)?.messages || []
        : currentMessages
      ).map((msg) => ({ role: msg.role, content: msg.content }));

      if (isUserMessage) {
        allMessages.push({ role: "user", content });
      }

       const aiMessageId = Date.now().toString() + "-ai";
       aiMessageIdRef.current = aiMessageId;
       
       openRouterService.updateConfig({ model: selectedModel });
       currentStreamRef.current = openRouterService.chat(allMessages);

       const assistantMessage: AIMessage = {
         id: aiMessageId,
         role: "assistant",
         content: "",
         reasoning: "",
         timestamp: Date.now(),
       };

       if (currentSessionId) {
         setChatSessions(prev => prev.map(s => 
           s.id === currentSessionId 
             ? { ...s, messages: [...s.messages, assistantMessage] }
             : s
         ));
       } else {
         addChatMessage(assistantMessage);
       }

       let aiResponse = "";
       let updatePending = false;

       for await (const chunk of currentStreamRef.current) {
         aiResponse += chunk;
         
         if (!updatePending) {
           updatePending = true;
           setTimeout(() => {
             updatePending = false;
             const updatedMessage: AIMessage = { ...assistantMessage, content: aiResponse };

             if (currentSessionId) {
               setChatSessions(prev => prev.map(s => 
                 s.id === currentSessionId 
                   ? { ...s, messages: [...s.messages.slice(0, -1), updatedMessage] }
                   : s
               ));
             } else {
               const currentChatMessages = useCodeEditorStore.getState().chatMessages;
               useCodeEditorStore.setState((state) => ({
                 chatMessages: [...currentChatMessages.slice(0, -1), updatedMessage]
               }));
             }
           }, 100); // Update every 100ms - more text per update
         }
       }

       // Final update to ensure complete message is saved
       const finalMessage: AIMessage = { ...assistantMessage, content: aiResponse };
       if (currentSessionId) {
         setChatSessions(prev => prev.map(s => 
           s.id === currentSessionId 
             ? { ...s, messages: [...s.messages.slice(0, -1), finalMessage] }
             : s
         ));
       } else {
         const currentChatMessages = useCodeEditorStore.getState().chatMessages;
         useCodeEditorStore.setState((state) => ({
           chatMessages: [...currentChatMessages.slice(0, -1), finalMessage]
         }));
       }

     } catch (error) {
       console.error("Chat error:", error);
       const errorText = formatAIError(error);
       const errorMessage: AIMessage = {
         id: aiMessageIdRef.current ?? `${Date.now()}-ai-error`,
         role: "assistant",
         content: errorText,
         timestamp: Date.now(),
       };
       upsertAssistantMessage(errorMessage);
       toast.error(errorText);
     } finally {
       setAIThinking(false);
       setIsStreaming(false);
       currentStreamRef.current = null;
     }
   }, [currentSessionId, chatSessions, isStreaming, addChatMessage, setAIThinking, selectedModel, openRouterService]);

  const buildChallengeContext = () => {
    if (!challengeContext) return "";
    const examples = challengeContext.examples
      .map((ex, idx) => {
        const explanation = ex.explanation ? `\nExplanation: ${ex.explanation}` : "";
        return `Example ${idx + 1}:\nInput: ${ex.input}\nOutput: ${ex.output}${explanation}`;
      })
      .join("\n\n");
    const constraints = challengeContext.constraints
      .map((c) => `- ${c}`)
      .join("\n");

    return [
      `Problem: ${challengeContext.title}`,
      "Description:",
      challengeContext.description,
      examples ? `Examples:\n${examples}` : "",
      constraints ? `Constraints:\n${constraints}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");
  };

  const handleTemplate = async (templateId: string) => {
    const template = CODE_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;
    
    const promptLanguage = (isChallengeRoute ? challengeLanguage : language) || "javascript";
    const prompt = template.prompt.replace("{{language}}", promptLanguage);
    await sendMessage(prompt);
    setShowTemplates(false);
  };

  const handleQuickAction = async (action: string) => {
    const promptLanguage = (isChallengeRoute ? challengeLanguage : language) || "javascript";
    const code = selectedCode || (isChallengeRoute ? challengeCode : getCode());
    if (!code.trim()) {
      toast.error("No code selected or in editor");
      return;
    }

    const challengeContextText = isChallengeRoute ? buildChallengeContext() : "";
    const contextBlock = challengeContextText ? `${challengeContextText}\n\n` : "";

    let prompt = "";
    switch (action) {
      case "explain":
        prompt = `${contextBlock}Explain this ${promptLanguage} code in detail:\n\`\`\`${promptLanguage}\n${code}\n\`\`\``;
        break;
      case "fix":
        prompt = `${contextBlock}Fix any errors or issues in this ${promptLanguage} code:\n\`\`\`${promptLanguage}\n${code}\n\`\`\``;
        break;
      case "optimize":
        prompt = `${contextBlock}Optimize this ${promptLanguage} code for better performance:\n\`\`\`${promptLanguage}\n${code}\n\`\`\``;
        break;
      case "document":
        prompt = `${contextBlock}Add JSDoc comments to this ${promptLanguage} code:\n\`\`\`${promptLanguage}\n${code}\n\`\`\``;
        break;
      case "test":
        prompt = `${contextBlock}Write unit tests for this ${promptLanguage} code:\n\`\`\`${promptLanguage}\n${code}\n\`\`\``;
        break;
    }
    await sendMessage(prompt);
  };

  const insertToEditor = (content: string) => {
    const code = content.replace(/```[\w]*\n?/g, "").replace(/```/g, "").trim();
    if (!code) return;

    if (isChallengeRoute) {
      const activeContent = challengeCode || "";
      const next = activeContent ? `${activeContent}\n${code}` : code;
      setChallengeCode(next);
    } else {
      const activeContent = useCodeEditorStore.getState().getCode?.() || "";
      updateActiveFileContent(activeContent + "\n" + code);
    }

    toast.success("Code inserted to editor!");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !isStreaming) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  if (!isChatPanelOpen) return null;

  const displayMessages = getSessionMessages();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 h-screen w-[85vw] sm:w-[400px] md:w-[500px] lg:w-[600px] xl:w-[700px] 2xl:w-[800px] max-w-[min(800px,calc(100vw-350px))] bg-[#0a0a0f] border-l border-white/[0.05] shadow-2xl z-50 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.05] bg-[#0d0d12]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">AI Workspace</h2>
              <div className="flex items-center gap-2 text-xs">
                <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400" : isConnected === null ? "bg-yellow-400" : "bg-red-400"}`} />
                <span className="text-gray-400">{isConnected ? "Connected" : isConnected === null ? "Connecting..." : "Disconnected"}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Model Selector */}
            <div className="relative">
              <button 
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a2e] rounded-lg text-sm text-gray-300 hover:bg-[#2a2a3e]"
              >
                <Settings className="w-4 h-4" />
                {AI_MODELS.find(m => m.id === selectedModel)?.name || "Select Model"}
                <ChevronRight className={`w-3 h-3 transition-transform ${showModelDropdown ? "rotate-90" : ""}`} />
              </button>
              {showModelDropdown && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a1a2e] rounded-lg border border-white/10 shadow-xl z-50">
                  {AI_MODELS.map(model => (
                    <button
                      key={model.id}
                      onClick={() => { setSelectedModel(model.id); setShowModelDropdown(false); }}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-white/5 flex justify-between ${selectedModel === model.id ? "text-purple-400" : "text-gray-300"}`}
                    >
                      <span>{model.name}</span>
                      <span className="text-xs text-gray-500">{model.provider}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={toggleChatPanel} className="p-2 hover:bg-white/5 rounded-lg">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Quick Actions */}
            <div className="p-3 border-b border-white/[0.05] bg-[#0d0d12]">
              <div className="flex gap-2 flex-wrap">
                <div className="relative">
                  <button
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a2e] hover:bg-[#2a2a3e] rounded-lg text-xs text-gray-300"
                  >
                    <Wand2 className="w-3 h-3" /> Templates
                  </button>
                  {showTemplates && (
                    <div className="absolute left-0 top-full mt-2 w-40 bg-[#1a1a2e] rounded-lg border border-white/10 shadow-xl z-50">
                      {CODE_TEMPLATES.map(t => (
                        <button
                          key={t.id}
                          onClick={() => handleTemplate(t.id)}
                          className="w-full px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/5"
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button onClick={() => handleQuickAction("explain")} disabled={isStreaming} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg text-xs text-blue-400 disabled:opacity-50">
                  <Sparkles className="w-3 h-3" /> Explain
                </button>
                <button onClick={() => handleQuickAction("fix")} disabled={isStreaming} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-xs text-red-400 disabled:opacity-50">
                  <Wrench className="w-3 h-3" /> Fix
                </button>
                <button onClick={() => handleQuickAction("optimize")} disabled={isStreaming} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 rounded-lg text-xs text-green-400 disabled:opacity-50">
                  <Zap className="w-3 h-3" /> Optimize
                </button>
                <button onClick={() => handleQuickAction("document")} disabled={isStreaming} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg text-xs text-amber-400 disabled:opacity-50">
                  <BookMarked className="w-3 h-3" /> Document
                </button>
                <button onClick={() => handleQuickAction("test")} disabled={isStreaming} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg text-xs text-purple-400 disabled:opacity-50">
                  <FlaskConical className="w-3 h-3" /> Test
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div 
              className="flex-1 overflow-y-auto p-4 space-y-2" 
              style={{ overflowAnchor: "none" }}
            >
              {displayMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-600/20 flex items-center justify-center mb-4">
                    <Sparkles className="w-10 h-10 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">AI Workspace</h3>
                  <p className="text-sm text-gray-400 max-w-md mb-4">
                    Select code and use quick actions, or write code templates. 
                    Generated code will appear in the sidebar.
                  </p>
                </div>
              )}

              {displayMessages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isStreaming={isStreaming && message.id === aiMessageIdRef.current}
                  onInsert={() => insertToEditor(message.content)}
                />
              ))}

              {isStreaming && (
                <div className="flex items-center gap-2 text-gray-400 text-sm ml-8">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/[0.05] bg-[#0d0d12]">
              <div className="flex gap-2">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask AI to write code, explain, fix, or optimize..."
                  disabled={isStreaming || !isConnected}
                  className="flex-1 px-3 py-2 bg-[#1a1a2e] text-white rounded-lg border border-white/10 focus:border-purple-500/50 focus:outline-none resize-none disabled:opacity-50"
                  rows={2}
                />
                {isStreaming ? (
                  <button
                    onClick={() => { openRouterService.abort(); setIsStreaming(false); setAIThinking(false); }}
                    className="px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center"
                  >
                    <StopCircle className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={() => sendMessage(inputValue)}
                    disabled={isStreaming || !inputValue.trim() || !isConnected}
                    className="px-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}