"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { Id } from "../../../../../convex/_generated/dataModel";
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  ChevronDown,
  ChevronUp,
  Loader2,
  MessageSquare,
} from "lucide-react";

export default function ProposalReview() {
  const { user } = useUser();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const pendingProposals = useQuery(
    api.challengeProposals.listPending,
    user?.id ? { userId: user.id } : "skip"
  );

  const allProposals = useQuery(
    api.challengeProposals.listAll,
    user?.id ? { userId: user.id } : "skip"
  );

  const approve = useMutation(api.challengeProposals.approve);
  const reject = useMutation(api.challengeProposals.reject);

  const handleApprove = async (proposalId: Id<"challengeProposals">) => {
    if (!user?.id) return;
    setActionLoading(proposalId);
    try {
      await approve({ userId: user.id, proposalId });
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to approve");
    }
    setActionLoading(null);
  };

  const handleReject = async (proposalId: Id<"challengeProposals">) => {
    if (!user?.id) return;
    setActionLoading(proposalId);
    try {
      await reject({
        userId: user.id,
        proposalId,
        reviewNote: rejectNote || undefined,
      });
      setRejectNote("");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to reject");
    }
    setActionLoading(null);
  };

  const proposals = allProposals ?? [];
  const pendingCount = pendingProposals?.length ?? 0;

  if (!allProposals) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
      </div>
    );
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-3.5 h-3.5 text-amber-400" />;
      case "approved": return <CheckCircle className="w-3.5 h-3.5 text-green-400" />;
      case "rejected": return <XCircle className="w-3.5 h-3.5 text-red-400" />;
      default: return null;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-500/20 text-amber-300";
      case "approved": return "bg-green-500/20 text-green-300";
      case "rejected": return "bg-red-500/20 text-red-300";
      default: return "bg-gray-700/50 text-gray-400";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-white">
          Community Proposals ({proposals.length})
        </h3>
        {pendingCount > 0 && (
          <span className="text-xs px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded-full">
            {pendingCount} pending
          </span>
        )}
      </div>

      {proposals.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-sm border border-gray-800/30 rounded-xl">
          No proposals yet.
        </div>
      ) : (
        <div className="space-y-3">
          {proposals.map((p) => (
            <div
              key={p._id}
              className={`border rounded-xl overflow-hidden transition-colors ${
                p.status === "pending"
                  ? "border-amber-500/30 bg-amber-500/5"
                  : "border-gray-800/50 bg-gray-900/20"
              }`}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer"
                onClick={() => setExpandedId(expandedId === p._id ? null : p._id)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {statusIcon(p.status)}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor(p.status)}`}>
                      {p.status}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white">{p.title}</h4>
                    <span className="text-xs text-gray-500">
                      by {p.proposerName} · {p.category}/{p.subcategory} · {p.difficulty} · {new Date(p.proposedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {expandedId === p._id ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </div>

              {/* Expanded details */}
              {expandedId === p._id && (
                <div className="px-4 pb-4 border-t border-gray-800/30 space-y-4 pt-4">
                  {/* Description preview */}
                  <div>
                    <h5 className="text-xs font-medium text-gray-400 mb-2">Description</h5>
                    <div className="bg-gray-900/60 rounded-lg p-3 text-xs text-gray-300 max-h-40 overflow-y-auto whitespace-pre-wrap font-mono">
                      {p.description.substring(0, 500)}{p.description.length > 500 ? "..." : ""}
                    </div>
                  </div>

                  {/* Quick stats */}
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-gray-800/30 rounded-lg p-2.5 text-center">
                      <div className="text-xs text-gray-400">Examples</div>
                      <div className="text-sm text-white font-medium">{p.examples.length}</div>
                    </div>
                    <div className="bg-gray-800/30 rounded-lg p-2.5 text-center">
                      <div className="text-xs text-gray-400">Test Cases</div>
                      <div className="text-sm text-white font-medium">{p.testCases.length}</div>
                    </div>
                    <div className="bg-gray-800/30 rounded-lg p-2.5 text-center">
                      <div className="text-xs text-gray-400">Languages</div>
                      <div className="text-sm text-white font-medium">
                        {Object.values(p.starterCode).filter(Boolean).length}
                      </div>
                    </div>
                    <div className="bg-gray-800/30 rounded-lg p-2.5 text-center">
                      <div className="text-xs text-gray-400">Tags</div>
                      <div className="text-sm text-white font-medium">{p.tags.length}</div>
                    </div>
                  </div>

                  {/* Review note if already reviewed */}
                  {p.reviewNote && (
                    <div className="flex items-start gap-2 bg-gray-800/30 rounded-lg p-3">
                      <MessageSquare className="w-3.5 h-3.5 text-gray-500 mt-0.5" />
                      <span className="text-xs text-gray-400">{p.reviewNote}</span>
                    </div>
                  )}

                  {/* Actions for pending */}
                  {p.status === "pending" && (
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => handleApprove(p._id)}
                        disabled={actionLoading === p._id}
                        className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                      >
                        {actionLoading === p._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle className="w-3.5 h-3.5" />
                        )}
                        Approve
                      </button>
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          value={rejectNote}
                          onChange={(e) => setRejectNote(e.target.value)}
                          placeholder="Rejection reason (optional)..."
                          className="flex-1 bg-gray-900/60 border border-gray-700/50 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-red-500/50"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button
                          onClick={() => handleReject(p._id)}
                          disabled={actionLoading === p._id}
                          className="flex items-center gap-1.5 px-4 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
