import React, { useState } from "react";
import { ProjectItem } from "../types";

interface ProjectEnhancerModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectItem;
  onApply: (improvedDescription: string, bulletPoints: string[]) => void;
}

export const ProjectEnhancerModal: React.FC<ProjectEnhancerModalProps> = ({
  isOpen,
  onClose,
  project,
  onApply,
}) => {
  const [isImproving, setIsImproving] = useState(false);
  const [improvedDesc, setImprovedDesc] = useState("");
  const [bullets, setBullets] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleImprove = async () => {
    setIsImproving(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/ai/improve-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project }),
      });

      if (!res.ok) {
        throw new Error("Failed to improve project");
      }

      const data = await res.json();
      setImprovedDesc(data.improvedDescription || "");
      setBullets(data.bulletPoints || []);
    } catch (err: any) {
      console.error("Improve project error:", err);
      setErrorMsg(err.message || "Failed to improve project");
    } finally {
      setIsImproving(false);
    }
  };

  const handleApply = () => {
    onApply(improvedDesc, bullets);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 to-purple-800 px-6 py-4 flex items-center justify-between text-white flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">code</span>
            </div>
            <div>
              <h2 className="text-[17px] font-bold tracking-tight">AI Project Description</h2>
              <p className="text-[12px] text-indigo-200">{project.title || "Software Project"}</p>
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
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Current Description
            </span>
            <p className="text-[13px] text-slate-700 italic leading-relaxed">
              {project.description || "(Empty project description)"}
            </p>
          </div>

          {improvedDesc ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-indigo-900 font-mono flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  AI Improved Description:
                </span>
                <button
                  type="button"
                  onClick={handleImprove}
                  disabled={isImproving}
                  className="text-indigo-600 hover:text-indigo-800 text-[12px] font-bold flex items-center gap-1 font-mono cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">refresh</span>
                  Regenerate
                </button>
              </div>

              <textarea
                rows={3}
                value={improvedDesc}
                onChange={(e) => setImprovedDesc(e.target.value)}
                className="w-full p-3 bg-white border border-indigo-200 rounded-xl text-[13px] text-slate-900 leading-relaxed focus:outline-hidden focus:border-indigo-600"
              />

              {bullets.length > 0 && (
                <div className="bg-indigo-50/50 p-3.5 rounded-2xl border border-indigo-100 flex flex-col gap-2">
                  <span className="text-[11px] font-mono font-bold text-indigo-800 uppercase tracking-wider">
                    Suggested Bullet Points:
                  </span>
                  <ul className="flex flex-col gap-1.5">
                    {bullets.map((b, idx) => (
                      <li key={idx} className="text-[12.5px] text-slate-700 flex items-start gap-2">
                        <span className="text-indigo-600 font-bold">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl text-center gap-3">
              <span className="material-symbols-outlined text-[36px] text-indigo-400">
                auto_awesome
              </span>
              <div>
                <h4 className="text-[14px] font-bold text-slate-800">
                  Highlight technical architecture
                </h4>
                <p className="text-[12px] text-slate-500 max-w-sm mt-0.5">
                  AI will reframe this project to showcase architecture and design patterns truthfully.
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
          {!improvedDesc ? (
            <button
              type="button"
              id="modal-improve-project-btn"
              onClick={handleImprove}
              disabled={isImproving}
              className="px-6 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-[13px] font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {isImproving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Improving...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                  <span>Improve with AI</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              id="modal-apply-project-btn"
              onClick={handleApply}
              className="px-6 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">check</span>
              <span>Apply Project Details</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
