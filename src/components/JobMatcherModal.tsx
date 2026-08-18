import React, { useState } from "react";
import { Resume, JobComparisonResult } from "../types";

interface JobMatcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  resume: Resume;
  onAddSkill: (skill: string) => void;
  onApplyTargetRole?: (role: string) => void;
}

export const JobMatcherModal: React.FC<JobMatcherModalProps> = ({
  isOpen,
  onClose,
  resume,
  onAddSkill,
  onApplyTargetRole,
}) => {
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<JobComparisonResult | null>(null);
  const [addedSkills, setAddedSkills] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setErrorMsg("Please paste a job description first.");
      return;
    }
    setErrorMsg("");
    setIsAnalyzing(true);

    try {
      const res = await fetch("/api/ai/analyze-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          resumeData: resume,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to analyze job description");
      }

      const data: JobComparisonResult = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error("Job analysis error:", err);
      setErrorMsg(err.message || "Failed to analyze. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddMissingSkill = (skill: string) => {
    onAddSkill(skill);
    setAddedSkills((prev) => [...prev, skill]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-purple-800 px-6 py-4 flex items-center justify-between text-white flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">target</span>
            </div>
            <div>
              <h2 className="text-[17px] font-bold tracking-tight leading-none">
                Job Description Matcher
              </h2>
              <p className="text-[12px] text-indigo-200 mt-1">
                Evaluate compatibility against a specific target role
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
          {!result ? (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[13px] font-bold text-slate-800 block mb-1.5">
                  Paste Target Job Description:
                </label>
                <textarea
                  rows={8}
                  placeholder="Paste the full job post, requirements, and responsibilities here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full p-3.5 border border-slate-300 rounded-2xl text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 font-sans leading-relaxed"
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[13px] font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  {errorMsg}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-full border border-slate-300 text-slate-700 text-[13px] font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="submit-job-analysis-btn"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !jobDescription.trim()}
                  className="px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-[13px] font-bold shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Analyzing Alignment...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                      <span>Run Match Analysis</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {/* Match Score Summary */}
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex flex-col items-center justify-center font-bold shadow-md">
                    <span className="text-[22px] leading-none">
                      {result.comparison.estimatedMatchPercentage}%
                    </span>
                    <span className="text-[9px] uppercase font-mono tracking-wider opacity-90 mt-0.5">
                      Match
                    </span>
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-slate-900">
                      Target Compatibility: {result.comparison.estimatedMatchPercentage}%
                    </h3>
                    <p className="text-[12px] text-slate-600">
                      AI ATS estimate based on required qualifications and keywords.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setResult(null)}
                  className="text-indigo-600 hover:underline text-[12px] font-bold flex items-center gap-1 font-mono"
                >
                  <span className="material-symbols-outlined text-[16px]">refresh</span>
                  Analyze Another JD
                </button>
              </div>

              {/* Matched Skills */}
              <div className="flex flex-col gap-2">
                <h4 className="text-[13px] font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
                  Matched Skills in Your Resume ({result.comparison.matchedSkills.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {result.comparison.matchedSkills.map((s) => (
                    <span
                      key={s}
                      className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[12px] font-mono font-medium px-3 py-1 rounded-full flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[13px]">check</span>
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Skills with 1-click Add */}
              <div className="flex flex-col gap-2">
                <h4 className="text-[13px] font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-amber-500 text-[18px]">warning</span>
                  Missing Key Skills from Job Description ({result.comparison.missingSkills.length})
                </h4>
                <p className="text-[12px] text-slate-500">
                  Click to add only the skills you genuinely possess:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.comparison.missingSkills.map((s) => {
                    const isAdded = addedSkills.includes(s) || resume.skills.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => !isAdded && handleAddMissingSkill(s)}
                        disabled={isAdded}
                        className={`text-[12px] font-mono font-medium px-3 py-1 rounded-full border transition-all flex items-center gap-1 cursor-pointer ${
                          isAdded
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : "bg-slate-100 hover:bg-indigo-50 text-indigo-700 border-slate-200 hover:border-indigo-300"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {isAdded ? "done" : "add"}
                        </span>
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col gap-2">
                <h4 className="text-[13px] font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-indigo-600 text-[18px]">lightbulb</span>
                  Strategic ATS Alignment Tips
                </h4>
                <ul className="flex flex-col gap-1.5 pl-1">
                  {result.comparison.recommendations.map((rec, i) => (
                    <li key={i} className="text-[12.5px] text-slate-600 flex items-start gap-2 leading-relaxed">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-bold shadow-md transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
