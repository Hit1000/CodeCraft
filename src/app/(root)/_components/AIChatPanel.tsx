"use client";
import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { getOllamaService } from "@/lib/ai/ollama-service";
import { AIMessage } from "@/lib/ai/types";
import { XIcon, SendIcon, SparklesIcon, WrenchIcon, ZapIcon, Loader2Icon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import toast from "react-hot-toast";

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
  } = useCodeEditorStore();

  const [inputValue, setInputValue] = useState("");
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const ollamaService = getOllamaService();

  // Check Ollama connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      const connected = await ollamaService.checkConnection();
      setIsConnected(connected);
      if (!connected) {
        toast.error("Ollama is not running. Please start Ollama service.");
      }
    };
    checkConnection();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const sendMessage = async (content: string, isUserMessage = true) => {
    if (!content.trim()) return;

    if (isUserMessage) {
      const userMessage: AIMessage = {
        id: Date.now().toString(),
        role: "user",
        content,
        timestamp: Date.now(),
      };
      addChatMessage(userMessage);
      setInputValue("");
    }

    setAIThinking(true);

    try {
      const messages = chatMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      if (isUserMessage) {
        messages.push({ role: "user", content });
      }

      let aiResponse = "";
      const aiMessageId = Date.now().toString() + "-ai";

      // Create placeholder message
      const placeholderMessage: AIMessage = {
        id: aiMessageId,
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      };
      addChatMessage(placeholderMessage);

      // Stream response
      for await (const chunk of ollamaService.chat(messages)) {
        aiResponse += chunk;

        // Update the message with streamed content
        const updatedMessage: AIMessage = {
          id: aiMessageId,
          role: "assistant",
          content: aiResponse,
          timestamp: Date.now(),
        };

        // Replace the placeholder/last message with updated content
        useCodeEditorStore.setState((state) => ({
          chatMessages: [
            ...state.chatMessages.slice(0, -1),
            updatedMessage,
          ],
        }));
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to get AI response. Is Ollama running?");
    } finally {
      setAIThinking(false);
    }
  };

  const handleQuickAction = async (action: "explain" | "fix" | "optimize") => {
    const code = selectedCode || getCode();
    
    if (!code.trim()) {
      toast.error("No code selected or in editor");
      return;
    }

    let prompt = "";
    switch (action) {
      case "explain":
        prompt = `Explain this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``;
        break;
      case "fix":
        prompt = `Fix any errors or issues in this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``;
        break;
      case "optimize":
        prompt = `Optimize this ${language} code for better performance:\n\n\`\`\`${language}\n${code}\n\`\`\``;
        break;
    }

    await sendMessage(prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  if (!isChatPanelOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 h-screen w-full sm:w-[450px] bg-[#0a0a0f]/95 backdrop-blur-xl border-l border-white/[0.05] shadow-2xl z-50 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.05]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">AI Assistant</h2>
              <p className="text-xs text-gray-400 flex items-center gap-1.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isConnected ? "bg-green-400" : "bg-red-400"
                  }`}
                />
                {isConnected ? "Connected" : "Disconnected"}
              </p>
            </div>
          </div>
          <button
            onClick={toggleChatPanel}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <XIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="p-3 border-b border-white/[0.05]">
          <div className="flex gap-2">
            <button
              onClick={() => handleQuickAction("explain")}
              disabled={isAIThinking}
              className="flex-1 flex items-center gap-1.5 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg text-xs text-blue-400 transition-colors disabled:opacity-50"
            >
              <SparklesIcon className="w-3.5 h-3.5" />
              Explain
            </button>
            <button
              onClick={() => handleQuickAction("fix")}
              disabled={isAIThinking}
              className="flex-1 flex items-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-xs text-red-400 transition-colors disabled:opacity-50"
            >
              <WrenchIcon className="w-3.5 h-3.5" />
              Fix
            </button>
            <button
              onClick={() => handleQuickAction("optimize")}
              disabled={isAIThinking}
              className="flex-1 flex items-center gap-1.5 px-3 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 rounded-lg text-xs text-green-400 transition-colors disabled:opacity-50"
            >
              <ZapIcon className="w-3.5 h-3.5" />
              Optimize
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-600/20 flex items-center justify-center mb-4">
                <SparklesIcon className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">AI Assistant Ready</h3>
              <p className="text-sm text-gray-400 max-w-xs">
                Select code and use quick actions, or ask me anything about your code!
              </p>
            </div>
          )}

          {chatMessages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {isAIThinking && (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Loader2Icon className="w-4 h-4 animate-spin" />
              <span>AI is thinking...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/[0.05]">
          <div className="flex gap-2">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask anything about your code..."
              disabled={isAIThinking || !isConnected}
              className="flex-1 px-3 py-2 bg-[#1e1e2e] text-white rounded-lg border border-white/10 focus:border-blue-500/50 focus:outline-none resize-none disabled:opacity-50"
              rows={2}
            />
            <button
              onClick={() => sendMessage(inputValue)}
              disabled={isAIThinking || !inputValue.trim() || !isConnected}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isAIThinking ? (
                <Loader2Icon className="w-5 h-5 animate-spin" />
              ) : (
                <SendIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
