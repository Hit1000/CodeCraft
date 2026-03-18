"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const userData = useQuery(
    api.users.getUser,
    user?.id ? { userId: user.id } : "skip"
  );

  useEffect(() => {
    if (isLoaded && userData !== undefined) {
      if (!user || userData?.role !== "admin") {
        router.replace("/challenges");
      }
    }
  }, [isLoaded, user, userData, router]);

  if (!isLoaded || userData === undefined) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (!user || userData?.role !== "admin") {
    return null;
  }

  return <>{children}</>;
}
