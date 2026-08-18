import {
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  saveUserProfile,
} from "./userRepository";
import {
  saveUserResume,
  getUserResumes,
  getResumeById,
  deleteUserResume,
  subscribeToUserResumes,
  seedInitialResumesIfEmpty,
  normalizeResumeData,
} from "./resumeRepository";

export {
  // User Profile
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  saveUserProfile,
  // Resumes
  saveUserResume,
  getUserResumes,
  getResumeById,
  deleteUserResume,
  subscribeToUserResumes,
  seedInitialResumesIfEmpty,
  normalizeResumeData,
  // Aliases for backwards compatibility
  saveUserResume as saveResumeToFirestore,
  getUserResumes as fetchUserResumes,
  deleteUserResume as deleteResumeFromFirestore,
  subscribeToUserResumes as subscribeUserResumes,
};
