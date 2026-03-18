"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useState, useCallback, useRef } from "react";
import { Loader2, Shield, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DropdownMenu from "./DropdownMenu";

type UserRole = "user" | "moderator" | "admin";
type FilterRole = "all" | "admin" | "challenge_admin" | "challenge_moderator" | "blocked" | "pro" | "user";

interface UserWithRoles {
  _id: string;
  userId: string;
  name: string;
  email: string;
  isPro: boolean;
  isCheater?: boolean;
  role?: UserRole;
  challengeRole: string | null;
}

interface DropdownCellProps {
  userItem: UserWithRoles;
  actions: { label: string; action: string; danger?: boolean }[];
  isProcessing: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onAction: (userItem: UserWithRoles, action: string) => void;
}

function DropdownCell({ userItem, actions, isProcessing, isOpen, onToggle, onClose, onAction }: DropdownCellProps) {
  const triggerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex justify-end">
      <div ref={triggerRef}>
        <button
          onClick={onToggle}
          disabled={isProcessing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-gray-700/50 text-gray-400
            hover:text-white hover:border-gray-600 transition-all disabled:opacity-50"
        >
          {isProcessing ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Users className="w-3 h-3" />
          )}
          Manage
        </button>
      </div>

      <DropdownMenu isOpen={isOpen} triggerRef={triggerRef} onClose={onClose}>
        {actions.map((a) => (
          <button
            key={a.action}
            onClick={() => {
              if (a.action !== "none") onAction(userItem, a.action);
            }}
            disabled={a.action === "none"}
            className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
              a.danger
                ? "text-red-400 hover:bg-red-500/10"
                : a.action === "none"
                  ? "text-gray-600 cursor-default"
                  : "text-gray-300 hover:bg-gray-700/50"
            }`}
          >
            {a.label}
          </button>
        ))}
      </DropdownMenu>
    </div>
  );
}

export default function AdminUsersContent() {
  const { user } = useUser();
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<FilterRole>("all");
  const [processingUsers, setProcessingUsers] = useState<Set<string>>(new Set());
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const usersWithRoles = useQuery(
    api.users.listAllUsersWithRoles,
    user?.id ? { adminId: user.id } : "skip"
  );

  const setUserPlatformRole = useMutation(api.users.setUserPlatformRole);
  const grantChallengeRole = useMutation(api.adminChallenges.grantAdmin);
  const revokeChallengeRole = useMutation(api.adminChallenges.revokeAdmin);
  const blockUser = useMutation(api.users.blockUser);
  const setUserPro = useMutation(api.users.setUserPro);

  const setProcessing = useCallback((userId: string, active: boolean) => {
    setProcessingUsers((prev) => {
      const next = new Set(prev);
      if (active) next.add(userId);
      else next.delete(userId);
      return next;
    });
  }, []);

  const handleAction = useCallback(
    async (userItem: UserWithRoles, action: string) => {
      if (!user?.id) return;
      setProcessing(userItem.userId, true);
      setOpenDropdown(null);

      try {
        const adminId = user.id;
        const targetUserId = userItem.userId;

        switch (action) {
          case "make_platform_admin":
            await setUserPlatformRole({ adminId, targetUserId, role: "admin" });
            break;
          case "revoke_platform_admin":
            await setUserPlatformRole({ adminId, targetUserId, role: "user" });
            break;
          case "make_challenge_admin":
            await grantChallengeRole({ granterId: adminId, targetUserId, role: "admin" });
            break;
          case "make_challenge_moderator":
            await grantChallengeRole({ granterId: adminId, targetUserId, role: "moderator" });
            break;
          case "revoke_challenge_admin":
          case "revoke_challenge_moderator":
            await revokeChallengeRole({ granterId: adminId, targetUserId });
            break;
          case "block":
            await blockUser({ adminId, targetUserId, blocked: true });
            break;
          case "unblock":
            await blockUser({ adminId, targetUserId, blocked: false });
            break;
          case "grant_pro":
            await setUserPro({ adminId, targetUserId, isPro: true });
            break;
          case "revoke_pro":
            await setUserPro({ adminId, targetUserId, isPro: false });
            break;
        }
      } catch (error) {
        alert(error instanceof Error ? error.message : "Action failed");
      }
      setProcessing(userItem.userId, false);
    },
    [user?.id, setUserPlatformRole, grantChallengeRole, revokeChallengeRole, blockUser, setUserPro, setProcessing]
  );

  const getAvailableActions = (userItem: UserWithRoles): { label: string; action: string; danger?: boolean }[] => {
    const actions: { label: string; action: string; danger?: boolean }[] = [];
    const isPlatformAdmin = userItem.role === "admin";
    const hasChallengeAdmin = userItem.challengeRole === "admin";
    const hasChallengeMod = userItem.challengeRole === "moderator";
    const isBlocked = userItem.isCheater === true;
    const isSelf = userItem.userId === user?.id;

    if (isSelf) return [{ label: "You (can't modify)", action: "none" }];

    if (isPlatformAdmin) {
      actions.push({ label: "Revoke Platform Admin", action: "revoke_platform_admin", danger: true });
    } else {
      actions.push({ label: "Make Platform Admin", action: "make_platform_admin" });
    }

    if (hasChallengeAdmin) {
      actions.push({ label: "Revoke Challenge Admin", action: "revoke_challenge_admin", danger: true });
    } else if (hasChallengeMod) {
      actions.push({ label: "Revoke Moderator", action: "revoke_challenge_moderator", danger: true });
      actions.push({ label: "Upgrade to Challenge Admin", action: "make_challenge_admin" });
    } else {
      actions.push({ label: "Make Challenge Admin", action: "make_challenge_admin" });
      actions.push({ label: "Make Moderator", action: "make_challenge_moderator" });
    }

    if (userItem.isPro) {
      actions.push({ label: "Revoke Pro", action: "revoke_pro", danger: true });
    } else {
      actions.push({ label: "Grant Pro", action: "grant_pro" });
    }

    if (isBlocked) {
      actions.push({ label: "Unblock User", action: "unblock" });
    } else {
      actions.push({ label: "Block User", action: "block", danger: true });
    }

    return actions;
  };

  const getRoleBadge = (userItem: UserWithRoles) => {
    if (userItem.role === "admin") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-500/20 text-purple-300 border border-purple-500/20">
          <Shield className="w-3 h-3" /> Admin
        </span>
      );
    }
    if (userItem.challengeRole === "admin") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/20 text-blue-300 border border-blue-500/20">
          <Shield className="w-3 h-3" /> Challenge Admin
        </span>
      );
    }
    if (userItem.challengeRole === "moderator") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-500/20 text-green-300 border border-green-500/20">
          Moderator
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-500/20 text-gray-400">
        User
      </span>
    );
  };

  const getStatusBadge = (userItem: UserWithRoles) => {
    if (userItem.isCheater) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-500/20 text-red-300 border border-red-500/20">
          Blocked
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/20 text-emerald-300">
        Active
      </span>
    );
  };

  const filteredUsers = usersWithRoles?.filter((u) => {
    const matchesSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    switch (filterRole) {
      case "admin":
        return u.role === "admin";
      case "challenge_admin":
        return u.challengeRole === "admin" && u.role !== "admin";
      case "challenge_moderator":
        return u.challengeRole === "moderator";
      case "blocked":
        return u.isCheater === true;
      case "pro":
        return u.isPro === true;
      case "user":
        return u.role !== "admin" && !u.challengeRole && !u.isCheater;
      default:
        return true;
    }
  });

  const filterOptions: { value: FilterRole; label: string }[] = [
    { value: "all", label: "All Users" },
    { value: "admin", label: "Admins" },
    { value: "challenge_admin", label: "Challenge Admins" },
    { value: "challenge_moderator", label: "Moderators" },
    { value: "pro", label: "Pro Users" },
    { value: "blocked", label: "Blocked" },
    { value: "user", label: "Regular Users" },
  ];

  if (!usersWithRoles) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4">
          <div className="text-2xl font-bold text-white">{usersWithRoles.length}</div>
          <div className="text-xs text-gray-400 mt-1">Total Users</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4">
          <div className="text-2xl font-bold text-purple-400">
            {usersWithRoles.filter((u) => u.role === "admin").length}
          </div>
          <div className="text-xs text-gray-400 mt-1">Admins</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4">
          <div className="text-2xl font-bold text-amber-400">
            {usersWithRoles.filter((u) => u.isPro).length}
          </div>
          <div className="text-xs text-gray-400 mt-1">Pro Users</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4">
          <div className="text-2xl font-bold text-red-400">
            {usersWithRoles.filter((u) => u.isCheater).length}
          </div>
          <div className="text-xs text-gray-400 mt-1">Blocked</div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-900/60 border border-gray-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value as FilterRole)}
          className="bg-gray-900/60 border border-gray-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50"
        >
          {filterOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-900/30 border border-gray-800/50 rounded-xl">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800/50 bg-gray-900/50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                User
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                Pro
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Role
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/30">
            <AnimatePresence>
              {filteredUsers?.map((userItem) => {
                const actions = getAvailableActions(userItem);
                const isProcessing = processingUsers.has(userItem.userId);
                const isDropdownOpen = openDropdown === userItem.userId;

                return (
                  <motion.tr
                    key={userItem.userId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-gray-800/20 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-medium text-gray-300">
                          {userItem.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{userItem.name}</div>
                          <div className="text-xs text-gray-500">{userItem.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {userItem.isPro ? (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                          Pro
                        </span>
                      ) : (
                        <span className="text-xs text-gray-600">Free</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{getRoleBadge(userItem)}</td>
                    <td className="px-4 py-3">{getStatusBadge(userItem)}</td>
                    <td className="px-4 py-3">
                      <DropdownCell
                        userItem={userItem}
                        actions={actions}
                        isProcessing={isProcessing}
                        isOpen={isDropdownOpen}
                        onToggle={() => setOpenDropdown(isDropdownOpen ? null : userItem.userId)}
                        onClose={() => setOpenDropdown(null)}
                        onAction={handleAction}
                      />
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>

        {filteredUsers?.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {search ? "No users match your search." : "No users in this category."}
          </div>
        )}
      </div>
    </div>
  );
}
