"use client";

import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AdminGuard from "../_components/AdminGuard";
import ProblemForm from "../_components/ProblemForm";
import NavigationHeader from "@/components/NavigationHeader";
import { ArrowLeft } from "lucide-react";

export default function CreateChallengePage() {
  const { user } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const createChallenge = useMutation(api.adminChallenges.createChallenge);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (data: Record<string, any>) => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      await createChallenge({
        userId: user.id,
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
      console.error("Failed to create challenge:", e);
      alert(e instanceof Error ? e.message : "Failed to create challenge");
    } finally {
      setIsLoading(false);
    }
  };

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

          <h1 className="text-2xl font-bold text-white mb-8">Create New Challenge</h1>

          <ProblemForm
            mode="create"
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>
    </AdminGuard>
  );
}
