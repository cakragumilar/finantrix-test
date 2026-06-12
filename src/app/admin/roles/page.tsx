"use client";

/* Role management. Writing adminRoles requires the superadmin claim;
   the setAdminRole callable mirrors docs into custom claims. */

import { useMemo, useState } from "react";
import { collection, doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { TrashIcon } from "@phosphor-icons/react";
import { app, db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import { useCol } from "@/lib/db";
import type { AdminRoleDoc } from "@/lib/types";
import { Button, Card, ErrorNote } from "@/components/ui";

const inputCls =
  "w-full rounded-[var(--radius-input)] border-2 border-line bg-raised px-3 py-2 text-sm font-medium focus:border-accent focus:outline-none";

export default function RolesAdmin() {
  const { user, isSuperadmin } = useAuth();
  const rolesQuery = useMemo(() => collection(db(), "adminRoles"), []);
  const roles = useCol<AdminRoleDoc>(isSuperadmin ? rolesQuery : null);
  const [uid, setUid] = useState("");
  const [role, setRole] = useState<"editor" | "superadmin">("editor");
  const [note, setNote] = useState<string | null>(null);

  if (!isSuperadmin) {
    return (
      <Card>
        <h1 className="font-bold mb-2">Roles</h1>
        <p className="text-sm text-ink-soft">
          Only superadmins can manage roles. Bootstrap the first superadmin
          with the Admin SDK script in `scripts/grant-superadmin.mjs`.
        </p>
      </Card>
    );
  }

  async function grant() {
    if (!uid.trim()) return;
    setNote(null);
    try {
      await setDoc(doc(db(), "adminRoles", uid.trim()), {
        role,
        grantedBy: user!.uid,
        grantedAt: serverTimestamp(),
      });
      // sync custom claims so security rules see the role
      const fn = httpsCallable(getFunctions(app(), "asia-southeast2"), "setAdminRole");
      await fn({ uid: uid.trim(), role });
      setUid("");
      setNote(`Granted ${role} to ${uid.trim()}.`);
    } catch {
      setNote(
        "Doc saved or failed; claim sync needs the setAdminRole function deployed."
      );
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h1 className="text-2xl font-extrabold tracking-tight">Roles</h1>
      {note && <ErrorNote message={note} />}

      <Card className="flex flex-col gap-3">
        <h2 className="font-bold">Grant role</h2>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-bold text-ink-soft">User UID</span>
          <input
            className={inputCls}
            value={uid}
            onChange={(e) => setUid(e.target.value)}
            placeholder="Firebase Auth UID"
          />
        </label>
        <select
          className={inputCls}
          value={role}
          onChange={(e) => setRole(e.target.value as "editor" | "superadmin")}
        >
          <option value="editor">Content editor</option>
          <option value="superadmin">Superadmin</option>
        </select>
        <Button className="self-start px-5 py-2 text-xs" onClick={grant}>
          Grant
        </Button>
      </Card>

      <Card className="flex flex-col gap-2">
        <h2 className="font-bold">Current admins</h2>
        {(roles.data ?? []).map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between border-t border-line pt-2 text-sm"
          >
            <span className="num text-xs">{r.id}</span>
            <span className="font-bold">{r.role}</span>
            <button
              aria-label="Revoke"
              className="text-danger"
              onClick={() => {
                if (confirm(`Revoke ${r.role} from ${r.id}?`))
                  void deleteDoc(doc(db(), "adminRoles", r.id));
              }}
            >
              <TrashIcon size={16} weight="bold" />
            </button>
          </div>
        ))}
        {(roles.data ?? []).length === 0 && (
          <p className="text-sm text-ink-soft">No admin roles yet.</p>
        )}
      </Card>
    </div>
  );
}
