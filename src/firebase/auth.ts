import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "./config";
import {
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  normalizeUserProfile,
} from "./userRepository";
import { UserProfile } from "../types";

export interface AuthStateResult {
  user: UserProfile | null;
  firebaseUser: User | null;
  loading: boolean;
}

/**
 * Converts Firebase error codes to clean, human-friendly error messages
 */
export function formatAuthError(error: any): string {
  if (!error) return "An unexpected error occurred. Please try again.";

  const code = error.code || error.message || "";

  switch (code) {
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact support.";
    case "auth/user-not-found":
      return "No account found with this email. Please check your email or create a new account.";
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password. Please verify your credentials and try again.";
    case "auth/email-already-in-use":
      return "An account with this email address already exists. Please sign in instead.";
    case "auth/operation-not-allowed":
      return "This sign-in method is currently disabled. Please contact the administrator.";
    case "auth/weak-password":
      return "Your password is too weak. Please use at least 6 characters with a combination of letters and numbers.";
    case "auth/popup-closed-by-user":
      return "Google Sign-In was cancelled before completing.";
    case "auth/popup-blocked":
      return "The sign-in popup was blocked by your browser. Please allow popups for this site and retry.";
    case "auth/network-request-failed":
      return "Network connection failed. Please check your internet connection and try again.";
    case "auth/too-many-requests":
      return "Too many unsuccessful attempts. Access has been temporarily disabled. Please try again later or reset your password.";
    case "auth/requires-recent-login":
      return "For your security, please sign in again before performing this action.";
    default:
      if (typeof error === "string") return error;
      if (error.message && !error.message.includes("Firebase:")) {
        return error.message;
      }
      return "Authentication failed. Please verify your details and try again.";
  }
}

/**
 * Email/Password Sign-In
 */
export async function loginWithEmail(email: string, pass: string): Promise<UserProfile> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    const fbUser = cred.user;

    // Fetch existing profile or bootstrap a new one
    let profile = await getUserProfile(fbUser.uid);
    if (!profile) {
      profile = await createUserProfile(fbUser.uid, {
        email: fbUser.email || email,
        displayName: fbUser.displayName || email.split("@")[0],
        photoURL: fbUser.photoURL || undefined,
      });
    } else {
      await updateUserProfile(fbUser.uid, { isLoggedIn: true, updatedAt: Date.now() });
    }

    return profile;
  } catch (error: any) {
    const friendlyMessage = formatAuthError(error);
    const customError = new Error(friendlyMessage);
    (customError as any).code = error.code;
    throw customError;
  }
}

/**
 * Email/Password Registration
 */
export async function registerWithEmail(
  email: string,
  pass: string,
  fullName?: string
): Promise<UserProfile> {
  try {
    const trimmedEmail = email.trim();
    const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, pass);
    const fbUser = cred.user;

    const displayName = fullName?.trim() || trimmedEmail.split("@")[0] || "User";

    // Update Firebase Auth profile
    try {
      await updateProfile(fbUser, { displayName });
    } catch (e) {
      console.warn("Could not update auth profile displayName:", e);
    }

    // Create Firestore profile document at users/{uid}
    const profile = await createUserProfile(fbUser.uid, {
      email: trimmedEmail,
      displayName,
      photoURL: fbUser.photoURL || undefined,
      targetRole: "Senior Android Engineer",
      yearsOfExp: 5,
    });

    return profile;
  } catch (error: any) {
    const friendlyMessage = formatAuthError(error);
    const customError = new Error(friendlyMessage);
    (customError as any).code = error.code;
    throw customError;
  }
}

/**
 * Google Sign-In via Popup
 */
export async function loginWithGoogle(): Promise<UserProfile> {
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    const fbUser = cred.user;

    // Check if user profile already exists to prevent duplicate profiles
    let profile = await getUserProfile(fbUser.uid);
    if (!profile) {
      profile = await createUserProfile(fbUser.uid, {
        email: fbUser.email || "",
        displayName: fbUser.displayName || "Google User",
        photoURL: fbUser.photoURL || undefined,
        targetRole: "Senior Android Engineer",
        yearsOfExp: 5,
      });
    } else {
      // Update profile if photoURL or displayName has changed in Google
      const updates: Partial<UserProfile> = {
        isLoggedIn: true,
        updatedAt: Date.now(),
      };
      if (fbUser.photoURL && fbUser.photoURL !== profile.avatarUrl) {
        updates.avatarUrl = fbUser.photoURL;
        updates.photoURL = fbUser.photoURL;
      }
      if (fbUser.displayName && (!profile.name || profile.name === "User")) {
        updates.name = fbUser.displayName;
        updates.displayName = fbUser.displayName;
      }
      await updateUserProfile(fbUser.uid, updates);
      profile = { ...profile, ...updates };
    }

    return profile;
  } catch (error: any) {
    const friendlyMessage = formatAuthError(error);
    const customError = new Error(friendlyMessage);
    (customError as any).code = error.code;
    throw customError;
  }
}

/**
 * Logout
 */
export async function logoutUser(uid?: string): Promise<void> {
  try {
    if (uid) {
      await updateUserProfile(uid, { isLoggedIn: false, updatedAt: Date.now() }).catch(() => {});
    }
  } catch {
    // Ignore network failure on logout profile flag
  }
  await signOut(auth);
}

/**
 * Centralized Auth State Subscriber
 */
export function subscribeAuthState(
  onStateChange: (state: AuthStateResult) => void
): () => void {
  return onAuthStateChanged(auth, async (fbUser) => {
    if (fbUser) {
      try {
        let profile = await getUserProfile(fbUser.uid);
        if (!profile) {
          profile = await createUserProfile(fbUser.uid, {
            email: fbUser.email || "",
            displayName: fbUser.displayName || fbUser.email?.split("@")[0] || "User",
            photoURL: fbUser.photoURL || undefined,
          });
        }
        onStateChange({
          user: { ...profile, isLoggedIn: true, uid: fbUser.uid },
          firebaseUser: fbUser,
          loading: false,
        });
      } catch (err) {
        console.error("Error loading user profile on auth state change:", err);
        const fallback = normalizeUserProfile({}, fbUser);
        onStateChange({
          user: fallback,
          firebaseUser: fbUser,
          loading: false,
        });
      }
    } else {
      onStateChange({
        user: null,
        firebaseUser: null,
        loading: false,
      });
    }
  });
}
