import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "firebase/auth";
import { UserProfile } from "../types";
import {
  subscribeAuthState,
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  logoutUser,
  formatAuthError,
} from "../firebase/auth";
import { updateUserProfile } from "../firebase/userRepository";

export interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, pass: string) => Promise<UserProfile>;
  signUp: (email: string, pass: string, fullName?: string) => Promise<UserProfile>;
  signInGoogle: () => Promise<UserProfile>;
  signOut: () => Promise<void>;
  updateProfileData: (updates: Partial<UserProfile>) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeAuthState((state) => {
      setUser(state.user);
      setFirebaseUser(state.firebaseUser);
      setLoading(state.loading);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const clearError = () => setError(null);

  const signIn = async (email: string, pass: string): Promise<UserProfile> => {
    setError(null);
    try {
      const profile = await loginWithEmail(email, pass);
      setUser(profile);
      return profile;
    } catch (err: any) {
      const msg = err.message || formatAuthError(err);
      setError(msg);
      throw err;
    }
  };

  const signUp = async (email: string, pass: string, fullName?: string): Promise<UserProfile> => {
    setError(null);
    try {
      const profile = await registerWithEmail(email, pass, fullName);
      setUser(profile);
      return profile;
    } catch (err: any) {
      const msg = err.message || formatAuthError(err);
      setError(msg);
      throw err;
    }
  };

  const signInGoogle = async (): Promise<UserProfile> => {
    setError(null);
    try {
      const profile = await loginWithGoogle();
      setUser(profile);
      return profile;
    } catch (err: any) {
      const msg = err.message || formatAuthError(err);
      setError(msg);
      throw err;
    }
  };

  const signOut = async (): Promise<void> => {
    setError(null);
    try {
      await logoutUser(user?.uid);
      setUser(null);
      setFirebaseUser(null);
    } catch (err: any) {
      const msg = err.message || formatAuthError(err);
      setError(msg);
      throw err;
    }
  };

  const updateProfileData = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!user?.uid) return;
    try {
      await updateUserProfile(user.uid, updates);
      setUser((prev) => (prev ? { ...prev, ...updates } : null));
    } catch (err: any) {
      const msg = err.message || formatAuthError(err);
      setError(msg);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        error,
        signIn,
        signUp,
        signInGoogle,
        signOut,
        updateProfileData,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
