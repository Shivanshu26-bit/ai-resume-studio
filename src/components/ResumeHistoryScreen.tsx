import React, { useState } from "react";
import { Resume, BottomNavTab } from "../types";
import { TopAppBar } from "./TopAppBar";

interface ResumeHistoryScreenProps {
  resumes: Resume[];
  onSelectResume: (resume: Resume) => void;
  onScanResume?: (resume: Resume) => void;
  onNewResume: () => void;
  onDeleteResume: (id: string) => void;
  onDuplicateResume: (resume: Resume) => void;
  onExportPdf?: (resume: Resume) => void;
  exportingResumeId?: string | null;
  onOpenSettings: () => void;
  onTabChange?: (tab: BottomNavTab) => void;
}

export const ResumeHistoryScreen: React.FC<ResumeHistoryScreenProps> = ({
  resumes,
  onSelectResume,
  onScanResume,
  onNewResume,
  onDeleteResume,
  onDuplicateResume,
  onExportPdf,
  exportingResumeId = null,
  onOpenSettings,
  onTabChange,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterScore, setFilterScore] = useState<"all" | "high" | "needs-work">("all");

  const filtered = resumes.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.targetRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.selectedTemplate && r.selectedTemplate.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterScore === "high") return (r.atsScore || 0) >= 80;
    if (filterScore === "needs-work") return (r.atsScore || 0) < 80;
    return true;
  });

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] pb-28 pt-16 flex flex-col items-center">
      <TopAppBar
        title="AI Resume Studio"
        activeTab="history"
        onTabChange={onTabChange}
        onAvatarClick={onOpenSettings}
        onSettingsClick={onOpenSettings}
      />

      <main className="w-full max-w-4xl px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
        {/* Header & New Resume CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100 shadow-2xs">
                <span className="material-symbols-outlined text-[22px]">folder_open</span>
              </div>
              <h1 className="text-[24px] md:text-[28px] font-extrabold text-slate-900 tracking-tight">
                My Resumes
              </h1>
            </div>
            <p className="text-[14px] text-slate-600 mt-1">
              {resumes.length} {resumes.length === 1 ? "resume" : "resumes"} saved in your cloud workspace
            </p>
          </div>

          <button
            id="history-new-resume-btn"
            onClick={onNewResume}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-[13.5px] font-bold px-5 py-2.5 rounded-full flex items-center gap-1.5 shadow-md shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create Resume
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative bg-white rounded-2xl border border-slate-200/90 shadow-xs focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all overflow-hidden flex items-center px-4 py-3">
          <span className="material-symbols-outlined text-slate-400 text-[20px] mr-2">
            search
          </span>
          <input
            id="search-resumes-input"
            type="text"
            placeholder="Search by resume title, target role, or template..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none text-[14px] text-slate-900 outline-hidden placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-slate-400 hover:text-slate-800 p-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterScore("all")}
            className={`px-4 py-1.5 rounded-full text-[12px] font-mono font-semibold transition-all cursor-pointer border ${
              filterScore === "all"
                ? "bg-indigo-600 text-white border-indigo-600 shadow-xs font-bold"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            All ({resumes.length})
          </button>
          <button
            onClick={() => setFilterScore("high")}
            className={`px-4 py-1.5 rounded-full text-[12px] font-mono font-semibold transition-all cursor-pointer border ${
              filterScore === "high"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs font-bold"
                : "bg-white border-slate-200 text-emerald-700 hover:bg-emerald-50"
            }`}
          >
            High ATS ≥80%
          </button>
          <button
            onClick={() => setFilterScore("needs-work")}
            className={`px-4 py-1.5 rounded-full text-[12px] font-mono font-semibold transition-all cursor-pointer border ${
              filterScore === "needs-work"
                ? "bg-amber-600 text-white border-amber-600 shadow-xs font-bold"
                : "bg-white border-slate-200 text-amber-700 hover:bg-amber-50"
            }`}
          >
            Needs Work &lt;80%
          </button>
        </div>

        {/* Resumes Grid/List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 text-center flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-1">
                <span className="material-symbols-outlined text-[32px]">find_in_page</span>
              </div>
              <h3 className="text-[17px] font-bold text-slate-900">No resumes found</h3>
              <p className="text-[13.5px] text-slate-600 max-w-sm mt-0.5">
                Try adjusting your search filter or create a brand new ATS-optimized resume.
              </p>
              <button
                onClick={onNewResume}
                className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-bold px-6 py-2.5 rounded-full shadow-xs cursor-pointer active:scale-95"
              >
                Create New Resume
              </button>
            </div>
          ) : (
            filtered.map((resume) => {
              const score = resume.atsScore || 75;
              const isHigh = score >= 80;
              const isMedium = score >= 65 && score < 80;
              const templateName = resume.selectedTemplate || "Modern";

              return (
                <div
                  key={resume.id}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between gap-4 group"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3
                            onClick={() => onSelectResume(resume)}
                            className="text-[17px] font-bold text-slate-900 group-hover:text-indigo-600 cursor-pointer transition-colors line-clamp-1"
                          >
                            {resume.title}
                          </h3>
                        </div>

                        <p className="text-[13px] font-semibold text-indigo-600 font-mono mt-0.5">
                          {resume.targetRole || "General"}
                        </p>
                      </div>

                      {/* Template badge */}
                      <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex-shrink-0">
                        {templateName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11.5px] text-slate-500 font-mono pt-1">
                      <span>Last edited: {resume.lastEdited || "Recently"}</span>
                      <div className="flex items-center gap-1">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 border ${
                            isHigh
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : isMedium
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          <span>{score}%</span>
                          <span className="material-symbols-outlined text-[13px]">
                            {isHigh ? "check_circle" : "warning"}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Skills mini tags */}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {resume.skills.slice(0, 4).map((s) => (
                        <span
                          key={s}
                          className="bg-slate-50 text-slate-700 text-[11px] font-mono px-2 py-0.5 rounded-md border border-slate-200/80 font-medium"
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
                  </div>

                  {/* Comprehensive Action Row */}
                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      {/* Edit Button */}
                      <button
                        onClick={() => onSelectResume(resume)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-[12.5px] font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1 shadow-2xs active:scale-95 transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[15px]">edit</span>
                        Edit
                      </button>

                      {/* ATS Scan Button */}
                      {onScanResume && (
                        <button
                          onClick={() => onScanResume(resume)}
                          className="bg-purple-50 hover:bg-purple-100 text-purple-700 text-[12.5px] font-bold px-3 py-1.5 rounded-full border border-purple-200 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[15px]">target</span>
                          Scan
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {/* PDF Export Button */}
                      {onExportPdf && (
                        <button
                          title="Export PDF"
                          disabled={exportingResumeId === resume.id}
                          onClick={() => onExportPdf(resume)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors text-[11.5px] font-bold border border-slate-200 hover:border-indigo-300 active:scale-95 cursor-pointer"
                        >
                          {exportingResumeId === resume.id ? (
                            <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <span className="material-symbols-outlined text-[15px] text-indigo-600">
                              picture_as_pdf
                            </span>
                          )}
                          <span>PDF</span>
                        </button>
                      )}

                      {/* Duplicate Button */}
                      <button
                        title="Duplicate"
                        onClick={() => onDuplicateResume(resume)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          content_copy
                        </span>
                      </button>

                      {/* Delete Button */}
                      <button
                        title="Delete"
                        onClick={() => onDeleteResume(resume.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
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
