import React, { useState } from "react";
import { Resume, ResumeAnalysis, JobComparisonResult } from "../types";
import { TopAppBar } from "./TopAppBar";

interface AtsScannerScreenProps {
  resumes: Resume[];
  activeResume: Resume;
  onSelectResume: (resume: Resume) => void;
  onUpdateResume: (resume: Resume) => void;
  onNavigateToBuilder: (resume: Resume) => void;
  onExportPdf?: (resume: Resume) => void;
  isExportingPdf?: boolean;
  onOpenSettings: () => void;
  onBackToDashboard: () => void;
}

export const AtsScannerScreen: React.FC<AtsScannerScreenProps> = ({
  resumes,
  activeResume,
  onSelectResume,
  onUpdateResume,
  onNavigateToBuilder,
  onExportPdf,
  isExportingPdf = false,
  onOpenSettings,
  onBackToDashboard,
}) => {
  const [selectedResumeId, setSelectedResumeId] = useState<string>(
    activeResume?.id || (resumes[0]?.id ?? "")
  );
  const [jobDescription, setJobDescription] = useState<string>("");
  const [targetRoleInput, setTargetRoleInput] = useState<string>(
    activeResume?.targetRole || ""
  );
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanError, setScanError] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysis | null>(
    activeResume?.analysis || null
  );
  const [jobComparison, setJobComparison] = useState<JobComparisonResult | null>(null);
  const [addedSkills, setAddedSkills] = useState<string[]>([]);
  const [showRawSummaryModal, setShowRawSummaryModal] = useState<boolean>(false);

  const currentSelectedResume =
    resumes.find((r) => r.id === selectedResumeId) || activeResume || resumes[0];

  const handleResumeSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedResumeId(id);
    const found = resumes.find((r) => r.id === id);
    if (found) {
      onSelectResume(found);
      setTargetRoleInput(found.targetRole || "");
      if (found.analysis) {
        setAnalysisResult(found.analysis);
      }
    }
  };

  const handleRunFullAtsScan = async () => {
    if (!currentSelectedResume) {
      setScanError("Please select or create a resume to scan.");
      return;
    }

    setScanError("");
    setIsScanning(true);

    try {
      // 1. Run ATS Analysis endpoint
      const atsRes = await fetch("/api/ai/ats-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData: currentSelectedResume,
          jobDescription: jobDescription.trim() || undefined,
        }),
      });

      if (!atsRes.ok) {
        throw new Error("Failed to process ATS analysis. Please check your network and retry.");
      }

      const atsData: ResumeAnalysis = await atsRes.json();
      setAnalysisResult(atsData);

      // 2. If a job description was provided, also run targeted job matching
      let compData: JobComparisonResult | null = null;
      if (jobDescription.trim().length > 20) {
        try {
          const matchRes = await fetch("/api/ai/analyze-job", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jobDescription: jobDescription.trim(),
              resumeData: currentSelectedResume,
            }),
          });
          if (matchRes.ok) {
            compData = await matchRes.json();
            setJobComparison(compData);
          }
        } catch (e) {
          console.warn("Targeted job comparison non-fatal error:", e);
        }
      }

      // 3. Persist analysis back to current resume
      const updatedResume: Resume = {
        ...currentSelectedResume,
        atsScore: atsData.atsScore || 80,
        analysis: atsData,
        targetRole: targetRoleInput.trim() || currentSelectedResume.targetRole,
        lastEdited: "Just now",
        updatedAt: Date.now(),
      };

      onUpdateResume(updatedResume);
    } catch (err: any) {
      console.error("ATS Scan Error:", err);
      setScanError(err.message || "Failed to complete ATS scan. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleAddSkillToResume = (skillName: string) => {
    if (!currentSelectedResume) return;
    if (!currentSelectedResume.skills.includes(skillName)) {
      const updatedSkills = [...currentSelectedResume.skills, skillName];
      const updated: Resume = {
        ...currentSelectedResume,
        skills: updatedSkills,
        lastEdited: "Just now",
        updatedAt: Date.now(),
      };
      onUpdateResume(updated);
      setAddedSkills((prev) => [...prev, skillName]);
    }
  };

  const handleApplyAIOptimizedSummary = () => {
    if (!analysisResult?.summaryOptimization?.aiOptimized || !currentSelectedResume) return;
    const updated: Resume = {
      ...currentSelectedResume,
      personal: {
        ...currentSelectedResume.personal,
        summary: analysisResult.summaryOptimization.aiOptimized,
      },
      lastEdited: "Just now",
      updatedAt: Date.now(),
    };
    onUpdateResume(updated);
    setShowRawSummaryModal(false);
  };

  const currentScore = analysisResult?.atsScore || currentSelectedResume?.atsScore || 75;
  const isHighScore = currentScore >= 80;
  const isMediumScore = currentScore >= 65 && currentScore < 80;

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] pb-28 pt-16 flex flex-col items-center">
      <TopAppBar
        title="AI Resume Studio"
        showBack={true}
        onBackClick={onBackToDashboard}
        onSettingsClick={onOpenSettings}
      />

      <main className="w-full max-w-4xl mx-auto px-4 py-5 flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-indigo-100 text-indigo-700">
                <span className="material-symbols-outlined text-[22px]">document_scanner</span>
              </span>
              <h1 className="text-[24px] md:text-[28px] font-extrabold text-slate-900 tracking-tight">
                ATS Scanner &amp; Matcher
              </h1>
            </div>
            <p className="text-[14px] text-slate-600 mt-1">
              Check how your resume matches target job descriptions and discover ATS improvements.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="ats-nav-to-builder-btn"
              onClick={() => onNavigateToBuilder(currentSelectedResume)}
              className="bg-white border border-slate-300 hover:border-indigo-500 text-slate-700 hover:text-indigo-600 text-[13px] font-bold px-4 py-2 rounded-full flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">edit_document</span>
              Resume Builder
            </button>

            {onExportPdf && currentSelectedResume && (
              <button
                id="ats-export-pdf-btn"
                disabled={isExportingPdf}
                onClick={() => onExportPdf(currentSelectedResume)}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-[13px] font-bold px-4 py-2 rounded-full flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
              >
                {isExportingPdf ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                )}
                Export PDF
              </button>
            )}
          </div>
        </div>

        {/* Scanner Input Panel */}
        <section className="bg-white rounded-3xl p-5 md:p-6 border border-slate-200/80 shadow-xs flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Select Resume */}
            <div>
              <label
                htmlFor="select-resume-for-scan"
                className="block text-[13px] font-bold text-slate-800 mb-1.5"
              >
                1. Select Resume to Scan:
              </label>
              <div className="relative">
                <select
                  id="select-resume-for-scan"
                  value={selectedResumeId}
                  onChange={handleResumeSelectChange}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-[14px] text-slate-900 font-semibold focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 appearance-none cursor-pointer"
                >
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title} ({r.targetRole || "General"} • {r.selectedTemplate || "Modern"})
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3.5 top-3.5 text-slate-400 pointer-events-none text-[20px]">
                  unfold_more
                </span>
              </div>
            </div>

            {/* 2. Target Job Role */}
            <div>
              <label
                htmlFor="target-job-role-input"
                className="block text-[13px] font-bold text-slate-800 mb-1.5"
              >
                2. Target Job Title (Optional):
              </label>
              <input
                id="target-job-role-input"
                type="text"
                placeholder="e.g. Senior Frontend Engineer, Product Manager"
                value={targetRoleInput}
                onChange={(e) => setTargetRoleInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          {/* 3. Job Description Text Area */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label
                htmlFor="job-description-scanner-textarea"
                className="text-[13px] font-bold text-slate-800"
              >
                3. Paste Target Job Description (Recommended for Keyword Match):
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                {jobDescription.length} characters
              </span>
            </div>
            <textarea
              id="job-description-scanner-textarea"
              rows={5}
              placeholder="Paste the job requirements, qualifications, and responsibilities here to calculate exact keyword alignment..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-4 text-[13.5px] text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 leading-relaxed font-sans"
            />
          </div>

          {scanError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-[13px] font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">error</span>
              <span>{scanError}</span>
            </div>
          )}

          {/* Scan Action Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="text-[12px] text-slate-500 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-indigo-600">
                verified_user
              </span>
              <span>Guardrails active: factual verification without fabricated numbers</span>
            </div>

            <button
              id="run-ats-scan-main-btn"
              onClick={handleRunFullAtsScan}
              disabled={isScanning}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-[14px] px-7 py-3 rounded-full flex items-center justify-center gap-2 shadow-md shadow-indigo-500/25 active:scale-95 transition-all cursor-pointer"
            >
              {isScanning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Scanning ATS Compatibility...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                  <span>Run ATS Scan</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Scan Results View */}
        {analysisResult && (
          <section className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Score & Verdict Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                {/* Circular Gauge */}
                <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center">
                  <svg
                    className="absolute inset-0 w-full h-full transform -rotate-90"
                    viewBox="0 0 36 36"
                  >
                    <path
                      className="text-slate-100 stroke-current"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      strokeWidth="3.5"
                    />
                    <path
                      className={`${
                        isHighScore
                          ? "text-emerald-500"
                          : isMediumScore
                          ? "text-amber-500"
                          : "text-rose-500"
                      } stroke-current transition-all duration-1000`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      strokeDasharray={`${currentScore}, 100`}
                      strokeLinecap="round"
                      strokeWidth="3.5"
                    />
                  </svg>
                  <div className="flex flex-col items-center">
                    <span className="text-[28px] font-extrabold text-slate-900 leading-none">
                      {currentScore}%
                    </span>
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-500 mt-1">
                      Score
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-[12px] font-bold font-mono border ${
                        isHighScore
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : isMediumScore
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-rose-50 text-rose-800 border-rose-200"
                      }`}
                    >
                      {isHighScore
                        ? "Strong Match"
                        : isMediumScore
                        ? "Moderate Match"
                        : "Needs Improvement"}
                    </span>
                    <span className="bg-slate-100 text-slate-600 text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full">
                      AI Estimate
                    </span>
                  </div>

                  <h3 className="text-[18px] font-bold text-slate-900 mt-1">
                    {currentSelectedResume.title}
                  </h3>
                  <p className="text-[13px] text-slate-600 leading-relaxed max-w-md">
                    {analysisResult.matchAssessment ||
                      "Your resume has been evaluated across readability, keyword alignment, and formatting structure."}
                  </p>
                  <p className="text-[11px] text-slate-600 font-mono mt-0.5">
                    * AI estimate based on content structure; not an official score from any commercial ATS vendor.
                  </p>
                </div>
              </div>

              {/* Action: Improve Resume in Builder */}
              <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full md:w-auto flex-shrink-0">
                <button
                  id="ats-improve-resume-btn"
                  onClick={() => onNavigateToBuilder(currentSelectedResume)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-bold px-6 py-3 rounded-full shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                  Improve Resume
                </button>

                {analysisResult.summaryOptimization?.aiOptimized && (
                  <button
                    onClick={() => setShowRawSummaryModal(true)}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[13px] font-bold px-4 py-2.5 rounded-full flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                    View AI Summary
                  </button>
                )}
              </div>
            </div>

            {/* Keyword Match & Gap Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Present Keywords */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[14px] font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[14px] font-bold">
                      ✓
                    </span>
                    Matched Keywords &amp; Skills
                  </h4>
                  <span className="text-[12px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {(jobComparison?.comparison?.matchedSkills?.length ||
                      analysisResult.presentKeywords?.length ||
                      currentSelectedResume.skills.length) + " found"}
                  </span>
                </div>

                <p className="text-[12px] text-slate-500">
                  Skills and terminology recognized by parsing engines:
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {(
                    jobComparison?.comparison?.matchedSkills ||
                    analysisResult.presentKeywords ||
                    currentSelectedResume.skills
                  ).map((kw) => (
                    <span
                      key={kw}
                      className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[12px] font-mono font-medium px-3 py-1 rounded-full flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[13px]">check</span>
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Recommended Keywords with 1-click Add */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[14px] font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[14px] font-bold">
                      +
                    </span>
                    Missing Recommended Keywords
                  </h4>
                  <span className="text-[12px] font-mono text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    {(jobComparison?.comparison?.missingSkills?.length ||
                      analysisResult.recommendedKeywords?.length ||
                      0) + " suggested"}
                  </span>
                </div>

                <p className="text-[12px] text-slate-500">
                  Click to add keywords you legitimately possess into your resume skills:
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {(
                    jobComparison?.comparison?.missingSkills ||
                    analysisResult.recommendedKeywords ||
                    []
                  ).map((kw) => {
                    const isAlreadyAdded =
                      addedSkills.includes(kw) || currentSelectedResume.skills.includes(kw);
                    return (
                      <button
                        key={kw}
                        type="button"
                        onClick={() => !isAlreadyAdded && handleAddSkillToResume(kw)}
                        disabled={isAlreadyAdded}
                        className={`text-[12px] font-mono font-medium px-3 py-1 rounded-full border transition-all flex items-center gap-1 cursor-pointer ${
                          isAlreadyAdded
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : "bg-slate-50 hover:bg-indigo-50 text-indigo-700 border-slate-200 hover:border-indigo-300"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {isAlreadyAdded ? "done" : "add"}
                        </span>
                        {kw}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Strategic Improvement Insights */}
            {analysisResult.insights && analysisResult.insights.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col gap-4">
                <h4 className="text-[16px] font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-600 text-[22px]">
                    lightbulb
                  </span>
                  Strategic ATS Alignment Recommendations
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {analysisResult.insights.map((insight, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-start gap-3"
                    >
                      <span className="p-2 rounded-xl bg-white text-indigo-600 shadow-xs border border-slate-100 flex-shrink-0">
                        <span className="material-symbols-outlined text-[20px]">
                          {insight.type === "check"
                            ? "task_alt"
                            : insight.type === "sort_by_alpha"
                            ? "format_align_left"
                            : "trending_up"}
                        </span>
                      </span>
                      <div>
                        <h5 className="text-[13.5px] font-bold text-slate-900">
                          {insight.title}
                        </h5>
                        <p className="text-[12.5px] text-slate-600 leading-relaxed mt-0.5">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* AI Optimized Summary Preview Modal */}
        {showRawSummaryModal && analysisResult?.summaryOptimization && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="text-[18px] font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-600">auto_awesome</span>
                  ATS-Optimized Executive Summary
                </h3>
                <button
                  onClick={() => setShowRawSummaryModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-100 text-[13.5px] text-slate-800 leading-relaxed">
                {analysisResult.summaryOptimization.aiOptimized}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowRawSummaryModal(false)}
                  className="px-4 py-2 rounded-full border border-slate-300 text-slate-700 text-[13px] font-bold"
                >
                  Close
                </button>
                <button
                  onClick={handleApplyAIOptimizedSummary}
                  className="px-5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-bold shadow-md"
                >
                  Apply to Resume
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
