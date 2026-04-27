import { computed, ref } from "vue";
import { onAuthStateChanged } from "firebase/auth";

import { auth, authReadyPromise, isFirebaseConfigured } from "../lib/firebase";

const currentUser = ref(null);
const authResolved = ref(!isFirebaseConfigured);

if (isFirebaseConfigured && auth) {
  onAuthStateChanged(auth, (user) => {
    currentUser.value = user;
    authResolved.value = true;
  });
}

export function useAuth() {
  return {
    currentUser: computed(() => currentUser.value),
    isAuthenticated: computed(() => Boolean(currentUser.value)),
    authResolved: computed(() => authResolved.value),
    authReadyPromise,
    isFirebaseConfigured,
  };
}
