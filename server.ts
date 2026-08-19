import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import * as pdfParseModule from "pdf-parse";
import mammoth from "mammoth";

const pdfParse: any = (pdfParseModule as any).default || pdfParseModule;

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Lazy init Gemini client
function getGeminiAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

/**
 * Common Industry Domains
 */
const COMMON_INDUSTRIES = [
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

/**
 * Fast keyword-based fallback classifier
 */
function detectIndustryAndLanguageFallback(text: string, resumeData?: any): {
  language: string;
  secondaryLanguages: string[];
  industry: string;
  profession: string;
  roleLevel: string;
  confidence: number;
} {
  const lower = (text + " " + JSON.stringify(resumeData || {})).toLowerCase();

  // Language detection heuristics
  let language = "English";
  const secondaryLanguages: string[] = [];

  // Devanagari script (Hindi, Marathi, Sanskrit, Nepali)
  if (/[\u0900-\u097F]/.test(text)) {
    if (lower.includes("मराठी") || lower.includes("महाराष्ट्र")) {
      language = "Marathi";
    } else {
      language = "Hindi";
    }
  } else if (/[\u0980-\u09FF]/.test(text)) {
    language = "Bengali";
  } else if (/[\u0C00-\u0C7F]/.test(text)) {
    language = "Telugu";
  } else if (/[\u0B80-\u0BFF]/.test(text)) {
    language = "Tamil";
  } else if (/[\u0A80-\u0AFF]/.test(text)) {
    language = "Gujarati";
  } else if (/[\u0C80-\u0CFF]/.test(text)) {
    language = "Kannada";
  } else if (/[\u0D00-\u0D7F]/.test(text)) {
    language = "Malayalam";
  } else if (/[\u0B00-\u0B7F]/.test(text)) {
    language = "Odia";
  } else if (/[\u0A00-\u0A7F]/.test(text)) {
    language = "Punjabi";
  } else if (/[\u0600-\u06FF]/.test(text)) {
    language = "Urdu";
  }

  if (language !== "English" && /[a-zA-Z]{5,}/.test(text)) {
    secondaryLanguages.push("English");
  }

  // Industry heuristics
  let industry = "Information Technology / Software / Data / AI";
  let profession = "Professional";
  let confidence = 0.85;

  if (
    lower.includes("teacher") ||
    lower.includes("teaching") ||
    lower.includes("school") ||
    lower.includes("pgt") ||
    lower.includes("tgt") ||
    lower.includes("prt") ||
    lower.includes("b.ed") ||
    lower.includes("m.ed") ||
    lower.includes("ctet") ||
    lower.includes("cbse") ||
    lower.includes("icse") ||
    lower.includes("ncert") ||
    lower.includes("professor") ||
    lower.includes("lecturer") ||
    lower.includes("pedagogy") ||
    lower.includes("curriculum") ||
    lower.includes("कक्षा") ||
    lower.includes("अध्यापक") ||
    lower.includes("शिक्षक") ||
    lower.includes("शिक्षा")
  ) {
    industry = "Education / Teaching";
    profession = lower.includes("pgt") ? "PGT Teacher" : lower.includes("tgt") ? "TGT Teacher" : lower.includes("professor") ? "Assistant Professor" : "Educator / Teacher";
  } else if (
    lower.includes("nurse") ||
    lower.includes("nursing") ||
    lower.includes("hospital") ||
    lower.includes("icu") ||
    lower.includes("clinic") ||
    lower.includes("patient") ||
    lower.includes("mbbs") ||
    lower.includes("b.sc nursing") ||
    lower.includes("gnm") ||
    lower.includes("doctor") ||
    lower.includes("pharmacy") ||
    lower.includes("pharmacist") ||
    lower.includes("medical")
  ) {
    industry = "Healthcare / Nursing / Medicine / Pharmacy";
    profession = lower.includes("nurse") ? "Staff Nurse" : lower.includes("pharmac") ? "Pharmacist" : "Healthcare Professional";
  } else if (
    lower.includes("accountant") ||
    lower.includes("accounting") ||
    lower.includes("tally") ||
    lower.includes("gst") ||
    lower.includes("gstr") ||
    lower.includes("tds") ||
    lower.includes("audit") ||
    lower.includes("ledger") ||
    lower.includes("balance sheet") ||
    lower.includes("b.com") ||
    lower.includes("m.com") ||
    lower.includes("ca ") ||
    lower.includes("chartered accountant") ||
    lower.includes("taxation") ||
    lower.includes("banking")
  ) {
    industry = "Finance / Accounting / Banking";
    profession = lower.includes("tax") ? "Tax & GST Consultant" : "Accountant";
  } else if (
    lower.includes("sales") ||
    lower.includes("marketing") ||
    lower.includes("b2b") ||
    lower.includes("fmcg") ||
    lower.includes("retail") ||
    lower.includes("distributor") ||
    lower.includes("lead generation") ||
    lower.includes("cold calling") ||
    lower.includes("territory") ||
    lower.includes("business development") ||
    lower.includes("merchandise")
  ) {
    industry = "Sales / Marketing / Retail";
    profession = lower.includes("business development") ? "Business Development Executive" : "Sales Executive";
  } else if (
    lower.includes("hotel") ||
    lower.includes("chef") ||
    lower.includes("culinary") ||
    lower.includes("hospitality") ||
    lower.includes("front desk") ||
    lower.includes("tourism") ||
    lower.includes("restaurant")
  ) {
    industry = "Hospitality / Tourism / Culinary";
    profession = "Hospitality Associate";
  } else if (
    lower.includes("civil") ||
    lower.includes("mechanical") ||
    lower.includes("electrical") ||
    lower.includes("manufacturing") ||
    lower.includes("autocad") ||
    lower.includes("site engineer") ||
    lower.includes("polytechnic") ||
    lower.includes("iti")
  ) {
    industry = "Civil / Mechanical / Electrical / Manufacturing";
    profession = lower.includes("civil") ? "Civil Site Engineer" : lower.includes("electrical") ? "Electrical Engineer" : "Mechanical Engineer";
  } else if (
    lower.includes("customer service") ||
    lower.includes("bpo") ||
    lower.includes("call center") ||
    lower.includes("inbound") ||
    lower.includes("outbound")
  ) {
    industry = "Customer Service / Support";
    profession = "Customer Support Specialist";
  } else if (
    lower.includes("software") ||
    lower.includes("developer") ||
    lower.includes("engineer") ||
    lower.includes("python") ||
    lower.includes("java") ||
    lower.includes("react") ||
    lower.includes("android") ||
    lower.includes("kotlin") ||
    lower.includes("sql") ||
    lower.includes("frontend") ||
    lower.includes("backend") ||
    lower.includes("full stack") ||
    lower.includes("devops")
  ) {
    industry = "Information Technology / Software / Data / AI";
    profession = lower.includes("android") ? "Android Developer" : lower.includes("frontend") ? "Frontend Developer" : "Software Developer";
  }

  // Level determination
  let roleLevel = "Experienced";
  if (lower.includes("student") || lower.includes("intern") || lower.includes("bca") || lower.includes("fresher")) {
    roleLevel = "Fresher";
  } else if (lower.includes("senior") || lower.includes("lead") || lower.includes("head") || lower.includes("manager")) {
    roleLevel = "Senior";
  }

  return {
    language,
    secondaryLanguages,
    industry,
    profession,
    roleLevel,
    confidence,
  };
}

/**
 * Helper to analyze candidate experience level and profile
 */
function determineCandidateLevel(resumeData: any): {
  level: "Student" | "Fresher" | "Entry-level" | "Junior" | "Mid-level" | "Senior" | "Executive";
  isStudentOrFresher: boolean;
  educationSummary: string;
  skillsList: string[];
} {
  const experiences = Array.isArray(resumeData?.experiences) ? resumeData.experiences : [];
  const education = Array.isArray(resumeData?.education) ? resumeData.education : [];
  const skills = Array.isArray(resumeData?.skills) ? resumeData.skills : [];
  const summary = (resumeData?.personal?.summary || "").toLowerCase();

  const totalYearsEstimate = experiences.reduce((acc: number, exp: any) => {
    const startYear = parseInt(exp.startDate) || 0;
    const endYear = exp.current ? new Date().getFullYear() : parseInt(exp.endDate) || startYear;
    if (startYear > 1990 && endYear >= startYear) {
      return acc + (endYear - startYear);
    }
    return acc + 1;
  }, 0);

  const hasSeniorTitle = experiences.some((exp: any) =>
    (exp.title || "").toLowerCase().includes("senior") ||
    (exp.title || "").toLowerCase().includes("lead") ||
    (exp.title || "").toLowerCase().includes("head") ||
    (exp.title || "").toLowerCase().includes("manager") ||
    (exp.title || "").toLowerCase().includes("principal") ||
    (exp.title || "").toLowerCase().includes("pgt")
  );

  const isStudent =
    summary.includes("student") ||
    summary.includes("fresher") ||
    summary.includes("bca") ||
    summary.includes("b.tech") ||
    summary.includes("bachelor") ||
    education.some((edu: any) =>
      (edu.degree || "").toLowerCase().includes("student") ||
      (edu.year || "").includes("Present") ||
      (edu.year || "").includes("2025") ||
      (edu.year || "").includes("2026") ||
      (edu.year || "").includes("2027")
    );

  const eduSummary = education.map((e: any) => `${e.degree || "Degree"} from ${e.school || "Institution"}`).join(", ");

  if (experiences.length === 0 || isStudent) {
    return {
      level: isStudent ? "Student" : "Fresher",
      isStudentOrFresher: true,
      educationSummary: eduSummary,
      skillsList: skills,
    };
  }

  if (totalYearsEstimate < 2) {
    return {
      level: "Junior",
      isStudentOrFresher: false,
      educationSummary: eduSummary,
      skillsList: skills,
    };
  }

  if (hasSeniorTitle || totalYearsEstimate >= 5) {
    return {
      level: "Senior",
      isStudentOrFresher: false,
      educationSummary: eduSummary,
      skillsList: skills,
    };
  }

  return {
    level: "Mid-level",
    isStudentOrFresher: false,
    educationSummary: eduSummary,
    skillsList: skills,
  };
}

/**
 * Text extraction helper from Buffer (PDF / DOCX / TXT)
 */
async function extractTextFromBuffer(buffer: Buffer, mimeType: string, filename: string): Promise<string> {
  const cleanMime = (mimeType || "").toLowerCase();
  const cleanName = (filename || "").toLowerCase();

  // 1. PDF extraction
  if (cleanMime.includes("pdf") || cleanName.endsWith(".pdf")) {
    try {
      const data = await pdfParse(buffer);
      return data.text || "";
    } catch (err: any) {
      console.warn("pdf-parse error, attempting raw string decode:", err?.message);
      return buffer.toString("utf8");
    }
  }

  // 2. DOCX extraction
  if (
    cleanMime.includes("wordprocessingml") ||
    cleanMime.includes("docx") ||
    cleanName.endsWith(".docx")
  ) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value || "";
    } catch (err: any) {
      console.warn("mammoth error:", err?.message);
      return buffer.toString("utf8");
    }
  }

  // 3. Plain text / Markdown / HTML / other text files
  return buffer.toString("utf8");
}

/**
 * Generates factual fallback ATS analysis adapted to any industry & role
 */
function generateFactualFallbackAnalysis(
  resumeData: any,
  targetRoleInput?: string,
  jobDescription?: string,
  industryInput?: string
) {
  const { level, isStudentOrFresher, skillsList } = determineCandidateLevel(resumeData);
  const detected = detectIndustryAndLanguageFallback("", resumeData);
  const industry = industryInput || resumeData?.classification?.industry || detected.industry;
  const targetRole =
    targetRoleInput ||
    resumeData?.targetRole ||
    (isStudentOrFresher ? `${detected.profession} (${level})` : detected.profession);

  const skillsSample = skillsList.slice(0, 5).join(", ") || "core domain competencies";
  const degree = resumeData?.education?.[0]?.degree || "academic qualifications";

  let score = 74;
  if (skillsList.length >= 4) score += 6;
  if (resumeData?.experiences?.length > 0) score += 8;
  if (resumeData?.education?.length > 0) score += 5;
  if (resumeData?.personal?.summary) score += 4;
  if (resumeData?.certifications?.length > 0) score += 3;
  score = Math.min(score, 93);

  const matchAssessment = jobDescription
    ? `AI ATS Estimate: ${score}% match against the target job requirements for ${targetRole} in ${industry}.`
    : `AI ATS Estimate: ${score}% ATS readiness for ${targetRole} roles (${level} level) in ${industry}.`;

  let optimizedSummary = "";
  if (isStudentOrFresher) {
    optimizedSummary = `Dedicated ${level} with academic foundation in ${degree} and practical knowledge of ${skillsSample}. Motivated to apply core competencies, support organizational goals, and continuously learn in ${targetRole} positions.`;
  } else {
    optimizedSummary = `Proficient ${targetRole} with proven background in ${skillsSample}. Demonstrated ability to deliver quality deliverables, adhere to professional standards, and collaborate across teams in ${industry}.`;
  }

  // Domain-specific recommended keywords
  let recommendedKeywords = ["Documentation Standards", "Communication & Reporting", "Problem Solving", "Quality Assurance"];
  if (industry.includes("Education")) {
    recommendedKeywords = ["Lesson Planning", "Classroom Engagement", "NEP 2020 Guidelines", "Student Assessment", "Remedial Pedagogy"];
  } else if (industry.includes("Healthcare")) {
    recommendedKeywords = ["Patient Triage", "Clinical Documentation", "NABH Standards", "Emergency Protocols", "Vital Monitoring"];
  } else if (industry.includes("Finance") || industry.includes("Accounting")) {
    recommendedKeywords = ["GST & TDS Compliance", "Tally Prime", "Ledger Reconciliation", "Statutory Audit", "Financial Statements"];
  } else if (industry.includes("Sales")) {
    recommendedKeywords = ["Territory Planning", "B2B Lead Generation", "Dealer Management", "Revenue Quotas", "CRM Reporting"];
  } else if (industry.includes("Civil") || industry.includes("Manufacturing")) {
    recommendedKeywords = ["AutoCAD / Technical Drawings", "Site Supervision", "Safety Protocols (HSE)", "Quality Control", "Vendor Coordination"];
  } else if (industry.includes("Technology") || industry.includes("Software")) {
    recommendedKeywords = ["Clean Architecture", "Version Control (Git)", "Automated Testing", "CI/CD Workflows", "API Integration"];
  }

  const presentKeywords = [...skillsList];

  const insights = [
    {
      title: "Clarify Key Responsibilities & Tools",
      description: `Ensure each experience bullet describes your specific contributions, tools, or methodologies used in ${industry}.`,
      type: "sort_by_alpha",
    },
    {
      title: "Include Verifiable Outcomes Where Available",
      description: "If you have verifiable results (e.g. batch size, pass rates, transaction volumes, project timelines), include them without inventing figures.",
      type: "trending_up",
    },
    {
      title: "Align Relevant Certifications",
      description: "Ensure relevant licenses or certifications (e.g. CTET, B.Ed, KNC, Tally, BLS, AWS) are clearly listed with issuing authority.",
      type: "lightbulb",
    },
  ];

  const breakdown = {
    keywordMatch: { score: Math.min(score + 2, 95), matched: presentKeywords.slice(0, 5), missing: recommendedKeywords.slice(0, 3) },
    skillsMatch: { score: score, matched: presentKeywords, missing: recommendedKeywords.slice(0, 2) },
    titleAlignment: { score: 86, assessment: `Title aligns with candidate background for ${targetRole}.` },
    experienceAlignment: { score: isStudentOrFresher ? 78 : 88, assessment: `Experience depth aligns with ${level} expectations in ${industry}.` },
    educationAlignment: { score: 90, assessment: `Academic qualifications support the target role.` },
    formattingReadability: { score: 92, assessment: `Clean section structure and standard ATS-readable layout.` },
  };

  return {
    atsScore: score,
    targetRole,
    matchAssessment,
    detectedDomain: industry,
    detectedLanguage: detected.language,
    presentKeywords,
    recommendedKeywords,
    breakdown,
    insights,
    summaryOptimization: {
      originalDraft: resumeData?.personal?.summary || `Looking for opportunities in ${targetRole}.`,
      aiOptimized: optimizedSummary,
    },
  };
}

// ==========================================
// 1. POST /api/ai/upload-extract (Transient Resume Document Parsing)
// ==========================================
app.post("/api/ai/upload-extract", async (req, res) => {
  try {
    const { fileBase64, mimeType = "application/pdf", fileName = "resume.pdf", rawText: directText } = req.body;

    let extractedText = "";

    if (fileBase64) {
      // Decode base64 transiently in memory
      const buffer = Buffer.from(fileBase64, "base64");
      extractedText = await extractTextFromBuffer(buffer, mimeType, fileName);
    } else if (directText && typeof directText === "string") {
      extractedText = directText;
    } else {
      return res.status(400).json({ error: "No document or text content provided for extraction" });
    }

    extractedText = extractedText.trim();
    if (!extractedText) {
      return res.status(400).json({ error: "Unable to extract text from the provided document" });
    }

    const ai = getGeminiAI();

    // Fallback baseline extraction
    const fallbackClass = detectIndustryAndLanguageFallback(extractedText);
    const lines = extractedText.split("\n").map((l) => l.trim()).filter(Boolean);
    const firstLine = lines[0] || "Candidate";
    const nameParts = firstLine.split(/\s+/);
    const firstName = nameParts[0] || "Candidate";
    const lastName = nameParts.slice(1).join(" ") || "";

    // Simple email & phone regex extraction
    const emailMatch = extractedText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/i);
    const phoneMatch = extractedText.match(/(\+?\d{1,4}[-.\s]?\(?\d{2,4}\)?[-.\s]?\d{3,5}[-.\s]?\d{3,5})/);

    const fallbackParsedResume = {
      title: `${fallbackClass.profession} Resume`,
      targetRole: fallbackClass.profession,
      personal: {
        firstName,
        lastName,
        email: emailMatch ? emailMatch[0] : "",
        phone: phoneMatch ? phoneMatch[0] : "",
        location: "",
        summary: extractedText.slice(0, 350),
      },
      experiences: [],
      education: [],
      skills: [],
      languages: [fallbackClass.language, ...(fallbackClass.secondaryLanguages || [])],
      classification: fallbackClass,
    };

    if (!ai) {
      return res.json({
        rawText: extractedText.slice(0, 5000),
        parsedResume: fallbackParsedResume,
        classification: fallbackClass,
      });
    }

    const systemPrompt = `You are a precise, multilingual, industry-aware resume parser specializing in resumes from India and global job seekers across all professions (Education, Healthcare, Finance, Tech, Sales, Hospitality, Government, Construction, Trades, etc.).

CRITICAL ANTI-HALLUCINATION & EXTRACTION RULES:
1. ONLY extract information that is explicitly stated in the provided text.
2. DO NOT invent, fabricate, or assume ANY names, companies, metrics, percentages, institutions, qualifications, or skills not present in the text.
3. If an item or section is absent, return an empty string or empty array.
4. Detect the primary language of the text (e.g. "English", "Hindi", "Bengali", "Telugu", "Marathi", "Tamil", "Gujarati", "Kannada", "Malayalam", "Odia", "Punjabi", "Assamese", "Urdu", or "Mixed").
5. Accurately classify the industry from standard sectors (e.g., "Education / Teaching", "Healthcare / Nursing / Medicine / Pharmacy", "Finance / Accounting / Banking", "Sales / Marketing / Retail", "Civil / Mechanical / Electrical / Manufacturing", "Information Technology / Software / Data / AI", etc.).
6. Extract:
   - personal (firstName, lastName, email, phone, location, linkedin, summary)
   - experiences (title, company, location, startDate, endDate, current, bullets)
   - education (degree, school, location, year)
   - skills (array of actual skills stated)
   - certifications (array of certifications stated, e.g. CTET, BLS, Tally, etc.)
   - achievements (array of awards/honors stated)
   - languages (array of languages stated or used in resume)
   - classification (language, secondaryLanguages, industry, profession, roleLevel, confidence)`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `Extract all resume sections and classify accurately from this resume text:\n\n${extractedText.slice(0, 12000)}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            personal: {
              type: Type.OBJECT,
              properties: {
                firstName: { type: Type.STRING },
                lastName: { type: Type.STRING },
                email: { type: Type.STRING },
                phone: { type: Type.STRING },
                location: { type: Type.STRING },
                linkedin: { type: Type.STRING },
                summary: { type: Type.STRING },
              },
              required: ["firstName", "lastName"],
            },
            classification: {
              type: Type.OBJECT,
              properties: {
                language: { type: Type.STRING },
                secondaryLanguages: { type: Type.ARRAY, items: { type: Type.STRING } },
                industry: { type: Type.STRING },
                profession: { type: Type.STRING },
                roleLevel: { type: Type.STRING },
                confidence: { type: Type.NUMBER },
              },
              required: ["language", "industry", "profession", "roleLevel", "confidence"],
            },
            experiences: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  company: { type: Type.STRING },
                  location: { type: Type.STRING },
                  startDate: { type: Type.STRING },
                  endDate: { type: Type.STRING },
                  current: { type: Type.BOOLEAN },
                  bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["title", "company", "bullets"],
              },
            },
            education: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  degree: { type: Type.STRING },
                  school: { type: Type.STRING },
                  location: { type: Type.STRING },
                  year: { type: Type.STRING },
                },
                required: ["degree", "school"],
              },
            },
            skills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            certifications: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            achievements: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            languages: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["personal", "classification", "experiences", "education", "skills"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    const classification = parsed.classification || fallbackClass;

    // Ensure IDs on experiences & education
    const cleanExperiences = (Array.isArray(parsed.experiences) ? parsed.experiences : []).map((exp: any, i: number) => ({
      id: `exp-${Date.now()}-${i}`,
      title: exp.title || "",
      company: exp.company || "",
      location: exp.location || "",
      startDate: exp.startDate || "",
      endDate: exp.endDate || "",
      current: Boolean(exp.current),
      bullets: Array.isArray(exp.bullets) ? exp.bullets : [],
    }));

    const cleanEducation = (Array.isArray(parsed.education) ? parsed.education : []).map((edu: any, i: number) => ({
      id: `edu-${Date.now()}-${i}`,
      degree: edu.degree || "",
      school: edu.school || "",
      location: edu.location || "",
      year: edu.year || "",
    }));

    const fullParsedResume = {
      title: `${classification.profession || "Professional"} Resume`,
      targetRole: classification.profession || "Professional",
      personal: parsed.personal || fallbackParsedResume.personal,
      experiences: cleanExperiences,
      education: cleanEducation,
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
      achievements: Array.isArray(parsed.achievements) ? parsed.achievements : [],
      languages: Array.isArray(parsed.languages) ? parsed.languages : [classification.language],
      classification,
      preferredLanguage: classification.language,
    };

    return res.json({
      rawText: extractedText.slice(0, 5000),
      parsedResume: fullParsedResume,
      classification,
    });
  } catch (error: any) {
    console.error("Error in /api/ai/upload-extract:", error);
    return res.status(500).json({ error: "Failed to process resume document: " + (error?.message || "Internal error") });
  }
});

// ==========================================
// 2. POST /api/ai/classify-resume
// ==========================================
app.post("/api/ai/classify-resume", async (req, res) => {
  try {
    const { text, resumeData } = req.body;
    const combined = (text || "") + " " + JSON.stringify(resumeData || {});
    const fallback = detectIndustryAndLanguageFallback(combined, resumeData);

    const ai = getGeminiAI();
    if (!ai) {
      return res.json({ classification: fallback });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `Analyze and classify this resume's industry, profession, role level, and language:\n${combined.slice(0, 4000)}`,
      config: {
        systemInstruction: `You are an expert Indian & global career classification system.
Return JSON with language (e.g. English, Hindi, Bengali, etc.), secondaryLanguages, industry (e.g. "Education / Teaching", "Healthcare / Nursing", "Finance / Accounting", "Sales / Marketing", "Information Technology", etc.), profession (specific role name, e.g. "PGT Hindi Teacher", "Staff Nurse", "Accountant", "Civil Engineer", "Software Engineer"), roleLevel ("Fresher", "Entry-level", "Mid-level", "Senior", "Executive"), and confidence (0.0 - 1.0 AI estimate).`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            language: { type: Type.STRING },
            secondaryLanguages: { type: Type.ARRAY, items: { type: Type.STRING } },
            industry: { type: Type.STRING },
            profession: { type: Type.STRING },
            roleLevel: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
          },
          required: ["language", "industry", "profession", "roleLevel", "confidence"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({ classification: parsed || fallback });
  } catch (err: any) {
    console.error("Error in /api/ai/classify-resume:", err);
    return res.json({ classification: detectIndustryAndLanguageFallback(req.body?.text || "") });
  }
});

// ==========================================
// 3. POST /api/ai/generate-summary (Industry & Multilingual Aware)
// ==========================================
app.post(["/api/ai/generate-summary", "/api/gemini/optimize-summary"], async (req, res) => {
  try {
    const {
      draft,
      targetRole = "Professional",
      industry,
      roleLevel,
      preferredLanguage = "English",
      resumeData,
      experience = [],
      skills = [],
    } = req.body;
    const ai = getGeminiAI();

    const currentResume = resumeData || {
      targetRole,
      personal: { summary: draft },
      experiences: experience,
      skills,
    };

    const { level, isStudentOrFresher } = determineCandidateLevel(currentResume);
    const candidateLevel = roleLevel || level;
    const detected = detectIndustryAndLanguageFallback(draft || "", currentResume);
    const effectiveIndustry = industry || currentResume?.classification?.industry || detected.industry;
    const effectiveRole = targetRole || currentResume?.classification?.profession || detected.profession;
    const effectiveLanguage = preferredLanguage || currentResume?.preferredLanguage || detected.language || "English";

    const candidateSkills =
      Array.isArray(currentResume.skills) && currentResume.skills.length > 0
        ? currentResume.skills
        : skills;
    const candidateExperiences =
      Array.isArray(currentResume.experiences) && currentResume.experiences.length > 0
        ? currentResume.experiences
        : experience;

    if (!ai) {
      const skillsStr = candidateSkills.slice(0, 4).join(", ") || "core domain competencies";
      const fallbackSummary = isStudentOrFresher
        ? `Motivated ${candidateLevel} seeking entry into ${effectiveRole} roles within ${effectiveIndustry}. Possesses solid foundational knowledge in ${skillsStr} and an eagerness to contribute productively to organizational goals.`
        : `Results-focused ${effectiveRole} with proven experience in ${skillsStr} across ${effectiveIndustry}. Dedicated to applying professional standards, collaborating across teams, and delivering high-quality outcomes.`;

      return res.json({
        summary: fallbackSummary,
        optimizedSummary: fallbackSummary,
      });
    }

    const systemPrompt = `You are a professional, factual, industry-specific ATS resume summary generator supporting global and Indian job seekers in diverse industries (${effectiveIndustry}) and languages (${effectiveLanguage}).

CRITICAL ANTI-HALLUCINATION MANDATES:
1. You MUST NOT fabricate, invent, or assume ANY of the following:
   - Years of experience (e.g. do NOT say "5+ years" unless explicitly stated in candidate data)
   - Job titles or seniorities not present
   - Companies, schools, or clients
   - Numerical metrics, exam pass rates, user counts, or revenue (NEVER invent figures)
   - Certifications, tools, or skills not present in the candidate's actual data.
2. Candidate's actual level: "${candidateLevel}".
3. Candidate's target industry: "${effectiveIndustry}".
4. Candidate's target profession/role: "${effectiveRole}".
5. Preferred Language: "${effectiveLanguage}". Write the summary in ${effectiveLanguage} (or professional English if preferredLanguage is English).
6. Adapt the vocabulary and pedagogical/clinical/financial/technical tone to ${effectiveIndustry} (e.g. lesson planning for teachers, patient care for nurses, ledger/tax for accountants, sales outreach for sales executives, clean code for developers).
7. Return a concise, high-impact 2-3 sentence summary that is 100% truthful.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `Draft summary: "${draft || currentResume?.personal?.summary || ""}"
Target Role: "${effectiveRole}"
Target Industry: "${effectiveIndustry}"
Candidate Level: "${candidateLevel}"
Preferred Language: "${effectiveLanguage}"
Actual Skills: ${JSON.stringify(candidateSkills)}
Actual Experiences: ${JSON.stringify(candidateExperiences)}
Education: ${JSON.stringify(currentResume?.education || [])}
Certifications: ${JSON.stringify(currentResume?.certifications || [])}
`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "Truthful, concise, industry-tailored professional summary",
            },
          },
          required: ["summary"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    const summaryText =
      parsed.summary ||
      `Dedicated ${effectiveRole} committed to delivering high-quality results in ${effectiveIndustry}.`;
    return res.json({
      summary: summaryText,
      optimizedSummary: summaryText,
    });
  } catch (error: any) {
    console.error("Error in /api/ai/generate-summary:", error);
    return res.status(500).json({
      error: "Failed to generate summary with AI",
      summary: "Dedicated professional committed to delivering high-quality results and continuous professional development.",
      optimizedSummary: "Dedicated professional committed to delivering high-quality results and continuous professional development.",
    });
  }
});

// ==========================================
// 4. POST /api/ai/improve-content (Industry-Aware Bullet Points)
// ==========================================
app.post(["/api/ai/improve-content", "/api/gemini/enhance-bullet"], async (req, res) => {
  try {
    const {
      bullet,
      content,
      jobTitle,
      company,
      role,
      section,
      industry = "General",
      preferredLanguage = "English",
    } = req.body;
    const textToImprove = (bullet || content || "").trim();

    if (!textToImprove) {
      return res.status(400).json({ error: "Content/bullet text is required" });
    }

    const ai = getGeminiAI();

    if (!ai) {
      const fallbackImproved = `Managed key responsibilities for ${jobTitle || role || "operations"} at ${company || "the organization"}, applying established professional standards and collaborating on team goals.`;
      return res.json({
        improvedContent: fallbackImproved,
        enhancedBullets: [
          fallbackImproved,
          `Implemented key operational procedures ensuring high quality, consistency, and adherence to guidelines.`,
          `Streamlined day-to-day deliverables and communicated effectively with stakeholders to support organizational objectives.`,
        ],
        variations: [
          fallbackImproved,
          `Implemented key operational procedures ensuring high quality, consistency, and adherence to guidelines.`,
          `Streamlined day-to-day deliverables and communicated effectively with stakeholders to support organizational objectives.`,
        ],
      });
    }

    const systemPrompt = `You are a specialized resume editor with domain expertise across diverse industries (Education, Healthcare, Finance, IT, Sales, Manufacturing, Hospitality, etc.).

CRITICAL ANTI-HALLUCINATION RULES:
1. Strengthen active verbs, clarity, grammar, and industry-specific professionalism.
2. DO NOT invent fake metrics, percentages, revenue amounts, student counts, or patient numbers unless explicitly in the user's text.
3. If suggesting a place where a quantifiable metric would strengthen the bullet, use explicit bracketed placeholders like "[add specific metric if verifiable, e.g. student count or batch size]".
4. Return 3 refined variations aligned with ${industry} terminology in ${preferredLanguage}.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `Original Content (${jobTitle || role || "Role"} at ${company || "Organization"}, Industry: ${industry}, Section: ${section || "Experience"}):
"${textToImprove}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            improvedContent: {
              type: Type.STRING,
              description: "Primary recommended improved version",
            },
            variations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 distinct professional variations",
            },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Brief improvement tips",
            },
          },
          required: ["improvedContent", "variations"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    const variations =
      Array.isArray(parsed.variations) && parsed.variations.length > 0
        ? parsed.variations
        : [parsed.improvedContent || textToImprove];

    return res.json({
      improvedContent: parsed.improvedContent || variations[0],
      enhancedBullets: variations,
      variations,
      suggestions: parsed.suggestions || [],
    });
  } catch (error: any) {
    console.error("Error in /api/ai/improve-content:", error);
    return res.status(500).json({
      error: "Failed to improve content",
      improvedContent: req.body.bullet || req.body.content || "",
      enhancedBullets: [req.body.bullet || req.body.content || ""],
      variations: [req.body.bullet || req.body.content || ""],
    });
  }
});

// ==========================================
// 5. POST /api/ai/improve-project
// ==========================================
app.post("/api/ai/improve-project", async (req, res) => {
  try {
    const { project, industry = "General", preferredLanguage = "English" } = req.body;
    if (!project || (!project.title && !project.description)) {
      return res.status(400).json({ error: "Project details are required" });
    }

    const ai = getGeminiAI();
    const title = project.title || "Key Project / Initiative";
    const description = project.description || "";
    const technologies = Array.isArray(project.technologies) ? project.technologies : [];

    if (!ai) {
      const techStr = technologies.length > 0 ? technologies.join(", ") : "domain methodologies";
      const fallbackDesc = `Delivered ${title} utilizing ${techStr}, designing a clear execution structure and completing key milestones aligned with objectives.`;
      return res.json({
        improvedDescription: fallbackDesc,
        bulletPoints: [
          `Executed key components of ${title} with ${techStr}.`,
          `Implemented core deliverables focusing on quality, accuracy, and best practices.`,
          `Documented processes and coordinated execution with project stakeholders.`,
        ],
        suggestedKeywords: technologies,
      });
    }

    const systemPrompt = `You are a resume editor specializing in project and initiative descriptions across diverse industries (${industry}).

CRITICAL ANTI-HALLUCINATION RULES:
1. ONLY use information supplied by the user (title: "${title}", description: "${description}", tools/skills: ${JSON.stringify(technologies)}).
2. DO NOT invent fake metrics (e.g. "1M users", "$500k savings", "50% boost") unless specified.
3. Improve clarity, technical or professional depth, and highlight the user's methodology truthfully in ${preferredLanguage}.
4. Provide an improved description, 2-3 bullet point options, and relevant suggested keywords.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `Improve this project description truthfully:
Project Title: "${title}"
Description: "${description}"
Tools/Technologies: ${JSON.stringify(technologies)}
Link: "${project.link || ""}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            improvedDescription: {
              type: Type.STRING,
              description: "Truthful, concise project summary",
            },
            bulletPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2-3 polished bullet point options",
            },
            suggestedKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Relevant keywords related to this project",
            },
          },
          required: ["improvedDescription", "bulletPoints"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      improvedDescription: parsed.improvedDescription || description,
      bulletPoints: parsed.bulletPoints || [parsed.improvedDescription || description],
      suggestedKeywords: parsed.suggestedKeywords || technologies,
    });
  } catch (error: any) {
    console.error("Error in /api/ai/improve-project:", error);
    return res.status(500).json({
      error: "Failed to improve project description",
      improvedDescription: req.body?.project?.description || "",
      bulletPoints: [req.body?.project?.description || ""],
    });
  }
});

// ==========================================
// 6. POST /api/ai/analyze-job (Multilingual & Multi-Industry)
// ==========================================
app.post("/api/ai/analyze-job", async (req, res) => {
  try {
    const { jobDescription, resumeData } = req.body;

    if (!jobDescription || typeof jobDescription !== "string" || !jobDescription.trim()) {
      return res.status(400).json({ error: "Job description text is required" });
    }

    const ai = getGeminiAI();
    const candidateSkills = Array.isArray(resumeData?.skills) ? resumeData.skills : [];
    const candidateTitle =
      resumeData?.targetRole ||
      resumeData?.classification?.profession ||
      resumeData?.experiences?.[0]?.title ||
      "Candidate";

    if (!ai) {
      const jdLower = jobDescription.toLowerCase();
      const matched = candidateSkills.filter((s: string) => jdLower.includes(s.toLowerCase()));
      const missing = ["Stakeholder Communication", "Quality Standards", "Reporting & Documentation"].filter(
        (kw) => !matched.includes(kw)
      );

      return res.json({
        jobAnalysis: {
          requiredSkills: matched.concat(["Domain Knowledge", "Problem Solving"]).slice(0, 5),
          preferredSkills: ["Documentation", "Team Collaboration"],
          keywords: ["Operations", "Compliance", "Quality", "Execution"],
          responsibilities: [
            "Deliver assigned responsibilities adhering to industry best practices",
            "Collaborate effectively with team members and management",
            "Maintain timely reporting and operational documentation",
          ],
          experienceExpectations: "Demonstrated practical experience in relevant domain",
          educationRequirements: "Relevant degree, diploma, or equivalent experience",
        },
        comparison: {
          matchedSkills: matched.length > 0 ? matched : candidateSkills.slice(0, 3),
          missingSkills: missing.length > 0 ? missing : ["Documentation Standards"],
          matchedKeywords: matched,
          missingKeywords: ["Quality Control", "Compliance"],
          estimatedMatchPercentage: matched.length > 2 ? 82 : 70,
          recommendations: [
            "Highlight practical experience and key domain competencies in your resume.",
            "Group skills into clear categories for faster ATS indexing.",
            "Ensure only skills you genuinely possess are listed.",
          ],
        },
      });
    }

    const systemPrompt = `You are a strict, objective Job Description & Resume Compatibility Analyst supporting jobs across any Indian or global industry.

CRITICAL RULES:
1. Extract true requirements from the provided job description:
   - requiredSkills: Must-have skills mentioned in JD
   - preferredSkills: Nice-to-have or bonus skills mentioned in JD
   - keywords: Core industry/domain keywords from JD
   - responsibilities: Key duties listed in JD
   - experienceExpectations: Seniority or years requested in JD
   - educationRequirements: Qualifications requested in JD
   - detectedIndustry: The domain (e.g. Education, Healthcare, Finance, Tech, Sales, etc.)
   - detectedRole: Target position title
2. Compare objectively with the candidate's actual resume data:
   - Understand multilingual and transliterated terms (e.g. Hindi "कक्षा प्रबंधन" matches "Classroom Management", "लेखांकन" matches "Accounting")
   - matchedSkills: Candidate skills present in JD
   - missingSkills: JD skills not in candidate's resume
   - matchedKeywords: Matching keywords
   - missingKeywords: Relevant JD keywords missing from candidate resume
   - estimatedMatchPercentage: Realistic integer (50-98) based on actual alignment
   - recommendations: 3-4 actionable tips WITHOUT fabricating fake experience.
3. NEVER claim the candidate has skills or experience not in their resume.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `JOB DESCRIPTION:
${jobDescription.slice(0, 4000)}

CANDIDATE RESUME DATA:
Target Role: "${candidateTitle}"
Skills: ${JSON.stringify(candidateSkills)}
Experiences: ${JSON.stringify(resumeData?.experiences || [])}
Education: ${JSON.stringify(resumeData?.education || [])}
Summary: "${resumeData?.personal?.summary || ""}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            jobAnalysis: {
              type: Type.OBJECT,
              properties: {
                requiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                preferredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                responsibilities: { type: Type.ARRAY, items: { type: Type.STRING } },
                experienceExpectations: { type: Type.STRING },
                educationRequirements: { type: Type.STRING },
                detectedIndustry: { type: Type.STRING },
                detectedRole: { type: Type.STRING },
              },
              required: ["requiredSkills", "keywords", "responsibilities"],
            },
            comparison: {
              type: Type.OBJECT,
              properties: {
                matchedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                matchedKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                estimatedMatchPercentage: { type: Type.INTEGER },
                recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["matchedSkills", "missingSkills", "estimatedMatchPercentage", "recommendations"],
            },
          },
          required: ["jobAnalysis", "comparison"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/ai/analyze-job:", error);
    return res.status(500).json({ error: "Failed to analyze job description" });
  }
});

// ==========================================
// 7. POST /api/ai/ats-analysis & /api/gemini/analyze-resume (Industry & Multilingual ATS)
// ==========================================
app.post(["/api/ai/ats-analysis", "/api/gemini/analyze-resume"], async (req, res) => {
  try {
    const { resumeData, targetRole: userTargetRole, jobDescription, industry: userIndustry } = req.body;
    const ai = getGeminiAI();

    const detected = detectIndustryAndLanguageFallback("", resumeData);
    const effectiveIndustry = userIndustry || resumeData?.classification?.industry || detected.industry;

    if (!ai) {
      return res.json(
        generateFactualFallbackAnalysis(resumeData, userTargetRole, jobDescription, effectiveIndustry)
      );
    }

    const { level, isStudentOrFresher } = determineCandidateLevel(resumeData);
    const targetRole =
      userTargetRole ||
      resumeData?.targetRole ||
      resumeData?.classification?.profession ||
      (isStudentOrFresher ? `${detected.profession} (${level})` : detected.profession);

    const systemPrompt = `You are a strict, factual, and objective Applicant Tracking System (ATS) Resume Auditor evaluating candidates across all Indian and global industries (${effectiveIndustry}).

CORE ANTI-HALLUCINATION RULE:
NEVER invent, assume, or hallucinate:
- Years of experience (e.g. do NOT say "5+ years of experience" unless explicitly stated)
- Seniorities or job titles
- Companies or employers
- Production metrics, customer figures, pass rates, or revenue numbers
- Certifications, tools, or skills not in the resume.

Every factual claim in the analysis and summary MUST be 100% supported by the candidate's actual resume data.

RESUME UNDERSTANDING:
1. Industry: "${effectiveIndustry}"
2. Candidate's actual level: "${level}" (Is student/fresher: ${isStudentOrFresher})
3. Target role to evaluate: "${targetRole}"
4. Multilingual Terminology: Understand terms in Indian languages (Hindi, Bengali, Telugu, Tamil, Marathi, etc.) alongside English.
5. Job Description: ${jobDescription ? `"${jobDescription.slice(0, 2000)}"` : "None provided (use general industry ATS readiness standard)"}

OUTPUT REQUIREMENTS:
- atsScore: Honest, realistic AI ATS readiness estimate (integer 50-98).
- matchAssessment: Sentence starting with "AI ATS Estimate: " assessing alignment with ${targetRole} in ${effectiveIndustry}.
- presentKeywords: Array of skills/competencies the candidate possesses in the resume.
- recommendedKeywords: 4-6 relevant industry competencies for ${effectiveIndustry} recommended to consider if applicable (missing from resume).
- breakdown: Detailed sub-scores (0-100) for keywordMatch, skillsMatch, titleAlignment, experienceAlignment, educationAlignment, formattingReadability.
- insights: Practical suggestions tailored to ${effectiveIndustry}. NEVER suggest fake numbers!
- summaryOptimization: Truthful 2-3 sentence optimized summary adapted to ${effectiveIndustry}.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `Evaluate this candidate's resume factually for ${effectiveIndustry} without inventing any experience or metrics:
Resume Data:
${JSON.stringify(resumeData, null, 2)}
`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            atsScore: {
              type: Type.INTEGER,
              description: "Estimated ATS score between 50 and 98 based on real alignment",
            },
            targetRole: {
              type: Type.STRING,
              description: "Target role evaluated",
            },
            matchAssessment: {
              type: Type.STRING,
              description: "Sentence starting with 'AI ATS Estimate: ' assessing alignment",
            },
            presentKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Skills and keywords already present in the candidate resume",
            },
            recommendedKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "4-6 relevant industry competencies recommended to consider",
            },
            breakdown: {
              type: Type.OBJECT,
              properties: {
                keywordMatch: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.INTEGER },
                    matched: { type: Type.ARRAY, items: { type: Type.STRING } },
                    missing: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ["score", "matched", "missing"],
                },
                skillsMatch: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.INTEGER },
                    matched: { type: Type.ARRAY, items: { type: Type.STRING } },
                    missing: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ["score", "matched", "missing"],
                },
                titleAlignment: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.INTEGER },
                    assessment: { type: Type.STRING },
                  },
                  required: ["score", "assessment"],
                },
                experienceAlignment: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.INTEGER },
                    assessment: { type: Type.STRING },
                  },
                  required: ["score", "assessment"],
                },
                educationAlignment: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.INTEGER },
                    assessment: { type: Type.STRING },
                  },
                  required: ["score", "assessment"],
                },
                formattingReadability: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.INTEGER },
                    assessment: { type: Type.STRING },
                  },
                  required: ["score", "assessment"],
                },
              },
              required: [
                "keywordMatch",
                "skillsMatch",
                "titleAlignment",
                "experienceAlignment",
                "educationAlignment",
                "formattingReadability",
              ],
            },
            insights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  type: { type: Type.STRING, description: "trending_up, sort_by_alpha, or lightbulb" },
                },
                required: ["title", "description", "type"],
              },
            },
            summaryOptimization: {
              type: Type.OBJECT,
              properties: {
                originalDraft: { type: Type.STRING },
                aiOptimized: { type: Type.STRING },
              },
              required: ["originalDraft", "aiOptimized"],
            },
          },
          required: [
            "atsScore",
            "targetRole",
            "matchAssessment",
            "recommendedKeywords",
            "insights",
            "summaryOptimization",
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    if (!parsed.presentKeywords) {
      parsed.presentKeywords = Array.isArray(resumeData?.skills) ? resumeData.skills : [];
    }
    parsed.detectedDomain = effectiveIndustry;
    parsed.detectedLanguage = detected.language;
    return res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/ai/ats-analysis:", error);
    return res.json(
      generateFactualFallbackAnalysis(
        req.body.resumeData,
        req.body.targetRole,
        req.body.jobDescription,
        req.body.industry
      )
    );
  }
});

// ==========================================
// 8. POST /api/ai/parse-draft (Legacy & Multilingual Text Parser)
// ==========================================
app.post(["/api/ai/parse-draft", "/api/gemini/parse-resume-draft"], async (req, res) => {
  try {
    const { rawText, targetRole } = req.body;
    const ai = getGeminiAI();

    const fallbackClass = detectIndustryAndLanguageFallback(rawText || "");

    if (!ai || !rawText) {
      return res.json({
        parsedResume: {
          personal: {
            firstName: rawText ? rawText.split("\n")[0]?.split(" ")[0] || "Candidate" : "Candidate",
            lastName: rawText ? rawText.split("\n")[0]?.split(" ")[1] || "" : "",
            email: "",
            phone: "",
            location: "",
            summary: rawText ? rawText.slice(0, 300) : "",
          },
          experiences: [],
          education: [],
          skills: ["Domain Expertise", "Problem Solving"],
          classification: fallbackClass,
        },
      });
    }

    const systemPrompt = `You are a precise, multilingual resume parser. Extract information ONLY from the provided text without inventing any facts.
Detect industry, profession, role level, and language accurately.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `Parse this resume draft text factually:\n${rawText}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            personal: {
              type: Type.OBJECT,
              properties: {
                firstName: { type: Type.STRING },
                lastName: { type: Type.STRING },
                email: { type: Type.STRING },
                phone: { type: Type.STRING },
                location: { type: Type.STRING },
                linkedin: { type: Type.STRING },
                summary: { type: Type.STRING },
              },
              required: ["firstName", "lastName"],
            },
            classification: {
              type: Type.OBJECT,
              properties: {
                language: { type: Type.STRING },
                industry: { type: Type.STRING },
                profession: { type: Type.STRING },
                roleLevel: { type: Type.STRING },
                confidence: { type: Type.NUMBER },
              },
              required: ["language", "industry", "profession", "roleLevel", "confidence"],
            },
            experiences: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  company: { type: Type.STRING },
                  location: { type: Type.STRING },
                  startDate: { type: Type.STRING },
                  endDate: { type: Type.STRING },
                  bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["title", "company", "bullets"],
              },
            },
            education: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  degree: { type: Type.STRING },
                  school: { type: Type.STRING },
                  location: { type: Type.STRING },
                  year: { type: Type.STRING },
                },
                required: ["degree", "school"],
              },
            },
            skills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["personal", "classification", "experiences", "education", "skills"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({ parsedResume: parsed });
  } catch (err: any) {
    console.error("Error in /api/ai/parse-draft:", err);
    return res.status(500).json({ error: "Failed to parse draft" });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Resume Studio Server running on port ${PORT}`);
  });
}

startServer();
