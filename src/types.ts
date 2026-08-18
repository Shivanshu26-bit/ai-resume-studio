export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github?: string;
  portfolio?: string;
  summary: string;
}

export interface WorkExperience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface EducationItem {
  id: string;
  degree: string;
  school: string;
  location: string;
  year: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  link?: string;
  technologies?: string[];
}

export interface ATSInsight {
  title: string;
  description: string;
  type: string; // 'trending_up' | 'sort_by_alpha' | 'lightbulb' | 'check' | 'architecture'
}

export interface ATSBreakdownCategory {
  score: number;
  matched?: string[];
  missing?: string[];
  assessment?: string;
}

export interface ATSDetailedBreakdown {
  keywordMatch?: ATSBreakdownCategory;
  skillsMatch?: ATSBreakdownCategory;
  titleAlignment?: ATSBreakdownCategory;
  experienceAlignment?: ATSBreakdownCategory;
  educationAlignment?: ATSBreakdownCategory;
  formattingReadability?: ATSBreakdownCategory;
}

export interface ResumeAnalysis {
  atsScore: number;
  targetRole: string;
  matchAssessment: string;
  presentKeywords?: string[];
  recommendedKeywords: string[];
  breakdown?: ATSDetailedBreakdown;
  insights: ATSInsight[];
  summaryOptimization: {
    originalDraft: string;
    aiOptimized: string;
  };
}

export interface JobDescriptionAnalysis {
  requiredSkills: string[];
  preferredSkills?: string[];
  keywords: string[];
  responsibilities: string[];
  experienceExpectations?: string[];
  educationRequirements?: string[];
}

export interface JobComparisonResult {
  jobAnalysis: {
    requiredSkills: string[];
    preferredSkills?: string[];
    keywords: string[];
    responsibilities: string[];
    experienceExpectations?: string;
    educationRequirements?: string;
  };
  comparison: {
    matchedSkills: string[];
    missingSkills: string[];
    matchedKeywords: string[];
    missingKeywords: string[];
    estimatedMatchPercentage: number;
    recommendations: string[];
  };
}

export interface Resume {
  id: string;
  title: string;
  targetRole: string;
  lastEdited: string;
  updatedAt: number;
  createdAt?: number;
  atsScore: number;
  selectedTemplate?: string;
  personal: PersonalInfo;
  experiences: WorkExperience[];
  education: EducationItem[];
  skills: string[];
  projects?: ProjectItem[];
  certifications?: string[];
  achievements?: string[];
  analysis?: ResumeAnalysis;
  storagePdfUrl?: string;
  storageResumeFileUrl?: string;
}

export type ActiveScreen = 
  | "splash"
  | "login"
  | "register"
  | "home"
  | "builder"
  | "analysis"
  | "history"
  | "settings"
  | "scanner";

export type BottomNavTab = "home" | "builder" | "history" | "settings";

export interface UserProfile {
  uid?: string;
  name: string;
  displayName?: string;
  email: string;
  avatarUrl: string;
  photoURL?: string;
  targetRole: string;
  yearsOfExp: number;
  isLoggedIn: boolean;
  createdAt?: number;
  updatedAt?: number;
}

