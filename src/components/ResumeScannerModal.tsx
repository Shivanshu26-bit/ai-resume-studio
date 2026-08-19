import React, { useState } from "react";
import { Resume, SUPPORTED_INDUSTRIES, SUPPORTED_LANGUAGES, ResumeClassification } from "../types";
import { Sparkles, X, Briefcase, Globe, BookOpen, Calculator, HeartPulse, Terminal } from "lucide-react";

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
  const [industry, setIndustry] = useState("Education / Teaching");
  const [preferredLanguage, setPreferredLanguage] = useState("English");
  const [jobDescription, setJobDescription] = useState("");
  const [showJdInput, setShowJdInput] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  if (!isOpen) return null;

  const handlePasteTeacherSample = () => {
    setTargetRole("PGT Hindi Teacher");
    setIndustry("Education / Teaching");
    setPreferredLanguage("Hindi");
    setRawText(`Sunita Sharma
New Delhi, India • +91 98765 43210 • sunita.sharma.edu@example.com

PROFESSIONAL SUMMARY
Dedicated PGT Hindi & Sanskrit Educator with over 7 years of teaching experience across CBSE and State Board affiliated secondary schools. Proven track record in Hindi literature pedagogy, classroom management, and board examination preparation.

EDUCATION
- Master of Arts (M.A.) in Hindi Literature | Delhi University | 2016
- Bachelor of Education (B.Ed.) | Jamia Millia Islamia | 2017

TEACHING EXPERIENCE
PGT Hindi Teacher | Delhi Public Senior Secondary School | 2020 - Present
- Instructed Senior Secondary classes (Class 9 to 12) in Hindi Core and Literature aligned with CBSE guidelines.
- Conducted lesson planning, diagnostic assessments, and student progress tracking for board batches.
- Organized inter-school Hindi debate (वाद-विवाद) and annual Hindi Diwas cultural celebrations.

SKILLS
Hindi Literature & Pedagogy, CBSE Curriculum, Lesson Planning (पाठ योजना), Classroom Management, CTET Qualified, Sanskrit Grammar

LANGUAGES
Hindi, English, Sanskrit`);
  };

  const handlePasteAccountantSample = () => {
    setTargetRole("Senior Accountant");
    setIndustry("Accounting, Banking & Finance");
    setPreferredLanguage("English");
    setRawText(`Rajesh Gupta
Mumbai, Maharashtra, India • +91 99887 76655 • rajesh.gupta.acct@example.com

PROFESSIONAL SUMMARY
Detail-oriented Senior Accountant with 5+ years managing accounts payable/receivable, ledger reconciliations, GST return filing (GSTR-1, GSTR-3B), TDS compliance, and Tally Prime reporting.

WORK EXPERIENCE
Senior Accountant | Apex Commercial Logistics Pvt. Ltd. | 2021 - Present
- Supervised daily financial transactions, ledger maintenance, and bank reconciliations using Tally Prime and Advanced MS Excel.
- Prepared and filed monthly GST returns (GSTR-1, GSTR-3B) and quarterly TDS returns.

EDUCATION
- Master of Commerce (M.Com - Accountancy) | University of Mumbai | 2019
- Bachelor of Commerce (B.Com) | R.A. Podar College | 2017

SKILLS & CERTIFICATIONS
Tally Prime & ERP 9, GST Filing (GSTR-1, 3B), TDS & Income Tax Compliance, Bank Reconciliation (BRS), Advanced Excel

LANGUAGES
English, Hindi, Marathi`);
  };

  const handlePasteNurseSample = () => {
    setTargetRole("Staff Nurse (ICU)");
    setIndustry("Healthcare & Nursing");
    setPreferredLanguage("English");
    setRawText(`Priya Nair
Bengaluru, Karnataka, India • +91 97654 32109 • priya.nair.nurse@example.com

PROFESSIONAL SUMMARY
Registered Staff Nurse (B.Sc Nursing, KNC Registered) with 4+ years of Intensive Care Unit (ICU) and Emergency ward clinical experience. Skilled in patient triage, vital monitoring, IV cannulation, ventilator management, and CPR resuscitation.

CLINICAL EXPERIENCE
Staff Nurse - Intensive Care Unit (ICU) | Manipal Hospital | 2021 - Present
- Provided comprehensive nursing care to critically ill patients across medical and surgical ICU beds.
- Monitored multi-parameter vital signs, ventilator settings, and administered emergency medications.

EDUCATION
- Bachelor of Science in Nursing (B.Sc Nursing) | Rajiv Gandhi University of Health Sciences | 2020

CERTIFICATIONS & SKILLS
Critical Care Nursing, Ventilator Management, IV Cannulation, BLS & ACLS Protocols, KNC Registered Nurse

LANGUAGES
English, Hindi, Malayalam, Kannada`);
  };

  const handlePasteTechSample = () => {
    setTargetRole("Full-Stack Developer");
    setIndustry("Information Technology & Software");
    setPreferredLanguage("English");
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

  const handleRunScan = async () => {
    if (!rawText.trim()) return;
    setIsScanning(true);

    try {
      // 1. Parse real candidate data from draft text
      let parsedPayload: any = null;
      try {
        const parseRes = await fetch("/api/ai/parse-draft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rawText, targetRole, industry, preferredLanguage }),
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
            email: "candidate@example.com",
            phone: "",
            location: "",
            summary: rawText.slice(0, 300),
          },
          experiences: [],
          education: [],
          skills: ["Domain Expertise", "Professional Communication"],
        };
      }

      // 2. Perform strictly factual ATS analysis
      const res = await fetch("/api/ai/ats-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData: parsedPayload,
          targetRole: targetRole || parsedPayload.targetRole || "Professional",
          industry,
          preferredLanguage,
          jobDescription: jobDescription.trim() || undefined,
        }),
      });

      const analysisData = await res.json();
      const derivedRole = targetRole || analysisData.targetRole || "Professional";

      const classificationObj: ResumeClassification = {
        industry,
        profession: derivedRole,
        language: preferredLanguage,
        roleLevel: "Experienced",
        confidence: 0.95,
      };

      const newResume: Resume = {
        id: "res-scan-" + Date.now(),
        title: `${derivedRole} Resume`,
        targetRole: derivedRole,
        lastEdited: "Just now",
        updatedAt: Date.now(),
        createdAt: Date.now(),
        atsScore: analysisData.atsScore || 80,
        preferredLanguage,
        classification: classificationObj,
        personal: parsedPayload.personal,
        experiences: Array.isArray(parsedPayload.experiences) ? parsedPayload.experiences : [],
        education: Array.isArray(parsedPayload.education) ? parsedPayload.education : [],
        skills: Array.isArray(parsedPayload.skills) ? parsedPayload.skills : [],
        certifications: Array.isArray(parsedPayload.certifications) ? parsedPayload.certifications : [],
        languages: Array.isArray(parsedPayload.languages) ? parsedPayload.languages : [preferredLanguage],
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200/80 flex flex-col gap-4 animate-scale-up max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-700 border border-indigo-100">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-[18px] font-bold text-slate-900">
              Scan &amp; Analyze Resume
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Industry & Language Selectors */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1 mb-1">
              <Briefcase className="w-3 h-3 text-indigo-600" />
              Target Sector / Industry
            </label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-[12px] text-slate-800 font-medium outline-hidden focus:border-indigo-600"
            >
              {SUPPORTED_INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1 mb-1">
              <Globe className="w-3 h-3 text-indigo-600" />
              Language Context
            </label>
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-[12px] text-slate-800 font-medium outline-hidden focus:border-indigo-600"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.label.split(" ")[0]}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="m3-input-field">
          <input
            type="text"
            placeholder=" "
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
          />
          <label>Target Job Title (e.g. PGT Hindi Teacher, Accountant, Staff Nurse)</label>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center flex-wrap gap-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
              Quick Indian Profession Samples:
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={handlePasteTeacherSample}
                className="text-[10.5px] px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 font-bold hover:bg-orange-100"
              >
                Teacher (Hindi)
              </button>
              <button
                type="button"
                onClick={handlePasteAccountantSample}
                className="text-[10.5px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold hover:bg-blue-100"
              >
                Accountant (GST)
              </button>
              <button
                type="button"
                onClick={handlePasteNurseSample}
                className="text-[10.5px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold hover:bg-emerald-100"
              >
                Nurse (ICU)
              </button>
              <button
                type="button"
                onClick={handlePasteTechSample}
                className="text-[10.5px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-bold hover:bg-purple-100"
              >
                Tech / IT
              </button>
            </div>
          </div>
          <textarea
            rows={5}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste your teaching bio, clinical nursing record, accounting details, or tech resume text here..."
            className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-[12px] text-slate-900 outline-hidden focus:border-indigo-600 focus:bg-white transition-colors"
          />
        </div>

        {/* Optional Target Job Description */}
        <div>
          <button
            type="button"
            onClick={() => setShowJdInput(!showJdInput)}
            className="text-[12px] text-indigo-600 font-bold flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>{showJdInput ? "▲ Hide Job Description" : "▼ Compare against specific Job Posting (Optional)"}</span>
          </button>

          {showJdInput && (
            <textarea
              rows={3}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste target job requirements to calculate keyword match %..."
              className="mt-2 w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-[12px] text-slate-900 outline-hidden focus:border-indigo-600 focus:bg-white transition-colors"
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
                <Sparkles className="w-4 h-4" />
                Run Factual ATS Scan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
