import Link from "next/link";
import DifficultyBadge from "./DifficultyBadge";
import { CheckCircle2, Circle, Bookmark, ThumbsUp, BarChart3 } from "lucide-react";

interface ChallengeCardProps {
  challenge: {
    _id: string;
    title: string;
    slug: string;
    difficulty: "Easy" | "Medium" | "Hard";
    category: string;
    subcategory: string;
    tags: string[];
    acceptanceRate: number;
    totalSubmissions: number;
    likes: number;
    order: number;
    isPremium: boolean;
  };
  status?: "solved" | "attempted" | "bookmarked" | null;
}

export default function ChallengeCard({ challenge, status }: ChallengeCardProps) {
  return (
    <Link
      href={`/challenges/${challenge.slug}`}
      className="group relative block rounded-xl border border-gray-800/60 bg-gradient-to-br from-gray-900/80 to-gray-950/80 
        hover:border-blue-500/30 hover:from-gray-900/90 hover:to-gray-900/60 transition-all duration-300 overflow-hidden"
    >
      {/* Hover glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Premium badge */}
      {challenge.isPremium && (
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-semibold uppercase tracking-wider">
          Pro
        </div>
      )}

      <div className="relative p-5">
        {/* Header row */}
        <div className="flex items-start gap-3 mb-3">
          {/* Status icon */}
          <div className="mt-0.5 flex-shrink-0">
            {status === "solved" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : status === "attempted" ? (
              <Circle className="w-5 h-5 text-amber-400" strokeDasharray="4 2" />
            ) : status === "bookmarked" ? (
              <Bookmark className="w-5 h-5 text-blue-400 fill-blue-400" />
            ) : (
              <Circle className="w-5 h-5 text-gray-600" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-500 font-mono">#{challenge.order}</span>
              <DifficultyBadge difficulty={challenge.difficulty} />
            </div>
            <h3 className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors truncate">
              {challenge.title}
            </h3>
          </div>
        </div>

        {/* Category */}
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-0.5 rounded-md bg-gray-800/80 text-[11px] font-medium text-gray-400 border border-gray-700/50">
            {challenge.category}
          </span>
          <span className="text-[11px] text-gray-500">{challenge.subcategory}</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {challenge.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-md bg-blue-500/8 text-[10px] font-medium text-blue-400/70 border border-blue-500/10"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 pt-3 border-t border-gray-800/50">
          <div className="flex items-center gap-1.5 text-gray-500">
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="text-[11px]">{challenge.acceptanceRate}%</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500">
            <ThumbsUp className="w-3.5 h-3.5" />
            <span className="text-[11px]">{challenge.likes}</span>
          </div>
          {challenge.totalSubmissions > 0 && (
            <span className="text-[11px] text-gray-600 ml-auto">
              {challenge.totalSubmissions.toLocaleString()} submissions
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
