import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./config";
import { UserProfile } from "../types";
import { User } from "firebase/auth";
import { handleFirestoreError, OperationType } from "./errors";

const DEFAULT_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA4owbeln06ShcDmz939csO4HP6hzVZM6zVggGvxGEQw4FIRCTKQZDhRNK6MSMN64wjkCNm6wzi5HXMqrVZ20AUdTMt6B6BAy3gpwN-zSMKMA_pY5y94k7x7CgBudSNEIxt9npwlQslnrDqTlZxF32bivGPSvTn5jgffZKw3vV01BeNPSCI4A8JL9nb54CB7zbRt5jWbmah6ES8kS8HHsyDrukhzs9KrOOIECWcQKOPt0lnhnULEveK";

// Helper to remove undefined keys so Firestore doesn't error
function cleanPayload<T extends object>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Normalizes user data into a consistent UserProfile object
 */
export function normalizeUserProfile(data: Partial<UserProfile>, fbUser?: User | null): UserProfile {
  const displayName = data.displayName || data.name || fbUser?.displayName || fbUser?.email?.split("@")[0] || "User";
  const photoURL = data.photoURL || data.avatarUrl || fbUser?.photoURL || DEFAULT_AVATAR;
  const email = data.email || fbUser?.email || "";
  const uid = data.uid || fbUser?.uid || "";

  return {
    uid,
    name: displayName,
    displayName,
    email,
    avatarUrl: photoURL,
    photoURL,
    targetRole: data.targetRole || "Senior Android Engineer",
    yearsOfExp: typeof data.yearsOfExp === "number" ? data.yearsOfExp : 5,
    isLoggedIn: true,
    createdAt: data.createdAt || Date.now(),
    updatedAt: data.updatedAt || Date.now(),
  };
}

/**
 * Retrieves a user profile from Firestore at users/{uid}
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const userDocRef = doc(db, "users", uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return normalizeUserProfile(snap.data() as UserProfile);
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

/**
 * Creates or overwrites a user profile document in Firestore at users/{uid}
 * Note: Password is never stored in Firestore.
 */
export async function createUserProfile(
  uid: string,
  profileData: {
    displayName?: string;
    email: string;
    photoURL?: string;
    targetRole?: string;
    yearsOfExp?: number;
  }
): Promise<UserProfile> {
  const path = `users/${uid}`;
  const userDocRef = doc(db, "users", uid);
  const now = Date.now();
  const displayName = profileData.displayName || profileData.email.split("@")[0] || "User";
  const photoURL = profileData.photoURL || DEFAULT_AVATAR;

  const newProfile: UserProfile = {
    uid,
    name: displayName,
    displayName,
    email: profileData.email,
    avatarUrl: photoURL,
    photoURL,
    targetRole: profileData.targetRole || "Senior Android Engineer",
    yearsOfExp: profileData.yearsOfExp ?? 5,
    isLoggedIn: true,
    createdAt: now,
    updatedAt: now,
  };

  const payload = cleanPayload({
    uid: newProfile.uid,
    displayName: newProfile.displayName,
    name: newProfile.name,
    email: newProfile.email,
    photoURL: newProfile.photoURL,
    avatarUrl: newProfile.avatarUrl,
    targetRole: newProfile.targetRole,
    yearsOfExp: newProfile.yearsOfExp,
    createdAt: newProfile.createdAt,
    updatedAt: newProfile.updatedAt,
  });

  try {
    await setDoc(userDocRef, payload, { merge: true });
    return newProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return newProfile;
  }
}

/**
 * Updates existing fields in a user profile at users/{uid}
 */
export async function updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
  const path = `users/${uid}`;
  try {
    const userDocRef = doc(db, "users", uid);
    const payload = cleanPayload({
      ...updates,
      ...(updates.name ? { displayName: updates.name } : {}),
      ...(updates.displayName ? { name: updates.displayName } : {}),
      ...(updates.avatarUrl ? { photoURL: updates.avatarUrl } : {}),
      ...(updates.photoURL ? { avatarUrl: updates.photoURL } : {}),
      updatedAt: Date.now(),
    });
    await setDoc(userDocRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export const saveUserProfile = updateUserProfile;
