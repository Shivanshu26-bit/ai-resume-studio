import React, { useState } from "react";
import { Resume } from "../types";

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
          targetRole: resume.targetRole || "Software Developer",
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
      <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 to-purple-800 px-6 py-4 flex items-center justify-between text-white flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
            </div>
            <div>
              <h2 className="text-[17px] font-bold tracking-tight">AI Professional Summary</h2>
              <p className="text-[12px] text-indigo-200">Truthful, ATS-optimized summary generation</p>
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

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
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
                  AI-Generated Proposal
                </span>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="text-indigo-600 hover:text-indigo-800 text-[12px] font-bold flex items-center gap-1 font-mono"
                >
                  <span className="material-symbols-outlined text-[15px]">refresh</span>
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
              <span className="material-symbols-outlined text-[36px] text-indigo-400">
                psychology
              </span>
              <div>
                <h4 className="text-[14px] font-bold text-slate-800">
                  Ready to craft an ATS-tailored summary?
                </h4>
                <p className="text-[12px] text-slate-500 max-w-sm mt-0.5">
                  Gemini AI will synthesize your skills and actual experience without fabricating false metrics.
                </p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[13px] flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {errorMsg}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 flex-shrink-0">
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
                  <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
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
              <span className="material-symbols-outlined text-[16px]">check</span>
              <span>Apply to Resume</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
