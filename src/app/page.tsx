"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Skeleton } from "@/components/ui";
import { LandingPage } from "@/components/landing/landing-page";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || !user) return;
    router.replace("/belajar");
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <main className="flex-1 flex items-center justify-center min-h-[100dvh]">
        <Skeleton className="h-12 w-12 rounded-full" />
      </main>
    );
  }

  return <LandingPage />;
}
