import { ref, computed, readonly } from 'vue';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from 'src/boot/firebase';
import type { UserRole } from 'src/types/user';

const user = ref<User | null>(null);
const userRole = ref<UserRole>('user');
const loading = ref(true);
const initialized = ref(false);

async function resolveUserRole(firebaseUser: User): Promise<UserRole> {
  const userDocRef = doc(db, 'users', firebaseUser.uid);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    return (userDoc.data().role as UserRole) ?? 'user';
  }

  // User doc doesn't exist — check admin whitelist and create it
  let role: UserRole = 'user';
  const configDoc = await getDoc(doc(db, 'config', 'admin'));
  if (configDoc.exists()) {
    const adminEmails = (configDoc.data().adminEmails as string[]) ?? [];
    if (firebaseUser.email && adminEmails.includes(firebaseUser.email)) {
      role = 'admin';
    }
  }

  // Create the user document
  await setDoc(userDocRef, {
    uid: firebaseUser.uid,
    email: firebaseUser.email ?? '',
    displayName: firebaseUser.displayName ?? '',
    photoURL: firebaseUser.photoURL ?? null,
    role,
    createdAt: new Date().toISOString(),
  });

  return role;
}

function initAuth() {
  if (initialized.value) return;
  initialized.value = true;

  onAuthStateChanged(auth, (firebaseUser) => {
    user.value = firebaseUser;
    if (firebaseUser) {
      resolveUserRole(firebaseUser)
        .then((role) => {
          userRole.value = role;
        })
        .catch(() => {
          userRole.value = 'user';
        })
        .finally(() => {
          loading.value = false;
        });
    } else {
      userRole.value = 'user';
      loading.value = false;
    }
  });
}

async function signIn() {
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
}

async function signOut() {
  await firebaseSignOut(auth);
}

export function useAuth() {
  initAuth();

  const isAuthenticated = computed(() => !!user.value);
  const isAdmin = computed(() => userRole.value === 'admin');

  return {
    user: readonly(user),
    userRole: readonly(userRole),
    loading: readonly(loading),
    isAuthenticated,
    isAdmin,
    signIn,
    signOut,
  };
}
