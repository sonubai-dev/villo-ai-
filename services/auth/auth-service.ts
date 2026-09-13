/**
 * Authentication Service
 * Manages user authentication, session persistence, Firestore profile initialization, and Demo mode.
 */

import { 
  loginWithEmail, 
  registerWithEmail, 
  loginWithGoogle, 
  logoutUser, 
  resetUserPassword, 
  onAuthChange, 
  getCurrentUser as getFirebaseCurrentUser,
  mapFirebaseUserToViloUser 
} from "@/lib/firebase/auth";
import { getFirestoreUser, saveFirestoreUser } from "@/lib/firebase/firestore";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import { useAppStore, DEMO_USER } from "@/lib/store";
import { User } from "@/lib/types";

export class AuthService {
  private static instance: AuthService;

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public isConfigured(): boolean {
    return isFirebaseConfigured();
  }

  /**
   * Register a new user with email and password.
   * Automatically initializes the Firestore users/{userId} profile with default plan and credits.
   */
  public async signUp(email: string, password: string, displayName?: string): Promise<User> {
    if (!this.isConfigured()) {
      useAppStore.getState().loginAsDemo();
      return DEMO_USER;
    }

    const fbUser = await registerWithEmail(email, password, displayName);
    if (!fbUser) throw new Error("Registration failed");

    // Automatically create the user's Firestore profile
    const newProfile: User = {
      id: fbUser.uid,
      email: fbUser.email || email,
      name: displayName || fbUser.displayName || "Creator",
      displayName: displayName || fbUser.displayName || "Creator",
      avatar: fbUser.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
      photoURL: fbUser.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
      plan: "free",
      tier: "free",
      credits: 50, // Default 50 credits on signup
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      onboardingCompleted: false,
    };

    await saveFirestoreUser(newProfile);

    // Sync into local Zustand state
    useAppStore.getState().updateUser(newProfile);
    return newProfile;
  }

  /**
   * Sign in an existing user with email and password.
   */
  public async signIn(email: string, password: string): Promise<User> {
    if (!this.isConfigured()) {
      useAppStore.getState().loginAsDemo();
      return DEMO_USER;
    }

    const fbUser = await loginWithEmail(email, password);
    if (!fbUser) throw new Error("Authentication failed");

    // Sync or retrieve user profile from Firestore
    let userProfile = await getFirestoreUser(fbUser.uid);
    if (!userProfile) {
      userProfile = {
        id: fbUser.uid,
        email: fbUser.email || email,
        name: fbUser.displayName || "Creator",
        displayName: fbUser.displayName || "Creator",
        avatar: fbUser.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
        photoURL: fbUser.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
        plan: "free",
        tier: "free",
        credits: 50,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        onboardingCompleted: false,
      };
      await saveFirestoreUser(userProfile);
    }

    useAppStore.getState().updateUser(userProfile);
    return userProfile;
  }

  /**
   * Sign in using Google OAuth popup.
   */
  public async signInWithGoogle(): Promise<User> {
    if (!this.isConfigured()) {
      useAppStore.getState().loginAsDemo();
      return DEMO_USER;
    }

    const fbUser = await loginWithGoogle();
    if (!fbUser) throw new Error("Google sign in failed");

    let userProfile = await getFirestoreUser(fbUser.uid);
    if (!userProfile) {
      userProfile = {
        id: fbUser.uid,
        email: fbUser.email || "user@vilo.ai",
        name: fbUser.displayName || "Creator",
        displayName: fbUser.displayName || "Creator",
        avatar: fbUser.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
        photoURL: fbUser.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
        plan: "free",
        tier: "free",
        credits: 50,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        onboardingCompleted: false,
      };
      await saveFirestoreUser(userProfile);
    }

    useAppStore.getState().updateUser(userProfile);
    return userProfile;
  }

  /**
   * Sign out user from Firebase and clear session.
   */
  public async signOut(): Promise<void> {
    if (this.isConfigured()) {
      await logoutUser();
    }
    useAppStore.getState().logout();
  }

  /**
   * Send password reset email.
   */
  public async resetPassword(email: string): Promise<void> {
    if (this.isConfigured()) {
      await resetUserPassword(email);
    }
  }

  /**
   * Get current authenticated user session (Firebase or Demo).
   */
  public getCurrentUser(): User | null {
    const storeUser = useAppStore.getState().user;
    if (storeUser) return storeUser;

    const fbUser = getFirebaseCurrentUser();
    if (fbUser) {
      return mapFirebaseUserToViloUser(fbUser);
    }
    return null;
  }

  /**
   * Subscribe to auth state changes (observer pattern).
   */
  public subscribeToAuthState(callback: (user: User | null) => void): () => void {
    if (!this.isConfigured()) {
      const current = useAppStore.getState().user;
      callback(current);
      return () => {};
    }

    return onAuthChange(async (fbUser) => {
      if (fbUser) {
        let profile = await getFirestoreUser(fbUser.uid);
        if (!profile) {
          profile = mapFirebaseUserToViloUser(fbUser);
          await saveFirestoreUser(profile);
        }
        useAppStore.getState().updateUser(profile);
        callback(profile);
      } else {
        const storeUser = useAppStore.getState().user;
        // If logged in as Demo user, maintain demo session
        if (storeUser && storeUser.id === DEMO_USER.id) {
          callback(DEMO_USER);
        } else {
          useAppStore.getState().logout();
          callback(null);
        }
      }
    });
  }

  // Backwards-compatible aliases
  public login(email: string, password: string): Promise<User> {
    return this.signIn(email, password);
  }

  public signup(email: string, password: string, displayName?: string): Promise<User> {
    return this.signUp(email, password, displayName);
  }

  public logout(): Promise<void> {
    return this.signOut();
  }

  public loginWithGoogle(): Promise<User> {
    return this.signInWithGoogle();
  }

  public loginAsDemo(): void {
    useAppStore.getState().loginAsDemo();
  }
}

export const authService = AuthService.getInstance();
