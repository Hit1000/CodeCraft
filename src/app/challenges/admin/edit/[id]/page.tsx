"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import AdminGuard from "../../_components/AdminGuard";
import ProblemForm from "../../_components/ProblemForm";
import NavigationHeader from "@/components/NavigationHeader";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Id } from "../../../../../../convex/_generated/dataModel";

export default function EditChallengePage() {
  const { user } = useUser();
  const router = useRouter();
  const params = useParams();
  const challengeId = params.id as string;
  const [isLoading, setIsLoading] = useState(false);

  const challenge = useQuery(
    api.adminChallenges.getFullChallenge,
    user?.id && challengeId
      ? { userId: user.id, challengeId: challengeId as Id<"challenges"> }
      : "skip"
  );

  const updateChallenge = useMutation(api.adminChallenges.updateChallenge);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (data: Record<string, any>) => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      await updateChallenge({
        userId: user.id,
        challengeId: challengeId as Id<"challenges">,
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
        order: data.order,
        isPremium: data.isPremium,
        isPublished: data.isPublished,
      });
      router.push("/challenges/admin");
    } catch (e) {
      console.error("Failed to update challenge:", e);
      alert(e instanceof Error ? e.message : "Failed to update challenge");
    } finally {
      setIsLoading(false);
    }
  };

  if (!challenge) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-gray-950">
          <NavigationHeader />
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
          </div>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-950">
        <NavigationHeader />

        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
          <button
            onClick={() => router.push("/challenges/admin")}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <h1 className="text-2xl font-bold text-white mb-2">Edit Challenge</h1>
          <p className="text-sm text-gray-400 mb-8">
            Editing: <span className="text-white font-medium">{challenge.title}</span>
          </p>

          <ProblemForm
            mode="edit"
            initialData={challenge}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>
    </AdminGuard>
  );
}
