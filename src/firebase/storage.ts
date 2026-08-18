import {
  ref,
  uploadBytes,
  getDownloadURL,
  uploadString,
} from "firebase/storage";
import { storage } from "./config";

/**
 * Uploads a profile avatar image to Firebase Storage
 * Path: users/{uid}/profile/avatar_{timestamp}.{ext}
 */
export async function uploadProfileAvatar(
  uid: string,
  file: File | Blob
): Promise<string> {
  const extension = file instanceof File ? file.name.split(".").pop() || "jpg" : "jpg";
  const storageRef = ref(storage, `users/${uid}/profile/avatar_${Date.now()}.${extension}`);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
}

/**
 * Uploads an uploaded raw resume draft file to Firebase Storage
 * Path: users/{uid}/resumes/{resumeId}/source/{fileName}
 */
export async function uploadResumeDraftFile(
  uid: string,
  resumeId: string,
  file: File
): Promise<{ url: string; fileName: string }> {
  const storageRef = ref(storage, `users/${uid}/resumes/${resumeId}/source/${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  const url = await getDownloadURL(snapshot.ref);
  return { url, fileName: file.name };
}

/**
 * Uploads an exported or generated resume PDF / text snapshot to Firebase Storage
 * Path: users/{uid}/resumes/{resumeId}/exports/resume_{timestamp}.pdf
 */
export async function uploadGeneratedResumePdf(
  uid: string,
  resumeId: string,
  pdfBlobOrBase64: Blob | string
): Promise<string> {
  const storageRef = ref(
    storage,
    `users/${uid}/resumes/${resumeId}/exports/resume_${Date.now()}.pdf`
  );

  if (typeof pdfBlobOrBase64 === "string") {
    // base64 or data URL
    const snapshot = await uploadString(storageRef, pdfBlobOrBase64, "data_url");
    return getDownloadURL(snapshot.ref);
  } else {
    const snapshot = await uploadBytes(storageRef, pdfBlobOrBase64);
    return getDownloadURL(snapshot.ref);
  }
}
