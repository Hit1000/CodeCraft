"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Shield, ShieldOff, Loader2 } from "lucide-react";

export default function UserManagement() {
  const { user } = useUser();
  const [grantingId, setGrantingId] = useState<string | null>(null);

  const allUsers = useQuery(api.users.listAllUsers);
  const admins = useQuery(api.adminChallenges.listAdmins);

  const grantAdmin = useMutation(api.adminChallenges.grantAdmin);
  const revokeAdmin = useMutation(api.adminChallenges.revokeAdmin);

  const adminUserIds = new Set(admins?.map((a) => a.userId) ?? []);

  const handleToggleAdmin = async (targetUserId: string) => {
    if (!user?.id) return;
    setGrantingId(targetUserId);
    try {
      if (adminUserIds.has(targetUserId)) {
        await revokeAdmin({ granterId: user.id, targetUserId });
      } else {
        await grantAdmin({ granterId: user.id, targetUserId, role: "admin" });
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to update role");
    }
    setGrantingId(null);
  };

  if (!allUsers || !admins) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-white">
          All Users ({allUsers.length})
        </h3>
        <span className="text-xs text-gray-500">
          {admins.length} admin{admins.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="border border-gray-800/50 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-900/50 border-b border-gray-800/50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Pro</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/30">
            {allUsers.map((u) => {
              const isAdminUser = adminUserIds.has(u.userId);
              const isSelf = u.userId === user?.id;

              return (
                <tr key={u._id} className="hover:bg-gray-800/20 transition-colors">
                  <td className="px-4 py-3 text-sm text-white font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{u.email}</td>
                  <td className="px-4 py-3">
                    {u.isPro ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">Pro</span>
                    ) : (
                      <span className="text-xs text-gray-600">Free</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isAdminUser ? (
                      <span className="flex items-center gap-1 text-xs text-blue-400">
                        <Shield className="w-3 h-3" />
                        Admin
                      </span>
                    ) : (
                      <span className="text-xs text-gray-600">User</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {isSelf ? (
                      <span className="text-xs text-gray-600">You</span>
                    ) : (
                      <button
                        onClick={() => handleToggleAdmin(u.userId)}
                        disabled={grantingId === u.userId}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors ml-auto ${
                          isAdminUser
                            ? "border border-red-500/30 text-red-400 hover:bg-red-500/10"
                            : "border border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                        } disabled:opacity-50`}
                      >
                        {grantingId === u.userId ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : isAdminUser ? (
                          <>
                            <ShieldOff className="w-3 h-3" />
                            Revoke
                          </>
                        ) : (
                          <>
                            <Shield className="w-3 h-3" />
                            Make Admin
                          </>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
