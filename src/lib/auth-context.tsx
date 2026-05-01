'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AppUser } from './utils';

interface AuthState {
  firebaseUser: any | null;
  profile: AppUser | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only load Firebase on the client, and handle missing config gracefully
    let unsubscribe: (() => void) | undefined;

    (async () => {
      try {
        const { onAuthStateChanged } = await import('firebase/auth');
        const { auth } = await import('./firebase');
        const { getUserProfile } = await import('./firestore');

        unsubscribe = onAuthStateChanged(auth, async (user) => {
          setFirebaseUser(user);
          if (user) {
            try {
              const p = await getUserProfile(user.uid);
              setProfile(p);
            } catch (e) {
              console.error('Failed to load user profile:', e);
            }
          } else {
            setProfile(null);
          }
          setLoading(false);
        });
      } catch (err: any) {
        console.error('Firebase initialization failed:', err);
        if (err?.code === 'auth/invalid-api-key') {
          setError('Firebase is not configured. Add your Firebase API keys to .env.local to enable authentication.');
        } else {
          setError(err?.message || 'Failed to initialize authentication.');
        }
        setLoading(false);
      }
    })();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    const { auth } = await import('./firebase');
    const { getUserProfile } = await import('./firestore');
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const p = await getUserProfile(cred.user.uid);
    setProfile(p);
    setFirebaseUser(cred.user);
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
    const { auth } = await import('./firebase');
    const { createUserProfile, getUserProfile } = await import('./firestore');
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    await createUserProfile(cred.user.uid, email, name);
    const p = await getUserProfile(cred.user.uid);
    setProfile(p);
    setFirebaseUser(cred.user);
  };

  const logOut = async () => {
    const { signOut } = await import('firebase/auth');
    const { auth } = await import('./firebase');
    await signOut(auth);
    setProfile(null);
    setFirebaseUser(null);
  };

  const refreshProfile = async () => {
    if (firebaseUser) {
      const { getUserProfile } = await import('./firestore');
      const p = await getUserProfile(firebaseUser.uid);
      setProfile(p);
    }
  };

  return (
    <AuthContext.Provider value={{ firebaseUser, profile, loading, error, signIn, signUp, logOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
