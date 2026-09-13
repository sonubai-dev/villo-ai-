"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/lib/types";
import { authService } from "@/services/auth";
import { useAppStore } from "@/lib/store";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isDemoMode: boolean;
  signIn: (email: string, pass: string) => Promise<User>;
  signUp: (email: string, pass: string, name?: string) => Promise<User>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loginAsDemo: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const storeUser = useAppStore((s) => s.user);
  const [user, setUser] = useState<User | null>(storeUser);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Subscribe to auth state changes from Firebase / Demo state
    const unsubscribe = authService.subscribeToAuthState((currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value: AuthContextType = {
    user: user || storeUser,
    isLoading,
    isDemoMode: Boolean(user?.id === "demo-user-1" || storeUser?.id === "demo-user-1"),
    signIn: (email, pass) => authService.signIn(email, pass),
    signUp: (email, pass, name) => authService.signUp(email, pass, name),
    signOut: () => authService.signOut(),
    resetPassword: (email) => authService.resetPassword(email),
    loginAsDemo: () => authService.loginAsDemo(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
