"use client";

/*
  Payment providers. Midtrans Snap is primary (Indonesia), Stripe is a stub
  for later international rollout. Fulfillment (granting VIP / gems) happens
  ONLY in the Cloud Functions webhook; the client just opens checkout.
*/

import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "./firebase";

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        cb: {
          onSuccess?: () => void;
          onPending?: () => void;
          onError?: () => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

const SNAP_URL =
  process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL ??
  "https://app.sandbox.midtrans.com/snap/snap.js";
const CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;

function loadSnap(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.snap) return resolve();
    if (!CLIENT_KEY) return reject(new Error("midtrans-not-configured"));
    const s = document.createElement("script");
    s.src = SNAP_URL;
    s.setAttribute("data-client-key", CLIENT_KEY);
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("snap-load-failed"));
    document.body.appendChild(s);
  });
}

export type CheckoutItem =
  | { kind: "vip"; plan: "monthly" | "yearly" }
  | { kind: "gems"; gems: number; priceIDR: number };

/**
 * Opens Midtrans Snap checkout. Returns when the popup closes.
 * Requires the `createMidtransTransaction` callable to be deployed.
 */
export async function checkout(item: CheckoutItem): Promise<"pending" | "closed"> {
  await loadSnap();
  const fn = httpsCallable<CheckoutItem, { token: string }>(
    getFunctions(app(), "asia-southeast2"),
    "createMidtransTransaction"
  );
  const { data } = await fn(item);
  return new Promise((resolve) => {
    window.snap!.pay(data.token, {
      onSuccess: () => resolve("pending"), // webhook confirms asynchronously
      onPending: () => resolve("pending"),
      onError: () => resolve("closed"),
      onClose: () => resolve("closed"),
    });
  });
}

export function paymentsConfigured(): boolean {
  return Boolean(CLIENT_KEY);
}
