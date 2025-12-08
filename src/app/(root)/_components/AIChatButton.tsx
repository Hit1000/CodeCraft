"use client";
import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { MessageSquareIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function AIChatButton() {
  const { toggleChatPanel, isChatPanelOpen } = useCodeEditorStore();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleChatPanel}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300 ${
        isChatPanelOpen
          ? "bg-gradient-to-r from-purple-500/20 to-pink-600/20 border-purple-500/50 text-purple-400"
          : "bg-gradient-to-r from-purple-500/10 to-pink-600/10 border-purple-500/20 text-purple-400 hover:border-purple-500/40"
      }`}
      title="AI Assistant"
    >
      <MessageSquareIcon className="w-4 h-4" />
      <span className="text-sm font-medium hidden sm:inline">AI Chat</span>
    </motion.button>
  );
}
