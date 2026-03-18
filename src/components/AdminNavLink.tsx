"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Shield, LayoutList } from "lucide-react";
import Link from "next/link";

export default function AdminNavLink() {
  const { user } = useUser();

  const userData = useQuery(
    api.users.getUser,
    user?.id ? { userId: user.id } : "skip"
  );

  const isChallengeAdmin = useQuery(
    api.adminChallenges.isAdmin,
    user?.id ? { userId: user.id } : "skip"
  );

  const isPlatformAdmin = userData?.role === "admin";

  if (!isPlatformAdmin && !isChallengeAdmin) return null;

  return (
    <>
      {isPlatformAdmin && (
        <Link
          href="/admin"
          className="relative group flex items-center gap-2 px-4 py-1.5 rounded-lg text-gray-300 bg-gray-800/50 hover:bg-purple-500/10
          border border-gray-800 hover:border-purple-500/50 transition-all duration-300 shadow-lg overflow-hidden"
        >
          <div
            className="absolute inset-0 bg-gradient-to-r from-purple-500/10
          to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
          />
          <Shield className="w-4 h-4 relative z-10 group-hover:rotate-3 transition-transform" />
          <span className="text-sm font-medium relative z-10 group-hover:text-white transition-colors">
            Admin
          </span>
        </Link>
      )}
      {isChallengeAdmin && (
        <Link
          href="/challenges/admin"
          className="relative group flex items-center gap-2 px-4 py-1.5 rounded-lg text-gray-300 bg-gray-800/50 hover:bg-rose-500/10
          border border-gray-800 hover:border-rose-500/50 transition-all duration-300 shadow-lg overflow-hidden"
        >
          <div
            className="absolute inset-0 bg-gradient-to-r from-rose-500/10
          to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
          />
          <LayoutList className="w-4 h-4 relative z-10 group-hover:rotate-3 transition-transform" />
          <span className="text-sm font-medium relative z-10 group-hover:text-white transition-colors">
            Challenge Admin
          </span>
        </Link>
      )}
    </>
  );
}
