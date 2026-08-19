import React, { useState } from "react";
import { SUPPORTED_INDUSTRIES, SUPPORTED_LANGUAGES } from "../types";
import { Sparkles, X, RefreshCw, Check, AlertCircle, Briefcase, Globe } from "lucide-react";

interface BulletEnhancerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBullet: string;
  jobTitle?: string;
  company?: string;
  defaultIndustry?: string;
  defaultLanguage?: string;
  onApply: (enhancedBullet: string) => void;
}

export const BulletEnhancerModal: React.FC<BulletEnhancerModalProps> = ({
  isOpen,
  onClose,
  currentBullet,
  jobTitle,
  company,
  defaultIndustry = "General Professional",
  defaultLanguage = "English",
  onApply,
}) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [variations, setVariations] = useState<string[]>([]);
  const [selectedVariation, setSelectedVariation] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState("");

  const [industry, setIndustry] = useState(defaultIndustry);
  const [preferredLanguage, setPreferredLanguage] = useState(defaultLanguage);

  if (!isOpen) return null;

  const handleEnhance = async () => {
    setIsEnhancing(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/ai/improve-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bullet: currentBullet,
          jobTitle,
          company,
          industry,
          preferredLanguage,
          section: "Experience",
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to enhance bullet point");
      }

      const data = await res.json();
      const list = data.variations || data.enhancedBullets || [data.improvedContent];
      setVariations(list);
      setSelectedVariation(list[0] || "");
    } catch (err: any) {
      console.error("Enhance bullet error:", err);
      setErrorMsg(err.message || "Failed to enhance bullet");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleApply = () => {
    if (selectedVariation.trim()) {
      onApply(selectedVariation.trim());
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
              <h2 className="text-[17px] font-bold tracking-tight">AI Bullet Optimizer</h2>
              <p className="text-[12px] text-indigo-200">
                {jobTitle ? `${jobTitle} at ${company || "Organization"}` : "Strengthen action verbs and clarity"}
              </p>
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
          {/* Domain & Language selector */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1 mb-1">
                <Briefcase className="w-3 h-3 text-indigo-600" />
                Industry Focus
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

          {/* Current Bullet */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Current Bullet
            </span>
            <p className="text-[13px] text-slate-700 italic leading-relaxed">
              {currentBullet || "(Empty bullet point)"}
            </p>
          </div>

          {/* Options */}
          {variations.length > 0 ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-slate-800">
                  Select Preferred ATS Variation ({preferredLanguage}):
                </span>
                <button
                  type="button"
                  onClick={handleEnhance}
                  disabled={isEnhancing}
                  className="text-indigo-600 hover:text-indigo-800 text-[12px] font-bold flex items-center gap-1 font-mono cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  Try More
                </button>
              </div>

              <div className="flex flex-col gap-2.5">
                {variations.map((v, i) => {
                  const isSelected = selectedVariation === v;
                  return (
                    <div
                      key={i}
                      onClick={() => setSelectedVariation(v)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? "bg-indigo-50/90 border-indigo-500 shadow-xs ring-2 ring-indigo-200"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300"
                      }`}>
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                      <p className="text-[13px] text-slate-800 leading-relaxed font-medium">
                        {v}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Editable custom refinement */}
              <div className="mt-2">
                <label className="text-[11px] font-bold font-mono text-slate-500 uppercase tracking-wider block mb-1">
                  Or edit selected variation directly:
                </label>
                <textarea
                  rows={2}
                  value={selectedVariation}
                  onChange={(e) => setSelectedVariation(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-[13px] text-slate-900 focus:outline-hidden focus:border-indigo-600"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl text-center gap-3">
              <Sparkles className="w-8 h-8 text-indigo-400" />
              <div>
                <h4 className="text-[14px] font-bold text-slate-800">
                  Ready to optimize this bullet?
                </h4>
                <p className="text-[12px] text-slate-500 max-w-sm mt-0.5">
                  AI will adapt vocabulary for {industry} ({preferredLanguage}) while ensuring complete factual integrity.
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
          {variations.length === 0 ? (
            <button
              type="button"
              id="modal-generate-bullets-btn"
              onClick={handleEnhance}
              disabled={isEnhancing}
              className="px-6 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-[13px] font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {isEnhancing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Optimizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Enhance with AI</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              id="modal-apply-bullet-btn"
              onClick={handleApply}
              disabled={!selectedVariation.trim()}
              className="px-6 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-[13px] font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Apply Bullet</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
