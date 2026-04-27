import { signInWithEmailAndPassword, signOut } from "firebase/auth";

import { auth, isFirebaseConfigured } from "../lib/firebase";

export async function loginWithEmailPassword(email, password) {
  if (!isFirebaseConfigured || !auth) {
    throw new Error("Firebase ayarlari eksik. .env dosyasini doldurman gerekiyor.");
  }

  return signInWithEmailAndPassword(auth, email, password);
}

export async function logoutUser() {
  if (!auth) return;
  await signOut(auth);
}
