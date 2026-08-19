export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
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
  detectedDomain?: string;
  detectedLanguage?: string;
}

export interface JobDescriptionAnalysis {
  requiredSkills: string[];
  preferredSkills?: string[];
  keywords: string[];
  responsibilities: string[];
  experienceExpectations?: string[];
  educationRequirements?: string[];
  detectedIndustry?: string;
  detectedRole?: string;
}

export interface JobComparisonResult {
  jobAnalysis: {
    requiredSkills: string[];
    preferredSkills?: string[];
    keywords: string[];
    responsibilities: string[];
    experienceExpectations?: string;
    educationRequirements?: string;
    detectedIndustry?: string;
    detectedRole?: string;
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

export interface ResumeClassification {
  language: string;
  secondaryLanguages?: string[];
  industry: string;
  profession: string;
  roleLevel: string; // "Student" | "Fresher" | "Entry-level" | "Mid-level" | "Experienced" | "Senior" | "Executive"
  confidence: number; // 0.0 to 1.0 (AI Estimate)
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
  languages?: string[];
  classification?: ResumeClassification;
  preferredLanguage?: string;
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

export type BottomNavTab = "home" | "builder" | "scanner" | "history" | "settings";

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
  preferredLanguage?: string;
  industry?: string;
}

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi (हिन्दी)" },
  { code: "bn", label: "Bengali (বাংলা)" },
  { code: "te", label: "Telugu (తెలుగు)" },
  { code: "mr", label: "Marathi (मराठी)" },
  { code: "ta", label: "Tamil (தமிழ்)" },
  { code: "gu", label: "Gujarati (ગુજરાતી)" },
  { code: "kn", label: "Kannada (ಕನ್ನಡ)" },
  { code: "ml", label: "Malayalam (മലയാളം)" },
  { code: "or", label: "Odia (ଓଡ଼ିଆ)" },
  { code: "pa", label: "Punjabi (ਪੰਜਾਬੀ)" },
  { code: "as", label: "Assamese (অসমীয়া)" },
  { code: "ur", label: "Urdu (اردو)" },
];

export const SUPPORTED_INDUSTRIES = [
  "Education / Teaching",
  "Healthcare / Nursing / Medicine / Pharmacy",
  "Finance / Accounting / Banking",
  "Sales / Marketing / Retail",
  "Customer Service / Support",
  "Hospitality / Tourism / Culinary",
  "Government / Public Sector / Legal",
  "Civil / Mechanical / Electrical / Manufacturing",
  "Architecture / Interior / Urban Design",
  "Media / Journalism / Content / Publishing",
  "Information Technology / Software / Data / AI",
  "Agriculture / Forestry / Rural Development",
  "Logistics / Supply Chain / Warehouse",
  "Human Resources / Administration",
  "Nonprofit / NGO / Social Work",
  "Skilled Trades / Technician / Maintenance",
  "Other Professions",
];
