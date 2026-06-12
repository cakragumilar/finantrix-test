/**
 * Demo mode: active when no real Firebase config is present.
 * All data lives in memory; writes update module-level state only.
 */

import type { UserDoc } from "./types";
import { DEMO_PROFILE, DEMO_USER_ID } from "./mock-data";

export const DEMO_MODE =
  !process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "demo";

// Mutable in-memory user profile for demo writes
let _demoProfile: UserDoc = { ...DEMO_PROFILE };
const _listeners = new Set<(p: UserDoc) => void>();

export function getDemoProfile(): UserDoc {
  return _demoProfile;
}

export function patchDemoProfile(patch: Partial<UserDoc> | ((p: UserDoc) => UserDoc)) {
  _demoProfile =
    typeof patch === "function" ? patch(_demoProfile) : { ..._demoProfile, ...patch };
  _listeners.forEach((fn) => fn(_demoProfile));
}

export function onDemoProfileChange(fn: (p: UserDoc) => void): () => void {
  _listeners.add(fn);
  return () => _listeners.delete(fn);
}

export const DEMO_UID = DEMO_USER_ID;
