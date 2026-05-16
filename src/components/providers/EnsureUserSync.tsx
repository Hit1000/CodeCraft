"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function EnsureUserSync() {
  const { user, isLoaded } = useUser();
  const ensureUser = useMutation(api.users.ensureUser);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user?.id || !user?.primaryEmailAddress?.emailAddress) return;

    ensureUser({
      userId: user.id,
      email: user.primaryEmailAddress.emailAddress,
      name: user.fullName || user.firstName || "User",
    }).catch(() => {});
  }, [
    ensureUser,
    isLoaded,
    user?.id,
    user?.primaryEmailAddress?.emailAddress,
    user?.fullName,
    user?.firstName,
  ]);

  return null;
}
