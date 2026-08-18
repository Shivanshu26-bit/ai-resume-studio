import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "./config";
import { Resume } from "../types";
import { handleFirestoreError, OperationType } from "./errors";

// Helper to remove undefined fields before writing to Firestore
function sanitizeResumePayload<T extends object>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Normalizes Firestore document data into a clean, complete Resume object
 */
export function normalizeResumeData(id: string, data: any): Resume {
  const now = Date.now();
  return {
    id: id || data.id || `res-${now}`,
    title: data.title || "Untitled Resume",
    targetRole: data.targetRole || "Software Engineer",
    lastEdited: data.lastEdited || "Just now",
    updatedAt: typeof data.updatedAt === "number" ? data.updatedAt : now,
    createdAt: typeof data.createdAt === "number" ? data.createdAt : now,
    atsScore: typeof data.atsScore === "number" ? data.atsScore : 75,
    selectedTemplate: data.selectedTemplate || "modern",
    personal: {
      firstName: data.personal?.firstName || "",
      lastName: data.personal?.lastName || "",
      email: data.personal?.email || "",
      phone: data.personal?.phone || "",
      location: data.personal?.location || "",
      linkedin: data.personal?.linkedin || "",
      github: data.personal?.github || "",
      portfolio: data.personal?.portfolio || "",
      summary: data.personal?.summary || "",
    },
    experiences: Array.isArray(data.experiences)
      ? data.experiences.map((exp: any, idx: number) => ({
          id: exp.id || `exp-${idx}-${now}`,
          title: exp.title || "",
          company: exp.company || "",
          location: exp.location || "",
          startDate: exp.startDate || "",
          endDate: exp.endDate || "",
          current: !!exp.current,
          bullets: Array.isArray(exp.bullets) ? exp.bullets : [],
        }))
      : [],
    education: Array.isArray(data.education)
      ? data.education.map((edu: any, idx: number) => ({
          id: edu.id || `edu-${idx}-${now}`,
          degree: edu.degree || "",
          school: edu.school || "",
          location: edu.location || "",
          year: edu.year || "",
        }))
      : [],
    skills: Array.isArray(data.skills) ? data.skills : [],
    projects: Array.isArray(data.projects) ? data.projects : [],
    certifications: Array.isArray(data.certifications) ? data.certifications : [],
    achievements: Array.isArray(data.achievements) ? data.achievements : [],
    analysis: data.analysis || undefined,
    storagePdfUrl: data.storagePdfUrl || undefined,
    storageResumeFileUrl: data.storageResumeFileUrl || undefined,
  };
}

/**
 * Creates or updates a resume document in Cloud Firestore at:
 * users/{uid}/resumes/{resumeId}
 */
export async function saveUserResume(uid: string, resume: Resume): Promise<Resume> {
  if (!uid) {
    throw new Error("Authentication required: Cannot save resume without an authenticated user UID.");
  }

  const now = Date.now();
  const resumeId = resume.id || `res-${now}-${Math.random().toString(36).substring(2, 7)}`;
  const path = `users/${uid}/resumes/${resumeId}`;
  const resumeDocRef = doc(db, "users", uid, "resumes", resumeId);

  const normalized: Resume = {
    ...resume,
    id: resumeId,
    updatedAt: now,
    createdAt: resume.createdAt || now,
    lastEdited: "Just now",
  };

  const payload = sanitizeResumePayload({
    ...normalized,
    id: resumeId,
  });

  try {
    await setDoc(resumeDocRef, payload, { merge: true });
    return normalized;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return normalized;
  }
}

/**
 * Fetches all resumes owned by a user from Cloud Firestore at:
 * users/{uid}/resumes
 */
export async function getUserResumes(uid: string): Promise<Resume[]> {
  if (!uid) return [];
  const path = `users/${uid}/resumes`;

  try {
    const resumesCol = collection(db, "users", uid, "resumes");
    const q = query(resumesCol, orderBy("updatedAt", "desc"));
    const snap = await getDocs(q);

    const resumes: Resume[] = [];
    snap.forEach((docSnap) => {
      resumes.push(normalizeResumeData(docSnap.id, docSnap.data()));
    });
    return resumes;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

/**
 * Fetches a single resume document from Cloud Firestore at:
 * users/{uid}/resumes/{resumeId}
 */
export async function getResumeById(uid: string, resumeId: string): Promise<Resume | null> {
  if (!uid || !resumeId) return null;
  const path = `users/${uid}/resumes/${resumeId}`;

  try {
    const resumeDocRef = doc(db, "users", uid, "resumes", resumeId);
    const snap = await getDoc(resumeDocRef);
    if (snap.exists()) {
      return normalizeResumeData(snap.id, snap.data());
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

/**
 * Deletes a single resume document from Cloud Firestore at:
 * users/{uid}/resumes/{resumeId}
 */
export async function deleteUserResume(uid: string, resumeId: string): Promise<void> {
  if (!uid || !resumeId) {
    throw new Error("Cannot delete resume: Missing user UID or resume ID.");
  }
  const path = `users/${uid}/resumes/${resumeId}`;

  try {
    const resumeDocRef = doc(db, "users", uid, "resumes", resumeId);
    await deleteDoc(resumeDocRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Subscribes to real-time updates for a user's resume collection in Cloud Firestore
 */
export function subscribeToUserResumes(
  uid: string,
  onUpdate: (resumes: Resume[]) => void,
  onError?: (err: Error) => void
): () => void {
  if (!uid) {
    onUpdate([]);
    return () => {};
  }
  const path = `users/${uid}/resumes`;
  const resumesCol = collection(db, "users", uid, "resumes");
  const q = query(resumesCol, orderBy("updatedAt", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const resumes: Resume[] = [];
      snapshot.forEach((docSnap) => {
        resumes.push(normalizeResumeData(docSnap.id, docSnap.data()));
      });
      onUpdate(resumes);
    },
    (err) => {
      console.error(`Firestore realtime sync error for user ${uid}:`, err);
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

/**
 * Seeds initial sample resumes if the user's resumes collection is empty
 */
export async function seedInitialResumesIfEmpty(
  uid: string,
  defaultSamples: Resume[]
): Promise<void> {
  if (!uid) return;

  try {
    const existing = await getUserResumes(uid);
    if (existing.length === 0) {
      for (const item of defaultSamples) {
        await saveUserResume(uid, item);
      }
    }
  } catch (err) {
    console.error("Error seeding initial resumes in Firestore:", err);
  }
}

