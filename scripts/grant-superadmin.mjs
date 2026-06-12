/*
  Bootstrap the first superadmin (run once, with a service account):
    GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json \
      node scripts/grant-superadmin.mjs admin@example.com
*/

import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/grant-superadmin.mjs <email>");
  process.exit(1);
}

initializeApp({ credential: applicationDefault() });

const user = await getAuth().getUserByEmail(email);
await getAuth().setCustomUserClaims(user.uid, { admin: true, superadmin: true });
await getFirestore().doc(`adminRoles/${user.uid}`).set({
  role: "superadmin",
  grantedBy: "bootstrap-script",
  grantedAt: FieldValue.serverTimestamp(),
});

console.log(`Granted superadmin to ${email} (${user.uid}).`);
console.log("The user must sign out and back in for claims to take effect.");
