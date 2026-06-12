"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpenIcon,
  TargetIcon,
  TrophyIcon,
  StorefrontIcon,
  UserCircleIcon,
} from "@phosphor-icons/react";
import { useAuth } from "@/lib/auth";
import { setMuted } from "@/lib/sound";
import { Skeleton } from "@/components/ui";

const NAV = [
  { href: "/belajar", label: "Belajar", Icon: BookOpenIcon },
  { href: "/latihan", label: "Latihan", Icon: TargetIcon },
  { href: "/liga", label: "Liga", Icon: TrophyIcon },
  { href: "/toko", label: "Toko", Icon: StorefrontIcon },
  { href: "/profil", label: "Profil", Icon: UserCircleIcon },
] as const;

export default function AppShell({ children }: { children: ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace("/masuk");
  }, [user, loading, router]);

  useEffect(() => {
    if (profile) setMuted(!profile.soundOn);
  }, [profile]);

  if (loading || !user || !profile) {
    return (
      <main className="flex-1 min-h-[100dvh] mx-auto w-full max-w-md px-4 py-6 flex flex-col gap-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </main>
    );
  }

  // Lesson/drill players run full-screen without the tab bar
  const immersive =
    pathname.includes("/pelajaran/") || /\/latihan\/[^/]+/.test(pathname);

  return (
    <div className="flex-1 flex flex-col min-h-[100dvh] mx-auto w-full max-w-md">
      <main className={`flex-1 flex flex-col ${immersive ? "" : "pb-24"}`}>
        {children}
      </main>
      {!immersive && (
        <nav className="fixed bottom-0 inset-x-0 z-30 mx-auto max-w-md bg-raised border-t-2 border-line pb-[env(safe-area-inset-bottom)]">
          <ul className="grid grid-cols-5">
            {NAV.map(({ href, label, Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-bold ${
                      active ? "text-accent" : "text-ink-faint"
                    }`}
                  >
                    <Icon size={26} weight={active ? "fill" : "bold"} />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}
