import React, { useState } from "react";
import { Resume, SUPPORTED_INDUSTRIES, SUPPORTED_LANGUAGES } from "../types";
import { Sparkles, X, RefreshCw, Check, AlertCircle, Briefcase, Globe } from "lucide-react";

interface SummaryAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  resume: Resume;
  onApply: (newSummary: string) => void;
}

export const SummaryAiModal: React.FC<SummaryAiModalProps> = ({
  isOpen,
  onClose,
  resume,
  onApply,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [industry, setIndustry] = useState(
    resume.classification?.industry || "Education / Teaching"
  );
  const [preferredLanguage, setPreferredLanguage] = useState(
    resume.preferredLanguage || resume.classification?.language || "English"
  );

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/ai/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draft: resume.personal.summary,
          targetRole: resume.targetRole || resume.classification?.profession || "Professional",
          industry,
          preferredLanguage,
          roleLevel: resume.classification?.roleLevel || "Experienced",
          resumeData: resume,
          skills: resume.skills,
          experience: resume.experiences,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate summary with AI");
      }

      const data = await res.json();
      setGeneratedSummary(data.summary || data.optimizedSummary || "");
    } catch (err: any) {
      console.error("AI Summary error:", err);
      setErrorMsg(err.message || "Failed to generate summary");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (generatedSummary.trim()) {
      onApply(generatedSummary.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-scale-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-purple-800 px-6 py-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-[17px] font-bold tracking-tight">AI Professional Summary</h2>
              <p className="text-[12px] text-indigo-200">Domain-tailored, truthful ATS summary generation</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
          {/* Industry & Language Context Selection */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1 mb-1">
                <Briefcase className="w-3 h-3 text-indigo-600" />
                Industry / Sector
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
                Language
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

          {/* Current Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Current Draft
            </span>
            <p className="text-[13px] text-slate-600 italic leading-relaxed">
              {resume.personal.summary || "(Empty draft)"}
            </p>
          </div>

          {/* AI Result Area */}
          {generatedSummary ? (
            <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  AI-Generated Proposal ({preferredLanguage})
                </span>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="text-indigo-600 hover:text-indigo-800 text-[12px] font-bold flex items-center gap-1 font-mono cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  Regenerate
                </button>
              </div>
              <textarea
                rows={4}
                value={generatedSummary}
                onChange={(e) => setGeneratedSummary(e.target.value)}
                className="w-full p-2.5 bg-white border border-indigo-200 rounded-xl text-[13.5px] text-slate-900 font-medium leading-relaxed focus:outline-hidden focus:border-indigo-600"
              />
              <p className="text-[11.5px] text-slate-500">
                You can edit this text directly before applying it to your resume.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl text-center gap-3">
              <Sparkles className="w-8 h-8 text-indigo-400" />
              <div>
                <h4 className="text-[14px] font-bold text-slate-800">
                  Ready to craft a domain-tailored summary?
                </h4>
                <p className="text-[12px] text-slate-500 max-w-sm mt-0.5">
                  AI synthesizes your skills and verified experience for {industry} in {preferredLanguage} without inventing false facts.
                </p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[13px] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errorMsg}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full border border-slate-300 text-slate-700 text-[13px] font-bold hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          {!generatedSummary ? (
            <button
              type="button"
              id="modal-generate-summary-btn"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-6 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-[13px] font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate with AI</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              id="modal-apply-summary-btn"
              onClick={handleApply}
              className="px-6 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Apply to Resume</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
