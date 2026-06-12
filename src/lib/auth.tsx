"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
  type User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase";
import { MAX_HEARTS } from "./constants";
import type { UserDoc } from "./types";

interface AuthState {
  user: User | null;
  profile: UserDoc | null;
  isAdmin: boolean;
  isSuperadmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthState>({
  user: null,
  profile: null,
  isAdmin: false,
  isSuperadmin: false,
  loading: true,
});

export function useAuth() {
  return useContext(AuthContext);
}

async function ensureUserDoc(u: User) {
  const ref = doc(db(), "users", u.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return;
  const fresh: Omit<UserDoc, "createdAt" | "hearts"> & {
    createdAt: unknown;
    hearts: { current: number; max: number; lastRegenAt: unknown };
  } = {
    displayName: u.displayName ?? "Pelajar",
    email: u.email ?? "",
    photoURL: u.photoURL ?? "",
    locale: "id",
    xpTotal: 0,
    xpWeekly: 0,
    gems: 0,
    hearts: { current: MAX_HEARTS, max: MAX_HEARTS, lastRegenAt: serverTimestamp() },
    streak: { current: 0, longest: 0, lastActiveDate: "", freezes: 0 },
    vip: { active: false, plan: null, expiresAt: null },
    league: { tier: "bronze", leagueId: null },
    badges: [],
    reminderTime: null,
    fcmToken: null,
    soundOn: true,
    createdAt: serverTimestamp(),
  };
  await setDoc(ref, fresh);
}

export function Providers({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    isAdmin: false,
    isSuperadmin: false,
    loading: true,
  });

  useEffect(() => {
    let unsubProfile: (() => void) | null = null;
    const unsubAuth = onAuthStateChanged(auth(), async (u) => {
      unsubProfile?.();
      unsubProfile = null;
      if (!u) {
        setState({ user: null, profile: null, isAdmin: false, isSuperadmin: false, loading: false });
        return;
      }
      await ensureUserDoc(u);
      const token = await u.getIdTokenResult();
      const isAdmin = token.claims.admin === true;
      const isSuperadmin = token.claims.superadmin === true;
      unsubProfile = onSnapshot(doc(db(), "users", u.uid), (snap) => {
        setState({
          user: u,
          profile: (snap.data() as UserDoc | undefined) ?? null,
          isAdmin,
          isSuperadmin,
          loading: false,
        });
      });
    });
    return () => {
      unsubAuth();
      unsubProfile?.();
    };
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export async function signInWithGoogle() {
  await signInWithPopup(auth(), googleProvider);
}

export async function signOut() {
  await fbSignOut(auth());
}
