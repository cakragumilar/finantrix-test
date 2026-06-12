"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { ShieldCheckIcon } from "@phosphor-icons/react";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import { Skeleton } from "@/components/ui";

const TABS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/questions", label: "Questions" },
  { href: "/admin/roles", label: "Roles" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  // adminRoles doc grants UI access before custom claims propagate
  const [docRole, setDocRole] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user || isAdmin) return;
    getDoc(doc(db(), "adminRoles", user.uid))
      .then((s) => setDocRole(s.exists()))
      .catch(() => setDocRole(false));
  }, [user, isAdmin]);

  const allowed = isAdmin || docRole === true;

  useEffect(() => {
    if (!loading && !user) router.replace("/masuk");
  }, [loading, user, router]);

  if (loading || !user || (!isAdmin && docRole === null)) {
    return (
      <main className="p-8 max-w-5xl mx-auto flex flex-col gap-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
      </main>
    );
  }

  if (!allowed) {
    return (
      <main className="min-h-[100dvh] flex flex-col items-center justify-center gap-3 text-center p-8">
        <ShieldCheckIcon size={48} weight="bold" className="text-ink-faint" />
        <h1 className="text-xl font-extrabold">Admin access required</h1>
        <p className="text-sm text-ink-soft max-w-[40ch]">
          Your account does not have an admin role. Ask a superadmin to grant
          one in the Roles panel.
        </p>
        <Link href="/belajar" className="text-accent font-bold text-sm">
          Back to the app
        </Link>
      </main>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <header className="border-b-2 border-line bg-raised">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-8">
          <p className="font-extrabold tracking-tight">
            Finantrix <span className="text-accent">Admin</span>
          </p>
          <nav className="flex gap-1">
            {TABS.map((t) => {
              const active =
                t.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(t.href);
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={`px-4 py-2 rounded-full text-sm font-bold ${
                    active
                      ? "bg-accent-soft text-accent"
                      : "text-ink-soft hover:bg-sunken"
                  }`}
                >
                  {t.label}
                </Link>
              );
            })}
          </nav>
          <Link
            href="/belajar"
            className="ml-auto text-sm font-bold text-ink-soft"
          >
            Student app
          </Link>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        {children}
      </main>
    </div>
  );
}
