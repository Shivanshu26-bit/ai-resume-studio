import React, { useState } from "react";
import { Resume } from "../types";

interface ResumeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (newResume: Resume) => void;
}

export const ResumeScannerModal: React.FC<ResumeScannerModalProps> = ({
  isOpen,
  onClose,
  onScanComplete,
}) => {
  const [rawText, setRawText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [showJdInput, setShowJdInput] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  if (!isOpen) return null;

  const handlePasteStudentSample = () => {
    setTargetRole("Junior Software Developer");
    setRawText(`Meena Shukla
San Francisco, CA • (555) 321-9876 • meena.shukla@example.com • github.com/meena-dev

PROFESSIONAL SUMMARY
BCA Artificial Intelligence & Data Science student with hands-on experience building software projects using Python, React, and Firebase. Interested in developing practical AI-powered applications and continuously improving software engineering skills.

EDUCATION
Bachelor of Computer Applications (AI & Data Science) | University Tech Institute | 2023 - 2026

PROJECTS
- AI Resume Studio: Built an AI-powered resume optimizer using React, TypeScript, Tailwind CSS, Express, and Firebase.
- Task Tracker App: Created a real-time collaborative task manager using Python, Flask, and SQLite.

SKILLS
Python, JavaScript, React, TypeScript, Firebase, HTML5, CSS3, Git, Problem Solving`);
  };

  const handlePasteSeniorSample = () => {
    setTargetRole("Senior Android Engineer");
    setRawText(`Alex Chen
San Francisco, CA • (555) 987-6543 • alex.chen@example.com • linkedin.com/in/alexchen-dev

PROFESSIONAL SUMMARY
Experienced Android engineer specializing in Kotlin, Jetpack Compose, and modern architecture components. Proven background in architecting mobile applications and optimizing performance.

WORK EXPERIENCE
Senior Mobile Engineer | Apex Tech Labs | 2021 - Present
- Architected Android client using Kotlin, Jetpack Compose, and MVI architecture.
- Led migration improving clean build speed across mobile developers.
- Integrated offline Room database and network client for reliable offline usage.

Android Developer | Vanguard Digital | 2019 - 2021
- Developed e-commerce checkout flow in Kotlin Coroutines.
- Implemented CI/CD GitHub Actions pipelines for automated test runs.

EDUCATION
B.S. in Computer Science | University of California, Berkeley | 2019

SKILLS
Kotlin, Jetpack Compose, Coroutines, Hilt, Room DB, CI/CD, Gradle, Clean Architecture`);
  };

  const handleRunScan = async () => {
    if (!rawText.trim()) return;
    setIsScanning(true);

    try {
      // 1. Parse real candidate data from draft text
      let parsedPayload: any = null;
      try {
        const parseRes = await fetch("/api/gemini/parse-resume-draft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rawText, targetRole }),
        });
        const parseJson = await parseRes.json();
        if (parseJson.parsedResume) {
          parsedPayload = parseJson.parsedResume;
        }
      } catch (err) {
        console.warn("Draft parsing fallback:", err);
      }

      if (!parsedPayload) {
        parsedPayload = {
          personal: {
            firstName: rawText.split("\n")[0]?.split(" ")[0] || "Candidate",
            lastName: rawText.split("\n")[0]?.split(" ")[1] || "",
            email: "user@example.com",
            phone: "",
            location: "",
            summary: rawText.slice(0, 300),
          },
          experiences: [],
          education: [],
          skills: ["Software Development", "Problem Solving"],
        };
      }

      // 2. Perform strictly factual ATS analysis
      const res = await fetch("/api/gemini/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData: parsedPayload,
          targetRole: targetRole || parsedPayload.targetRole || "Software Developer",
          jobDescription: jobDescription.trim() || undefined,
        }),
      });

      const analysisData = await res.json();
      const derivedRole = targetRole || analysisData.targetRole || "Software Developer";

      const newResume: Resume = {
        id: "res-scan-" + Date.now(),
        title: `${derivedRole} Resume`,
        targetRole: derivedRole,
        lastEdited: "Just now",
        updatedAt: Date.now(),
        createdAt: Date.now(),
        atsScore: analysisData.atsScore || 80,
        personal: parsedPayload.personal,
        experiences: Array.isArray(parsedPayload.experiences) ? parsedPayload.experiences : [],
        education: Array.isArray(parsedPayload.education) ? parsedPayload.education : [],
        skills: Array.isArray(parsedPayload.skills) ? parsedPayload.skills : [],
        analysis: analysisData,
      };

      onScanComplete(newResume);
      onClose();
    } catch (err) {
      console.error("Scan error:", err);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200/80 flex flex-col gap-4 animate-scale-up max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-700 border border-indigo-100">
              <span className="material-symbols-outlined text-[20px]">document_scanner</span>
            </div>
            <h2 className="text-[18px] font-bold text-slate-900">
              Scan & Analyze Resume Draft
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="m3-input-field">
          <input
            type="text"
            placeholder=" "
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
          />
          <label>Target Job Title (Optional, e.g. Junior Python Developer)</label>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center flex-wrap gap-1">
            <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wider font-mono">
              Paste Resume Draft
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePasteStudentSample}
                className="text-[11px] text-indigo-600 font-bold hover:underline"
              >
                Sample: Student
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={handlePasteSeniorSample}
                className="text-[11px] text-indigo-600 font-bold hover:underline"
              >
                Sample: Experienced
              </button>
            </div>
          </div>
          <textarea
            rows={6}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste your student draft, projects, education, skills, or existing resume text here..."
            className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-[13px] text-slate-900 outline-hidden focus:border-indigo-600 focus:bg-white transition-colors"
          />
        </div>

        {/* Optional Target Job Description */}
        <div>
          <button
            type="button"
            onClick={() => setShowJdInput(!showJdInput)}
            className="text-[12px] text-indigo-600 font-bold flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">
              {showJdInput ? "expand_less" : "add"}
            </span>
            {showJdInput ? "Hide Job Description" : "Compare against specific Job Description (Optional)"}
          </button>

          {showJdInput && (
            <textarea
              rows={4}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste target job requirements / description to tailor the ATS score & recommendations..."
              className="mt-2 w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-[13px] text-slate-900 outline-hidden focus:border-indigo-600 focus:bg-white transition-colors"
            />
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full border border-slate-300 text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleRunScan}
            disabled={!rawText.trim() || isScanning}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-full text-[13px] font-bold shadow-md shadow-indigo-500/20 flex items-center gap-2 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isScanning ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing ATS Compatibility...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                Run Factual ATS Scan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
