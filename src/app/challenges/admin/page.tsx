"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import AdminGuard from "./_components/AdminGuard";
import ProposalReview from "./_components/ProposalReview";
import UserManagement from "./_components/UserManagement";
import NavigationHeader from "@/components/NavigationHeader";
import {
  Plus,
  Trash2,
  Pencil,
  Eye,
  EyeOff,
  Shield,
  Loader2,
  Search,
  LayoutList,
  Lightbulb,
  Users,
} from "lucide-react";

type Tab = "challenges" | "proposals" | "users";

export default function AdminDashboard() {
  const { user } = useUser();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [bootstrapping, setBootstrapping] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("challenges");

  const ensureUser = useMutation(api.users.ensureUser);

  // Sync user to Convex
  useEffect(() => {
    if (user?.id && user?.primaryEmailAddress?.emailAddress) {
      ensureUser({
        userId: user.id,
        email: user.primaryEmailAddress.emailAddress,
        name: user.fullName || user.firstName || "User",
      }).catch(() => {});
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const challenges = useQuery(
    api.adminChallenges.listAll,
    user?.id ? { userId: user.id } : "skip"
  );

  const isAdmin = useQuery(
    api.adminChallenges.isAdmin,
    user?.id ? { userId: user.id } : "skip"
  );

  const pendingProposals = useQuery(
    api.challengeProposals.listPending,
    user?.id ? { userId: user.id } : "skip"
  );

  const bootstrapAdmin = useMutation(api.adminChallenges.bootstrapAdmin);
  const deleteChallenge = useMutation(api.adminChallenges.deleteChallenge);

  const handleBootstrap = async () => {
    if (!user?.id) return;
    setBootstrapping(true);
    try {
      await bootstrapAdmin({ userId: user.id });
    } catch (e) {
      console.error(e);
    }
    setBootstrapping(false);
  };

  const handleDelete = async (challengeId: string) => {
    if (!user?.id) return;
    if (!confirm("Are you sure you want to delete this challenge? This will also delete all submissions and progress.")) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await deleteChallenge({ userId: user.id, challengeId: challengeId as any });
  };

  const filtered = challenges?.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.includes(search.toLowerCase())
  );

  const pendingCount = pendingProposals?.length ?? 0;

  // Bootstrap screen
  if (isAdmin === false && user?.id) {
    return (
      <div className="min-h-screen bg-gray-950">
        <NavigationHeader />
        <div className="max-w-2xl mx-auto py-20 px-4 text-center space-y-6">
          <Shield className="w-16 h-16 text-amber-400 mx-auto" />
          <h1 className="text-2xl font-bold text-white">Admin Setup Required</h1>
          <p className="text-gray-400">
            No admin has been set up yet. Click below to make yourself the first admin.
          </p>
          <button
            onClick={handleBootstrap}
            disabled={bootstrapping}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            {bootstrapping ? "Setting up..." : "Make Me Admin"}
          </button>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "challenges", label: "Challenges", icon: <LayoutList className="w-4 h-4" /> },
    { id: "proposals", label: "Proposals", icon: <Lightbulb className="w-4 h-4" />, badge: pendingCount },
    { id: "users", label: "Users", icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-950">
        <NavigationHeader />

        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Challenge Admin</h1>
              <p className="text-sm text-gray-400 mt-1">
                Manage challenges, review proposals, and configure users
              </p>
            </div>
            {activeTab === "challenges" && (
              <button
                onClick={() => router.push("/challenges/admin/create")}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Challenge
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-gray-900/40 rounded-xl p-1 w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-gray-800 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-amber-500/20 text-amber-300 rounded-full font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === "challenges" && (
            <>
              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search challenges..."
                  className="w-full bg-gray-900/60 border border-gray-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                />
              </div>

              {/* Table */}
              {!challenges ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                </div>
              ) : filtered && filtered.length > 0 ? (
                <div className="border border-gray-800/50 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-900/50 border-b border-gray-800/50">
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">#</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Title</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Difficulty</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Submissions</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/30">
                      {filtered.map((challenge) => (
                        <tr key={challenge._id} className="hover:bg-gray-800/20 transition-colors">
                          <td className="px-4 py-3 text-sm text-gray-500 font-mono">{challenge.order}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-white font-medium">{challenge.title}</span>
                              <span className="text-[10px] text-gray-600 font-mono">/{challenge.slug}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-gray-400">{challenge.category} / {challenge.subcategory}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                challenge.difficulty === "Easy"
                                  ? "bg-emerald-500/20 text-emerald-300"
                                  : challenge.difficulty === "Medium"
                                    ? "bg-amber-500/20 text-amber-300"
                                    : "bg-red-500/20 text-red-300"
                              }`}
                            >
                              {challenge.difficulty}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {challenge.isPublished !== false ? (
                              <span className="flex items-center gap-1 text-xs text-green-400">
                                <Eye className="w-3 h-3" /> Published
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-xs text-gray-500">
                                <EyeOff className="w-3 h-3" /> Draft
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-400">
                            {challenge.totalSubmissions} ({challenge.acceptanceRate}%)
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => router.push(`/challenges/admin/edit/${challenge._id}`)}
                                className="p-2 text-gray-500 hover:text-blue-400 transition-colors rounded-lg hover:bg-gray-800/50"
                                title="Edit"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(challenge._id)}
                                className="p-2 text-gray-500 hover:text-red-400 transition-colors rounded-lg hover:bg-gray-800/50"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  {search ? "No challenges match your search." : "No challenges yet. Create your first one!"}
                </div>
              )}
            </>
          )}

          {activeTab === "proposals" && <ProposalReview />}
          {activeTab === "users" && <UserManagement />}
        </div>
      </div>
    </AdminGuard>
  );
}
