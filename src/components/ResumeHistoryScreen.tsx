import React, { useState } from "react";
import { Resume } from "../types";
import { TopAppBar } from "./TopAppBar";

interface ResumeHistoryScreenProps {
  resumes: Resume[];
  onSelectResume: (resume: Resume) => void;
  onNewResume: () => void;
  onDeleteResume: (id: string) => void;
  onDuplicateResume: (resume: Resume) => void;
  onExportPdf?: (resume: Resume) => void;
  exportingResumeId?: string | null;
  onOpenSettings: () => void;
}

export const ResumeHistoryScreen: React.FC<ResumeHistoryScreenProps> = ({
  resumes,
  onSelectResume,
  onNewResume,
  onDeleteResume,
  onDuplicateResume,
  onExportPdf,
  exportingResumeId = null,
  onOpenSettings,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterScore, setFilterScore] = useState<"all" | "high" | "needs-work">("all");

  const filtered = resumes.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.targetRole.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterScore === "high") return (r.atsScore || 0) >= 80;
    if (filterScore === "needs-work") return (r.atsScore || 0) < 80;
    return true;
  });

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] pb-28 pt-16 flex flex-col items-center">
      <TopAppBar
        title="Resume History"
        onAvatarClick={onOpenSettings}
        onSettingsClick={onOpenSettings}
      />

      <main className="w-full max-w-2xl px-4 py-5 flex flex-col gap-4">
        {/* Header & New Resume CTA */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-[22px] font-extrabold text-slate-900">Saved Resumes</h1>
            <p className="text-[13px] text-slate-600 font-medium">
              {resumes.length} {resumes.length === 1 ? "document" : "documents"} in your portfolio
            </p>
          </div>
          <button
            id="history-new-resume-btn"
            onClick={onNewResume}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-bold px-4 py-2 rounded-full flex items-center gap-1.5 shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Resume
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative bg-white rounded-2xl border border-slate-200/80 shadow-xs focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all overflow-hidden flex items-center px-4 py-2.5">
          <span className="material-symbols-outlined text-slate-400 text-[20px] mr-2">
            search
          </span>
          <input
            id="search-resumes-input"
            type="text"
            placeholder="Search by title or target role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none text-[14px] text-slate-900 outline-hidden placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-slate-400 hover:text-slate-800 p-1"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterScore("all")}
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-mono font-semibold transition-all ${
              filterScore === "all"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            All ({resumes.length})
          </button>
          <button
            onClick={() => setFilterScore("high")}
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-mono font-semibold transition-all ${
              filterScore === "high"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-50"
            }`}
          >
            High ATS ≥80%
          </button>
          <button
            onClick={() => setFilterScore("needs-work")}
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-mono font-semibold transition-all ${
              filterScore === "needs-work"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-white border border-slate-200 text-amber-700 hover:bg-amber-50"
            }`}
          >
            Needs Work &lt;80%
          </button>
        </div>

        {/* Resumes List */}
        <div className="flex flex-col gap-3 mt-2">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center flex flex-col items-center">
              <span className="material-symbols-outlined text-[48px] text-slate-400 mb-2">
                find_in_page
              </span>
              <h3 className="text-[16px] font-bold text-slate-900">No resumes found</h3>
              <p className="text-[13px] text-slate-600 max-w-xs mt-1">
                Try adjusting your search filter or create a brand new ATS-optimized resume.
              </p>
              <button
                onClick={onNewResume}
                className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-semibold px-4 py-2 rounded-full shadow-xs"
              >
                Create New Resume
              </button>
            </div>
          ) : (
            filtered.map((resume) => {
              const score = resume.atsScore || 75;
              const isHigh = score >= 80;

              return (
                <div
                  key={resume.id}
                  className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col gap-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3
                        onClick={() => onSelectResume(resume)}
                        className="text-[17px] font-bold text-slate-900 hover:text-indigo-600 cursor-pointer transition-colors"
                      >
                        {resume.title}
                      </h3>
                      <p className="text-[13px] font-semibold text-indigo-600 font-mono mt-0.5">
                        {resume.targetRole}
                      </p>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Last edited: {resume.lastEdited}
                      </span>
                    </div>

                    <div
                      className={`px-3 py-1 rounded-full font-mono text-[12px] font-bold flex items-center gap-1 border ${
                        isHigh
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      <span>{score}%</span>
                      <span className="material-symbols-outlined text-[16px]">
                        {isHigh ? "check_circle" : "warning"}
                      </span>
                    </div>
                  </div>

                  {/* Skills mini tags */}
                  <div className="flex flex-wrap gap-1">
                    {resume.skills.slice(0, 4).map((s) => (
                      <span
                        key={s}
                        className="bg-indigo-50/70 text-indigo-800 text-[11px] font-mono px-2 py-0.5 rounded-md border border-indigo-100/60 font-medium"
                      >
                        {s}
                      </span>
                    ))}
                    {resume.skills.length > 4 && (
                      <span className="text-[11px] text-slate-500 font-mono self-center">
                        +{resume.skills.length - 4} more
                      </span>
                    )}
                  </div>

                  {/* Action row */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <button
                      onClick={() => onSelectResume(resume)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] font-bold px-4 py-1.5 rounded-full flex items-center gap-1 active:scale-95 shadow-xs transition-all"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                      Open & Optimize
                    </button>

                    <div className="flex items-center gap-1">
                      {onExportPdf && (
                        <button
                          title="Export PDF"
                          disabled={exportingResumeId === resume.id}
                          onClick={() => onExportPdf(resume)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors text-[11.5px] font-bold border border-slate-200 hover:border-indigo-300 active:scale-95"
                        >
                          {exportingResumeId === resume.id ? (
                            <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <span className="material-symbols-outlined text-[16px] text-indigo-600">
                              picture_as_pdf
                            </span>
                          )}
                          <span>PDF</span>
                        </button>
                      )}
                      <button
                        title="Duplicate"
                        onClick={() => onDuplicateResume(resume)}
                        className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          content_copy
                        </span>
                      </button>
                      <button
                        title="Delete"
                        onClick={() => onDeleteResume(resume.id)}
                        className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          delete
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};
