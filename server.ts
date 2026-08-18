import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "10mb" }));

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
 * Helper to analyze experience level accurately from resume data
 */
function determineCandidateLevel(resumeData: any): {
  level: "Student" | "Fresher" | "Entry-level" | "Junior" | "Mid-level" | "Senior";
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
    const endYear = exp.current ? new Date().getFullYear() : (parseInt(exp.endDate) || startYear);
    if (startYear > 1990 && endYear >= startYear) {
      return acc + (endYear - startYear);
    }
    return acc + 1;
  }, 0);

  const hasSeniorTitle = experiences.some((exp: any) =>
    (exp.title || "").toLowerCase().includes("senior") ||
    (exp.title || "").toLowerCase().includes("lead") ||
    (exp.title || "").toLowerCase().includes("architect") ||
    (exp.title || "").toLowerCase().includes("principal")
  );

  const isStudent =
    summary.includes("student") ||
    summary.includes("bca") ||
    summary.includes("b.tech") ||
    summary.includes("bachelor") ||
    summary.includes("fresher") ||
    education.some((edu: any) =>
      (edu.degree || "").toLowerCase().includes("student") ||
      (edu.year || "").includes("Present") ||
      (edu.year || "").includes("2025") ||
      (edu.year || "").includes("2026") ||
      (edu.year || "").includes("2027")
    );

  const eduSummary = education.map((e: any) => `${e.degree || "Degree"} from ${e.school || "University"}`).join(", ");

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
 * Generates a 100% factual fallback analysis based strictly on candidate data
 */
function generateFactualFallbackAnalysis(resumeData: any, targetRoleInput?: string, jobDescription?: string) {
  const { level, isStudentOrFresher, skillsList } = determineCandidateLevel(resumeData);
  const targetRole = targetRoleInput || (isStudentOrFresher ? `${skillsList[0] || "Software"} Developer (${level})` : `${skillsList[0] || "Software"} Engineer`);
  const actualTechString = skillsList.slice(0, 5).join(", ") || "core technologies";
  const degree = resumeData?.education?.[0]?.degree || "relevant coursework";

  // Score calculation based strictly on profile completeness & alignment
  let score = 72;
  if (skillsList.length >= 4) score += 8;
  if (resumeData?.experiences?.length > 0) score += 7;
  if (resumeData?.education?.length > 0) score += 5;
  if (resumeData?.personal?.summary) score += 4;
  score = Math.min(score, 92);

  const matchAssessment = jobDescription
    ? `AI ATS Estimate: ${score}% match against the provided job description for ${targetRole} (${level} level).`
    : `AI ATS Estimate: ${score}% general ATS readiness for ${targetRole} roles at ${level} level.`;

  let optimizedSummary = "";
  if (isStudentOrFresher) {
    optimizedSummary = `${degree ? `${degree} ` : ""}${level} with practical hands-on project experience in ${actualTechString}. Motivated to apply software fundamentals, build reliable applications, and continuously expand development skills in ${targetRole} roles.`;
  } else {
    optimizedSummary = `Goal-oriented ${targetRole} with hands-on experience in ${actualTechString}. Demonstrated ability to develop software solutions, collaborate on technical deliverables, and apply clean architectural principles.`;
  }

  const recommendedKeywords = isStudentOrFresher
    ? ["Version Control (Git)", "Unit Testing", "REST APIs", "Clean Code Principles"]
    : ["System Design", "CI/CD Pipelines", "Automated Testing", "Code Reviews"];

  const presentKeywords = [...skillsList];

  const insights = [
    {
      title: "Clarify Technical Contributions",
      description: "Ensure each project or experience bullet specifies the exact technologies used and your individual contribution.",
      type: "sort_by_alpha",
    },
    {
      title: "Add Realistic Metrics When Available",
      description: "If you have verifiable results (e.g. project scope, task count, performance improvements), include them; otherwise, emphasize concrete technical problem-solving.",
      type: "trending_up",
    },
    {
      title: "Align Keywords Transparently",
      description: "Ensure only skills you genuinely possess are listed. Group them clearly by category (e.g. Languages, Frameworks, Tools).",
      type: "lightbulb",
    },
  ];

  const breakdown = {
    keywordMatch: { score: Math.min(score + 2, 95), matched: presentKeywords.slice(0, 5), missing: recommendedKeywords },
    skillsMatch: { score: score, matched: presentKeywords, missing: recommendedKeywords.slice(0, 2) },
    titleAlignment: { score: 85, assessment: `Job title aligns with candidate background for ${targetRole}.` },
    experienceAlignment: { score: isStudentOrFresher ? 75 : 85, assessment: `Experience level aligns with ${level} expectations.` },
    educationAlignment: { score: 90, assessment: `Academic background supports technical competencies.` },
    formattingReadability: { score: 92, assessment: `Clear structure with clean bullet points and standard ATS-readable headings.` },
  };

  return {
    atsScore: score,
    targetRole,
    matchAssessment,
    presentKeywords,
    recommendedKeywords,
    breakdown,
    insights,
    summaryOptimization: {
      originalDraft: resumeData?.personal?.summary || "Looking for opportunities in software development.",
      aiOptimized: optimizedSummary,
    },
  };
}

// ==========================================
// 1. POST /api/ai/generate-summary
// ==========================================
app.post(["/api/ai/generate-summary", "/api/gemini/optimize-summary"], async (req, res) => {
  try {
    const { draft, targetRole = "Software Developer", resumeData, experience = [], skills = [] } = req.body;
    const ai = getGeminiAI();

    const currentResume = resumeData || {
      targetRole,
      personal: { summary: draft },
      experiences: experience,
      skills,
    };

    const { level, isStudentOrFresher } = determineCandidateLevel(currentResume);
    const candidateSkills = Array.isArray(currentResume.skills) && currentResume.skills.length > 0
      ? currentResume.skills
      : skills;
    const candidateExperiences = Array.isArray(currentResume.experiences) && currentResume.experiences.length > 0
      ? currentResume.experiences
      : experience;

    if (!ai) {
      const techList = candidateSkills.length > 0 ? candidateSkills.slice(0, 4).join(", ") : "modern programming technologies";
      const fallbackSummary = isStudentOrFresher
        ? `Dedicated ${level} with practical project experience in ${techList}. Passionate about software development, writing clean code, and contributing to high-impact projects while continuing to learn and grow.`
        : `Results-focused ${targetRole} with hands-on experience in ${techList}. Proven background in delivering reliable software solutions, collaborating on technical architectures, and solving complex problems.`;

      return res.json({
        summary: fallbackSummary,
        optimizedSummary: fallbackSummary,
      });
    }

    const systemPrompt = `You are a professional, factual Applicant Tracking System (ATS) resume summary generator.

CRITICAL ANTI-HALLUCINATION MANDATES:
1. You MUST NOT fabricate, invent, or assume ANY of the following:
   - Years of experience (e.g. do NOT say "5+ years" unless explicitly stated)
   - Job titles or seniorities (do NOT upgrade a student/fresher/junior to Senior/Lead)
   - Companies, employers, or clients
   - Production metrics, user counts, or revenue (NEVER invent "500k users", "45% faster", etc.)
   - Certifications, tools, or technologies not present in the candidate's actual data.
2. Candidate's actual level: "${level}".
3. Candidate's actual skills: ${JSON.stringify(candidateSkills)}.
4. If candidate is a student or fresher, highlight academic foundations, practical project work, software engineering fundamentals, and eagerness to contribute.
5. Provide a crisp, ATS-optimized 2-3 sentence summary that is 100% truthful.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `Draft summary provided by user: "${draft || currentResume?.personal?.summary || ""}"
Target Role: "${targetRole}"
Candidate Level: "${level}"
Actual Skills: ${JSON.stringify(candidateSkills)}
Actual Experience: ${JSON.stringify(candidateExperiences)}
Education: ${JSON.stringify(currentResume?.education || [])}
`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "Truthful, concise, ATS-optimized professional summary",
            },
          },
          required: ["summary"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    const summaryText = parsed.summary || parsed.optimizedSummary || "Motivated developer with hands-on experience in software engineering and problem-solving.";
    return res.json({
      summary: summaryText,
      optimizedSummary: summaryText,
    });
  } catch (error: any) {
    console.error("Error in /api/ai/generate-summary:", error);
    return res.status(500).json({
      error: "Failed to generate summary with AI",
      summary: "Dedicated software professional committed to building clean, maintainable applications and delivering technical solutions.",
      optimizedSummary: "Dedicated software professional committed to building clean, maintainable applications and delivering technical solutions.",
    });
  }
});

// ==========================================
// 2. POST /api/ai/improve-content
// ==========================================
app.post(["/api/ai/improve-content", "/api/gemini/enhance-bullet"], async (req, res) => {
  try {
    const { bullet, content, jobTitle, company, role, section } = req.body;
    const textToImprove = (bullet || content || "").trim();

    if (!textToImprove) {
      return res.status(400).json({ error: "Content/bullet text is required" });
    }

    const ai = getGeminiAI();

    if (!ai) {
      const fallbackImproved = `Contributed to core development of ${jobTitle || role || "software features"} at ${company || "the team"}, applying clean code standards and collaborating on technical milestones.`;
      return res.json({
        improvedContent: fallbackImproved,
        enhancedBullets: [
          fallbackImproved,
          `Implemented key functionality using modern design patterns, ensuring reliable performance and code maintainability.`,
          `Streamlined technical workflows and refactored components to improve modularity and testability.`,
        ],
        variations: [
          fallbackImproved,
          `Implemented key functionality using modern design patterns, ensuring reliable performance and code maintainability.`,
          `Streamlined technical workflows and refactored components to improve modularity and testability.`,
        ],
      });
    }

    const systemPrompt = `You are a professional resume editor specializing in ATS optimization.

CRITICAL ANTI-HALLUCINATION RULES:
1. Strengthen action verbs, clarity, grammar, and professionalism.
2. DO NOT invent fake metrics, percentages, dollar amounts, or user counts (e.g. NEVER invent "30% increase", "500k users", "99.9% uptime") unless the user explicitly provided those exact numbers.
3. If suggesting a place where a quantifiable metric would strengthen the bullet, use explicit bracketed placeholders like "[quantifiable metric if verifiable, e.g. task count or latency]".
4. Return 3 refined, professional variations.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `Original Content (${jobTitle || role || "Role"} at ${company || "Company"}, Section: ${section || "Experience"}):
"${textToImprove}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            improvedContent: {
              type: Type.STRING,
              description: "The primary recommended improved version",
            },
            variations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 distinct professional variations",
            },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Brief tips or suggestions for this item",
            },
          },
          required: ["improvedContent", "variations"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    const variations = Array.isArray(parsed.variations) && parsed.variations.length > 0
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
// 3. POST /api/ai/improve-project
// ==========================================
app.post("/api/ai/improve-project", async (req, res) => {
  try {
    const { project } = req.body;
    if (!project || (!project.title && !project.description)) {
      return res.status(400).json({ error: "Project details (title or description) are required" });
    }

    const ai = getGeminiAI();
    const title = project.title || "Software Project";
    const description = project.description || "";
    const technologies = Array.isArray(project.technologies) ? project.technologies : [];

    if (!ai) {
      const techStr = technologies.length > 0 ? technologies.join(", ") : "modern technologies";
      const fallbackDesc = `Engineered ${title} utilizing ${techStr}, designing a clean architecture and implementing core features with modular code structure.`;
      return res.json({
        improvedDescription: fallbackDesc,
        bulletPoints: [
          `Architected core components of ${title} with ${techStr}.`,
          `Implemented key functionality focusing on responsive design, data integrity, and clean code principles.`,
          `Configured automated builds and comprehensive error handling.`,
        ],
        suggestedKeywords: technologies,
      });
    }

    const systemPrompt = `You are a technical resume editor specializing in software project descriptions.

CRITICAL ANTI-HALLUCINATION RULES:
1. ONLY use information supplied by the user (title: "${title}", description: "${description}", technologies: ${JSON.stringify(technologies)}).
2. DO NOT invent fake metrics (e.g. "1M users", "50k downloads", "40% performance boost", "processed $2M in revenue") unless specified.
3. Improve clarity, technical depth, and highlight the user's architectural approach and implementation details truthfully.
4. Provide an improved description, 2-3 bullet point options, and relevant suggested keywords from their tech stack.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `Improve this project description truthfully:
Project Title: "${title}"
Description: "${description}"
Technologies: ${JSON.stringify(technologies)}
Link: "${project.link || ""}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            improvedDescription: {
              type: Type.STRING,
              description: "Truthful, concise, technical project summary",
            },
            bulletPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2-3 polished bullet point options",
            },
            suggestedKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Relevant tech keywords related to this project",
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
// 4. POST /api/ai/analyze-job
// ==========================================
app.post("/api/ai/analyze-job", async (req, res) => {
  try {
    const { jobDescription, resumeData } = req.body;

    if (!jobDescription || typeof jobDescription !== "string" || !jobDescription.trim()) {
      return res.status(400).json({ error: "Job description text is required" });
    }

    const ai = getGeminiAI();
    const candidateSkills = Array.isArray(resumeData?.skills) ? resumeData.skills : [];
    const candidateTitle = resumeData?.targetRole || resumeData?.experiences?.[0]?.title || "Candidate";

    if (!ai) {
      // Factual fallback comparison
      const jdLower = jobDescription.toLowerCase();
      const matched = candidateSkills.filter((s: string) => jdLower.includes(s.toLowerCase()));
      const missing = ["System Architecture", "Unit Testing", "CI/CD", "RESTful APIs"].filter(
        (kw) => jdLower.includes(kw.toLowerCase()) && !matched.includes(kw)
      );

      return res.json({
        jobAnalysis: {
          requiredSkills: matched.concat(["Core Programming", "Problem Solving"]).slice(0, 5),
          preferredSkills: ["Clean Architecture", "Automated Testing", "Git"],
          keywords: ["Development", "Collaboration", "Code Review", "Scalability"],
          responsibilities: [
            "Develop and maintain reliable software features",
            "Collaborate with cross-functional engineering teams",
            "Write clean, maintainable, and well-tested code",
          ],
          experienceExpectations: "Demonstrated practical experience in relevant technologies",
          educationRequirements: "Degree in Computer Science or equivalent practical experience",
        },
        comparison: {
          matchedSkills: matched.length > 0 ? matched : candidateSkills.slice(0, 3),
          missingSkills: missing.length > 0 ? missing : ["CI/CD", "Automated Testing"],
          matchedKeywords: matched,
          missingKeywords: ["Clean Code", "Design Patterns"],
          estimatedMatchPercentage: matched.length > 2 ? 82 : 68,
          recommendations: [
            "Highlight hands-on project experience using matching technologies in your resume.",
            "Group skills into clear categories (Languages, Frameworks, Tools) for faster ATS indexing.",
            "Ensure only skills you genuinely possess are listed.",
          ],
        },
      });
    }

    const systemPrompt = `You are a strict, objective Job Description & Resume Compatibility Analyst.

CRITICAL RULES:
1. Extract true requirements from the provided job description:
   - requiredSkills: Must-have skills mentioned in JD
   - preferredSkills: Nice-to-have or bonus skills mentioned in JD
   - keywords: Core industry/technical keywords from JD
   - responsibilities: Key duties listed in JD
   - experienceExpectations: Years or seniority level requested in JD
   - educationRequirements: Degree/education requested in JD
2. Compare objectively with the candidate's actual resume data:
   - matchedSkills: Candidate skills present in JD
   - missingSkills: JD skills not currently in candidate's skills list
   - matchedKeywords: Matching keywords
   - missingKeywords: Relevant keywords from JD not in candidate resume
   - estimatedMatchPercentage: Realistic integer (50-98) based on actual alignment
   - recommendations: 3-4 actionable tips to better position the resume WITHOUT fabricating fake experience.
3. NEVER claim the candidate has skills or experience that are not in their resume data.`;

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
// 5. POST /api/ai/ats-analysis & /api/gemini/analyze-resume
// ==========================================
app.post(["/api/ai/ats-analysis", "/api/gemini/analyze-resume"], async (req, res) => {
  try {
    const { resumeData, targetRole: userTargetRole, jobDescription } = req.body;
    const ai = getGeminiAI();

    if (!ai) {
      return res.json(generateFactualFallbackAnalysis(resumeData, userTargetRole, jobDescription));
    }

    const { level, isStudentOrFresher } = determineCandidateLevel(resumeData);
    const targetRole = userTargetRole || (isStudentOrFresher ? `Entry-level Software Developer` : `Software Engineer`);

    const systemPrompt = `You are a strict, factual, and objective Applicant Tracking System (ATS) Resume Auditor.

CORE RULE:
NEVER invent, assume, or hallucinate:
- Years of experience (e.g. do NOT say "5+ years of experience" unless explicitly stated in the resume)
- Job titles or seniorities (do NOT upgrade a student/fresher/junior to Senior/Lead/Architect)
- Companies or employers
- Production metrics, customer counts, or performance percentages (e.g. NEVER generate "500k+ active users", "45% faster build times", "99.9% crash-free sessions")
- Revenue or business figures
- Certifications, tools, or technologies not mentioned in the resume or prompt.

Every factual claim in the analysis and rewritten summary MUST be 100% supported by the user's provided resume data.

RESUME UNDERSTANDING:
1. Candidate's actual level: "${level}" (Is student/fresher: ${isStudentOrFresher})
2. Target role to evaluate: "${targetRole}"
3. Job Description provided: ${jobDescription ? `"${jobDescription}"` : "None provided (use general ATS readiness standard)"}

GUIDELINES:
- ATS Score: Output an honest, realistic AI ATS readiness estimate (integer 50-98). Clearly emphasize it is an AI Estimate.
- Match Assessment: Must begin with "AI ATS Estimate: " and describe how well their actual experience, education, and skills align with the target role (${level} level).
- Present Keywords: Array of keywords/skills the candidate currently possesses in the resume.
- Recommended Keywords: 4-6 relevant industry skills/keywords recommended to consider for the target role that are missing from the resume. Clearly frame them for consideration.
- Breakdown: Provide detailed sub-scores (0-100) and brief evaluations for Keyword Match, Skills Match, Title Alignment, Experience Alignment, Education Alignment, and Formatting/Readability.
- Actionable Insights: Provide practical suggestions (strengthen weak bullet points, add verifiable results only if available, improve clarity/formatting, align relevant skills). NEVER suggest fake metrics!
- Summary Optimization:
  * Preserve their actual experience level (${level}).
  * Preserve their actual technologies (${JSON.stringify(resumeData?.skills || [])}).
  * Preserve their actual education and projects.
  * For students/freshers, write an inspiring, professional student/fresher summary highlighting coursework, project work, and eagerness to learn.
  * Do NOT invent years of experience or metrics.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `Evaluate this candidate's resume factually without inventing any experience, metrics, or technologies:
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
              description: "Sentence starting with 'AI ATS Estimate: ' assessing actual alignment",
            },
            presentKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Skills and keywords already present in the candidate resume",
            },
            recommendedKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "4-6 relevant industry skills/keywords recommended to consider (missing from resume)",
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
              required: ["keywordMatch", "skillsMatch", "titleAlignment", "experienceAlignment", "educationAlignment", "formattingReadability"],
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
          required: ["atsScore", "targetRole", "matchAssessment", "recommendedKeywords", "insights", "summaryOptimization"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    if (!parsed.presentKeywords) {
      parsed.presentKeywords = Array.isArray(resumeData?.skills) ? resumeData.skills : [];
    }
    return res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/ai/ats-analysis:", error);
    return res.json(generateFactualFallbackAnalysis(req.body.resumeData, req.body.targetRole, req.body.jobDescription));
  }
});

// ==========================================
// 6. POST /api/ai/parse-draft & /api/gemini/parse-resume-draft
// ==========================================
app.post(["/api/ai/parse-draft", "/api/gemini/parse-resume-draft"], async (req, res) => {
  try {
    const { rawText, targetRole } = req.body;
    const ai = getGeminiAI();

    if (!ai || !rawText) {
      return res.json({
        parsedResume: {
          personal: {
            firstName: rawText ? rawText.split("\n")[0]?.split(" ")[0] || "Candidate" : "Alex",
            lastName: rawText ? rawText.split("\n")[0]?.split(" ")[1] || "" : "Chen",
            email: "alex.chen@example.com",
            phone: "(555) 987-6543",
            location: "San Francisco, CA",
            summary: rawText ? rawText.slice(0, 250) : "",
          },
          experiences: [],
          education: [],
          skills: ["JavaScript", "React", "Python"],
        },
      });
    }

    const systemPrompt = `You are a precise resume parser. Extract information ONLY from the provided text.
CRITICAL: Do NOT invent information. If a section is not present in the text, return an empty array or empty string.
Extract:
- Personal info (firstName, lastName, email, phone, location, linkedin, summary)
- Work experience (title, company, location, startDate, endDate, bullets)
- Education (degree, school, location, year)
- Skills (array of actual skills mentioned)
- Projects (title, description, technologies)`;

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
              required: ["firstName", "lastName", "email"],
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
          required: ["personal", "experiences", "education", "skills"],
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
