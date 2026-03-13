"use client";

import Link from "next/link";
import DifficultyBadge from "../../_components/DifficultyBadge";
import { ArrowLeft, ChevronLeft, ChevronRight, Bookmark, BookmarkCheck } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Id } from "../../../../../convex/_generated/dataModel";

interface ProblemNavbarProps {
  challenge: {
    _id: Id<"challenges">;
    title: string;
    difficulty: "Easy" | "Medium" | "Hard";
    order: number;
    category: string;
  };
  isBookmarked: boolean;
  prevSlug?: string | null;
  nextSlug?: string | null;
}

export default function ProblemNavbar({ challenge, isBookmarked, prevSlug, nextSlug }: ProblemNavbarProps) {
  const { user } = useUser();
  const toggleBookmark = useMutation(api.challenges.toggleBookmark);

  const handleBookmark = async () => {
    if (!user?.id) return;
    await toggleBookmark({ userId: user.id, challengeId: challenge._id });
  };

  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-gray-900/90 backdrop-blur-xl border-b border-gray-800/50">
      <div className="flex items-center gap-4">
        <Link
          href="/challenges"
          className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </Link>

        <div className="h-5 w-px bg-gray-800" />

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 font-mono">#{challenge.order}</span>
          <h1 className="text-sm font-semibold text-white">{challenge.title}</h1>
          <DifficultyBadge difficulty={challenge.difficulty} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleBookmark}
          className={`p-2 rounded-lg transition-all duration-300 ${
            isBookmarked
              ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
              : "text-gray-400 hover:text-white hover:bg-gray-800/50 border border-transparent"
          }`}
        >
          {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        </button>

        <div className="flex items-center gap-1 ml-2">
          {prevSlug ? (
            <Link
              href={`/challenges/${prevSlug}`}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
          ) : (
            <span className="p-1.5 text-gray-700">
              <ChevronLeft className="w-4 h-4" />
            </span>
          )}
          {nextSlug ? (
            <Link
              href={`/challenges/${nextSlug}`}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <span className="p-1.5 text-gray-700">
              <ChevronRight className="w-4 h-4" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
