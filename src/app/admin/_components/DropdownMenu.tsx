"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

interface DropdownMenuProps {
  isOpen: boolean;
  triggerRef: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
  onClose: () => void;
}

export default function DropdownMenu({ isOpen, triggerRef, children, onClose }: DropdownMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const menuHeight = 250; // approximate
      const spaceBelow = window.innerHeight - rect.bottom;

      // If not enough space below, flip upward
      const top = spaceBelow < menuHeight ? rect.top - menuHeight - 8 : rect.bottom + 8;

      setStyle({
        position: "fixed",
        top,
        right: window.innerWidth - rect.right,
        zIndex: 9999,
      });
    }
  }, [isOpen, triggerRef]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (triggerRef.current?.contains(e.target as Node)) return;
      if (menuRef.current?.contains(e.target as Node)) return;
      onClose();
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, onClose, triggerRef]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          style={style}
          className="w-56 bg-gray-800 border border-gray-700/50 rounded-xl shadow-xl overflow-hidden"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
