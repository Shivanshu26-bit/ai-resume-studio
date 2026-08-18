import React, { useState } from "react";
import { Resume, ResumeAnalysis } from "../types";
import { TopAppBar } from "./TopAppBar";

interface AnalysisResultsScreenProps {
  resume: Resume;
  analysis: ResumeAnalysis;
  onApplyOptimizedSummary: (newSummary: string) => void;
  onAddKeyword: (keyword: string) => void;
  onSaveToProfile: () => void;
  onExportPdf: () => void;
  isExportingPdf?: boolean;
  onBack: () => void;
  onOpenSettings: () => void;
}

export const AnalysisResultsScreen: React.FC<AnalysisResultsScreenProps> = ({
  resume,
  analysis,
  onApplyOptimizedSummary,
  onAddKeyword,
  onSaveToProfile,
  onExportPdf,
  isExportingPdf = false,
  onBack,
  onOpenSettings,
}) => {
  const [appliedSummary, setAppliedSummary] = useState(false);
  const [addedKeywords, setAddedKeywords] = useState<string[]>([]);
  const [savedToProfile, setSavedToProfile] = useState(false);

  const atsScore = analysis.atsScore || 85;
  // Calculate SVG dashoffset based on 282.7 circumference (r=45)
  // offset = 282.7 - (atsScore / 100) * 282.7
  const strokeDashoffset = 282.7 - (atsScore / 100) * 282.7;

  const handleApplySummary = () => {
    if (analysis.summaryOptimization?.aiOptimized) {
      onApplyOptimizedSummary(analysis.summaryOptimization.aiOptimized);
      setAppliedSummary(true);
      setTimeout(() => setAppliedSummary(false), 3000);
    }
  };

  const handleChipClick = (keyword: string) => {
    onAddKeyword(keyword);
    setAddedKeywords((prev) => [...prev, keyword]);
  };

  const handleSave = () => {
    onSaveToProfile();
    setSavedToProfile(true);
    setTimeout(() => setSavedToProfile(false), 3000);
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] pb-28 pt-16 flex flex-col items-center">
      <TopAppBar
        title="AI Resume Studio"
        showBack={true}
        onBackClick={onBack}
        onSettingsClick={onOpenSettings}
      />

      <main className="w-full max-w-4xl mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Header Section */}
        <div className="text-center">
          <h1 className="text-[26px] md:text-[32px] font-extrabold text-slate-900 mb-1.5 tracking-tight">
            Analysis Complete
          </h1>
          <p className="text-[15px] text-slate-600 max-w-md mx-auto">
            Your resume has been optimized for Applicant Tracking Systems.
          </p>
        </div>

        {/* ATS Score Gauge Section */}
        <section className="flex flex-col items-center">
          <div className="relative w-48 h-48 md:w-56 md:h-56 flex items-center justify-center mb-4">
            <svg
              className="absolute inset-0 w-full h-full transform -rotate-90"
              viewBox="0 0 100 100"
            >
              {/* Background Track */}
              <circle
                className="text-slate-200"
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="7.5"
              />
              {/* Progress Track */}
              <circle
                className="text-emerald-500 transition-all duration-1000 ease-out"
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray="282.7"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="text-center z-10 flex flex-col items-center">
              <span className="text-[48px] md:text-[54px] font-extrabold text-emerald-600 leading-none tracking-tight">
                {atsScore}
              </span>
              <span className="text-[11px] font-bold font-mono text-slate-500 tracking-widest mt-1 uppercase">
                AI ATS Estimate
              </span>
            </div>
          </div>

          {/* Role Match Status Badge */}
          <div className="bg-emerald-50/90 rounded-2xl py-3 px-5 border border-emerald-200/80 inline-flex items-center gap-2.5 shadow-xs max-w-xl text-center">
            <span
              className="material-symbols-outlined text-emerald-600 text-[20px] flex-shrink-0"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
            <span className="text-[13.5px] text-emerald-950 font-semibold leading-snug">
              {analysis.matchAssessment || `AI ATS Estimate: Tailored match assessment for ${resume.targetRole || "Software Developer"}.`}
            </span>
          </div>
        </section>

        {/* 2-Column Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-1">
          {/* Left Column: Present Keywords, Recommended Keywords & Insights */}
          <div className="flex flex-col gap-6">
            {/* Keywords Section: Present vs Missing/Recommended */}
            <section className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/60 rounded-bl-full pointer-events-none" />
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700">
                  <span className="material-symbols-outlined text-[18px]">key</span>
                </div>
                <h2 className="text-[18px] font-bold text-slate-900">
                  Keywords & ATS Alignment
                </h2>
              </div>
              <p className="text-[13px] text-slate-600 mb-4 leading-relaxed">
                Applicant Tracking Systems compare skills found in your resume against target job requirements.
              </p>

              {/* Already Present Keywords */}
              <div className="mb-4">
                <span className="text-[11px] font-bold font-mono text-emerald-800 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Identified in Your Resume ({analysis.presentKeywords?.length || resume.skills.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(analysis.presentKeywords && analysis.presentKeywords.length > 0
                    ? analysis.presentKeywords
                    : resume.skills
                  ).map((kw, i) => (
                    <span
                      key={`present-${i}`}
                      className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11.5px] font-mono font-medium"
                    >
                      ✓ {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recommended / Missing Keywords */}
              <div>
                <span className="text-[11px] font-bold font-mono text-indigo-800 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  Recommended to Consider (Missing)
                </span>
                <div className="flex flex-wrap gap-2">
                  {(analysis.recommendedKeywords || ["REST APIs", "Unit Testing", "Version Control (Git)", "Clean Architecture"]).map(
                    (kw) => {
                      const isAdded = addedKeywords.includes(kw) || resume.skills.includes(kw);
                      return (
                        <button
                          key={kw}
                          id={`add-keyword-chip-${kw.toLowerCase().replace(/\s+/g, "-")}`}
                          onClick={() => !isAdded && handleChipClick(kw)}
                          disabled={isAdded}
                          className={`px-3 py-1.5 rounded-full border text-[11.5px] font-mono font-medium flex items-center gap-1.5 transition-all duration-200 active:scale-95 cursor-pointer ${
                            isAdded
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs"
                              : "bg-slate-100 text-indigo-700 border-slate-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[13px]">
                            {isAdded ? "done" : "add"}
                          </span>
                          {kw}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            </section>

            {/* Actionable Insights Card */}
            <section className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700">
                  <span className="material-symbols-outlined text-[18px]">lightbulb</span>
                </div>
                <h2 className="text-[18px] font-bold text-slate-900">
                  Actionable Insights
                </h2>
              </div>

              <div className="flex flex-col gap-3.5">
                {(analysis.insights || [
                  {
                    title: "Clarify Technical Contributions",
                    description: "Ensure each project or experience bullet specifies the exact technologies used and your individual contribution.",
                    type: "sort_by_alpha"
                  },
                  {
                    title: "Add Verifiable Metrics Only",
                    description: "Include quantifiable achievements only when verifiable; otherwise emphasize problem-solving methodologies.",
                    type: "trending_up"
                  }
                ]).map((insight, idx) => (
                  <div
                    key={idx}
                    className="flex gap-3.5 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
                  >
                    <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 text-indigo-600">
                      <span className="material-symbols-outlined text-[18px]">
                        {insight.type === "sort_by_alpha" ? "sort_by_alpha" : "trending_up"}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-[14px] font-bold text-slate-900">
                        {insight.title}
                      </h3>
                      <p className="text-[13px] text-slate-600 mt-0.5 leading-relaxed">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Breakdown & Summary Optimization */}
          <div className="flex flex-col gap-6">
            {/* Detailed Alignment Breakdown */}
            {analysis.breakdown && (
              <section className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-xs">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700">
                    <span className="material-symbols-outlined text-[18px]">bar_chart</span>
                  </div>
                  <h2 className="text-[18px] font-bold text-slate-900">
                    Category Breakdown
                  </h2>
                </div>

                <div className="flex flex-col gap-3 font-sans">
                  {analysis.breakdown.keywordMatch && (
                    <div>
                      <div className="flex justify-between text-[12px] font-semibold text-slate-700 mb-1">
                        <span>Keyword Alignment</span>
                        <span className="font-mono">{analysis.breakdown.keywordMatch.score}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full"
                          style={{ width: `${analysis.breakdown.keywordMatch.score}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {analysis.breakdown.skillsMatch && (
                    <div>
                      <div className="flex justify-between text-[12px] font-semibold text-slate-700 mb-1">
                        <span>Technical Skills Match</span>
                        <span className="font-mono">{analysis.breakdown.skillsMatch.score}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full"
                          style={{ width: `${analysis.breakdown.skillsMatch.score}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {analysis.breakdown.experienceAlignment && (
                    <div>
                      <div className="flex justify-between text-[12px] font-semibold text-slate-700 mb-1">
                        <span>Experience / Seniority Fit</span>
                        <span className="font-mono">{analysis.breakdown.experienceAlignment.score}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full"
                          style={{ width: `${analysis.breakdown.experienceAlignment.score}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {analysis.breakdown.formattingReadability && (
                    <div>
                      <div className="flex justify-between text-[12px] font-semibold text-slate-700 mb-1">
                        <span>ATS Readability & Format</span>
                        <span className="font-mono">{analysis.breakdown.formattingReadability.score}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-teal-600 h-full rounded-full"
                          style={{ width: `${analysis.breakdown.formattingReadability.score}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Summary Optimization Card */}
            <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col flex-1">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-600">auto_awesome</span>
                  <h2 className="text-[16px] font-bold text-slate-900">
                    Summary Optimization
                  </h2>
                </div>
                {appliedSummary && (
                  <span className="text-[11px] font-mono bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
                    Applied to Resume ✓
                  </span>
                )}
              </div>

              <div className="flex-1 flex flex-col">
                {/* Original Draft Box */}
                <div className="p-5 border-b border-slate-200/80 bg-white">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    <span className="text-[11px] font-bold font-mono text-slate-500 uppercase tracking-wider">
                      Original Draft
                    </span>
                  </div>
                  <p className="text-[13px] text-slate-600 italic leading-relaxed">
                    "{analysis.summaryOptimization?.originalDraft || resume.personal.summary || "Software professional seeking development opportunities."}"
                  </p>
                </div>

                {/* AI Optimized Version Box */}
                <div className="p-5 flex-1 bg-indigo-50/40 relative group flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                        <span className="text-[11px] font-bold font-mono text-indigo-800 uppercase tracking-wider">
                          AI Optimized Version
                        </span>
                      </div>
                      <button
                        id="apply-optimized-summary-btn"
                        onClick={handleApplySummary}
                        className="bg-indigo-600 text-white hover:bg-indigo-700 text-[11px] font-bold px-3 py-1 rounded-full shadow-xs transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                      >
                        Apply
                        <span className="material-symbols-outlined text-[14px]">check</span>
                      </button>
                    </div>
                    <p className="text-[13px] text-slate-900 font-medium leading-relaxed">
                      "{analysis.summaryOptimization?.aiOptimized || "Dedicated software professional with hands-on project experience in modern programming technologies. Committed to applying engineering fundamentals, building reliable software, and continuously learning."}"
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <section className="mt-4 pt-4 border-t border-slate-200 flex flex-col sm:flex-row gap-3.5 items-center justify-center">
          <button
            id="analysis-export-pdf-btn"
            onClick={onExportPdf}
            disabled={isExportingPdf}
            className={`w-full sm:w-auto bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-full py-3.5 px-8 text-[15px] font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all active:scale-95 ${
              isExportingPdf ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            {isExportingPdf ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Exporting A4 PDF...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                <span>Export PDF</span>
              </>
            )}
          </button>

          <button
            id="analysis-save-profile-btn"
            onClick={handleSave}
            className="w-full sm:w-auto border-2 border-indigo-600 text-indigo-700 bg-white hover:bg-indigo-50 rounded-full py-3 px-8 text-[15px] font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">
              {savedToProfile ? "check" : "bookmark"}
            </span>
            {savedToProfile ? "Saved to Profile!" : "Save to Profile"}
          </button>
        </section>
      </main>
    </div>
  );
};
