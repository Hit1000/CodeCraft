"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import ProblemForm from "../admin/_components/ProblemForm";
import NavigationHeader from "@/components/NavigationHeader";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  Lightbulb,
  Loader2,
  LogIn,
} from "lucide-react";
import Link from "next/link";

export default function ProposePage() {
  const { user, isLoaded } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const propose = useMutation(api.challengeProposals.propose);
  const ensureUser = useMutation(api.users.ensureUser);

  const myProposals = useQuery(
    api.challengeProposals.getUserProposals,
    user?.id ? { userId: user.id } : "skip"
  );

  // Auto-sync user to Convex on load
  useEffect(() => {
    if (user?.id && user?.primaryEmailAddress?.emailAddress) {
      ensureUser({
        userId: user.id,
        email: user.primaryEmailAddress.emailAddress,
        name: user.fullName || user.firstName || "User",
      }).catch(() => {}); // Silent — user may already exist
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (data: Record<string, any>) => {
    if (!user?.id) return;
    setIsSubmitting(true);
    try {
      await propose({
        userId: user.id,
        userName: user.fullName || user.firstName || "Anonymous",
        title: data.title,
        slug: data.slug,
        difficulty: data.difficulty,
        category: data.category,
        subcategory: data.subcategory,
        tags: data.tags,
        description: data.description,
        examples: data.examples,
        constraints: data.constraints,
        starterCode: data.starterCode,
        driverCode: data.driverCode,
        testCases: data.testCases,
        hints: data.hints,
        editorial: data.editorial,
        timeLimit: data.timeLimit,
        memoryLimit: data.memoryLimit,
      });
      setSubmitted(true);
      setShowForm(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to submit proposal");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-950">
        <NavigationHeader />
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950">
        <NavigationHeader />
        <div className="max-w-2xl mx-auto py-20 px-4 text-center space-y-6">
          <LogIn className="w-16 h-16 text-blue-400 mx-auto" />
          <h1 className="text-2xl font-bold text-white">Sign In Required</h1>
          <p className="text-gray-400">Please sign in to propose a challenge.</p>
        </div>
      </div>
    );
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4 text-amber-400" />;
      case "approved": return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "rejected": return <XCircle className="w-4 h-4 text-red-400" />;
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
    <div className="min-h-screen bg-gray-950">
      <NavigationHeader />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Lightbulb className="w-7 h-7 text-amber-400" />
              Propose a Challenge
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Submit your own problem for the community. An admin will review it before it goes live.
            </p>
          </div>
          {!showForm && !submitted && (
            <button
              onClick={() => setShowForm(true)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
              + New Proposal
            </button>
          )}
        </div>

        {/* Success message */}
        {submitted && (
          <div className="mb-8 border border-green-500/30 bg-green-500/10 rounded-xl p-6 text-center space-y-3">
            <CheckCircle className="w-10 h-10 text-green-400 mx-auto" />
            <h2 className="text-lg font-semibold text-white">Proposal Submitted!</h2>
            <p className="text-sm text-gray-400">
              Your challenge has been submitted for review. An admin will approve or reject it soon.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => { setSubmitted(false); setShowForm(true); }}
                className="px-4 py-2 bg-gray-800 text-gray-300 text-sm rounded-lg hover:bg-gray-700 transition-colors"
              >
                Submit Another
              </button>
              <Link
                href="/challenges"
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Challenges
              </Link>
            </div>
          </div>
        )}

        {/* Proposal form */}
        {showForm && (
          <div className="mb-8">
            <button
              onClick={() => setShowForm(false)}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <ProblemForm
              mode="create"
              onSubmit={handleSubmit}
              isLoading={isSubmitting}
            />
          </div>
        )}

        {/* My proposals */}
        {!showForm && !submitted && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">My Proposals</h2>
            {!myProposals ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
              </div>
            ) : myProposals.length > 0 ? (
              <div className="space-y-3">
                {myProposals.map((p) => (
                  <div
                    key={p._id}
                    className="border border-gray-800/50 bg-gray-900/30 rounded-xl p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {statusIcon(p.status)}
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColor(p.status)}`}>
                          {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-white">{p.title}</h3>
                        <span className="text-xs text-gray-500">
                          {p.category} / {p.subcategory} · {p.difficulty} · {new Date(p.proposedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {p.reviewNote && (
                      <span className="text-xs text-gray-500 max-w-xs truncate" title={p.reviewNote}>
                        {p.reviewNote}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 text-sm border border-gray-800/30 rounded-xl">
                You haven&apos;t proposed any challenges yet. Click &quot;New Proposal&quot; to get started!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
