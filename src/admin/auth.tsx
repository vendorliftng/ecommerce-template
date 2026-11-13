import { createContext, useContext, useState, type ReactNode } from 'react';

interface AdminUser {
  email: string;
}

interface AuthContextValue {
  user: AdminUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = 'vl-admin-demo-user';

function readStoredUser(): AdminUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AdminUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(readStoredUser);

  async function signIn(email: string, password: string) {
    // TODO: Firebase — signInWithEmailAndPassword, then check the admin custom claim (PRD 5.4)
    await new Promise((resolve) => setTimeout(resolve, 600));
    if (!email || password.length < 6) {
      throw new Error('Wrong email or password.');
    }
    const signedIn = { email };
    setUser(signedIn);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(signedIn));
    } catch {
      // Storage blocked: the session just won't survive a refresh
    }
  }

  function signOut() {
    // TODO: Firebase — signOut(auth)
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }

  return <AuthContext.Provider value={{ user, signIn, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}