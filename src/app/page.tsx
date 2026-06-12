"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Skeleton } from "@/components/ui";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? "/belajar" : "/masuk");
  }, [user, loading, router]);

  return (
    <main className="flex-1 flex items-center justify-center min-h-[100dvh]">
      <Skeleton className="h-12 w-12 rounded-full" />
    </main>
  );
}
