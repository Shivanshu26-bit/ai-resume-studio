import React, { useState } from "react";
import { Resume, BottomNavTab } from "../types";
import { TopAppBar } from "./TopAppBar";
import { ResumeMiniPreview } from "./ResumeMiniPreview";
import {
  FolderOpen,
  Plus,
  Search,
  X,
  FileText,
  Target,
  Download,
  Copy,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  UploadCloud,
} from "lucide-react";

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

      <main className="w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6">
        {/* Header & New Resume CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100 shadow-2xs">
                <FolderOpen className="w-5 h-5" />
              </div>
              <h1 className="text-[26px] sm:text-[30px] font-extrabold text-slate-900 tracking-tight">
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
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-[13.5px] font-bold px-6 py-3 rounded-full flex items-center gap-2 shadow-md shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Create Resume
          </button>
        </div>

        {/* Search Bar & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 bg-white rounded-2xl border border-slate-200/90 shadow-xs focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all overflow-hidden flex items-center px-4 py-2.5">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              id="search-resumes-input"
              type="text"
              placeholder="Search by resume title, target role, or template..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none text-[13.5px] text-slate-900 outline-hidden placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-slate-400 hover:text-slate-800 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilterScore("all")}
              className={`px-4 py-2 rounded-full text-[12px] font-mono font-semibold transition-all cursor-pointer border shrink-0 ${
                filterScore === "all"
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs font-bold"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              All ({resumes.length})
            </button>
            <button
              onClick={() => setFilterScore("high")}
              className={`px-4 py-2 rounded-full text-[12px] font-mono font-semibold transition-all cursor-pointer border shrink-0 ${
                filterScore === "high"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs font-bold"
                  : "bg-white border-slate-200 text-emerald-700 hover:bg-emerald-50"
              }`}
            >
              High ATS ≥80%
            </button>
            <button
              onClick={() => setFilterScore("needs-work")}
              className={`px-4 py-2 rounded-full text-[12px] font-mono font-semibold transition-all cursor-pointer border shrink-0 ${
                filterScore === "needs-work"
                  ? "bg-amber-600 text-white border-amber-600 shadow-xs font-bold"
                  : "bg-white border-slate-200 text-amber-700 hover:bg-amber-50"
              }`}
            >
              Needs Work &lt;80%
            </button>
          </div>
        </div>

        {/* Resumes Grid/List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {filtered.length === 0 ? (
            <div className="col-span-full bg-white rounded-3xl p-10 sm:p-14 border border-slate-200/90 text-center flex flex-col items-center gap-3.5 shadow-xs">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-2xs">
                <FileText className="w-8 h-8" />
              </div>
              <div className="max-w-md">
                <h3 className="text-[19px] font-extrabold text-slate-900">
                  {resumes.length === 0 ? "No resume yet" : "No matching resumes found"}
                </h3>
                <p className="text-[14px] text-slate-600 mt-1.5 leading-relaxed">
                  {resumes.length === 0
                    ? "Start from scratch or upload an existing resume and let AI fill it for you."
                    : "Try adjusting your search keywords or clear the filter to view all resumes."}
                </p>
              </div>

              <button
                onClick={onNewResume}
                className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[13.5px] font-bold px-6 py-3 rounded-full shadow-md shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Resume
              </button>
            </div>
          ) : (
            filtered.map((resume) => {
              const score = resume.atsScore || 78;
              const isHigh = score >= 80;
              const isMedium = score >= 65 && score < 80;
              const templateName = resume.selectedTemplate || "Modern";

              return (
                <div
                  key={resume.id}
                  id={`my-resume-${resume.id}`}
                  className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between gap-4 group"
                >
                  {/* Top Row: Mini Preview on Left + Details on Right */}
                  <div className="flex items-start gap-4">
                    {/* Left: A4 Thumbnail Preview */}
                    <ResumeMiniPreview
                      resume={resume}
                      className="group-hover:border-indigo-300 transition-colors"
                    />

                    {/* Right: Meta & Scores */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3
                            onClick={() => onSelectResume(resume)}
                            className="text-[16px] font-bold text-slate-900 group-hover:text-indigo-600 transition-colors cursor-pointer line-clamp-1"
                          >
                            {resume.title}
                          </h3>
                          <span className="text-[10.5px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                            {templateName}
                          </span>
                        </div>

                        <div className="text-[12.5px] font-semibold text-indigo-600 font-mono mt-0.5 truncate">
                          {resume.targetRole || "General"}
                        </div>
                      </div>

                      {/* Mini Skills Chips */}
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {resume.skills.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="bg-slate-50 text-slate-700 text-[10.5px] font-mono px-2 py-0.5 rounded-md border border-slate-200/80 font-medium"
                          >
                            {s}
                          </span>
                        ))}
                        {resume.skills.length > 3 && (
                          <span className="text-[10.5px] text-slate-400 font-mono self-center">
                            +{resume.skills.length - 3}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5 mt-3 pt-2 border-t border-slate-100 text-[11.5px] text-slate-500 font-mono">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {resume.lastEdited || "Recently"}
                          </span>

                          <span
                            className={`px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border ${
                              isHigh
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : isMedium
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            {score}% ATS
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Row */}
                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectResume(resume)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-[12.5px] font-bold px-4 py-1.5 rounded-full flex items-center gap-1 shadow-2xs active:scale-95 transition-all cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Edit
                      </button>

                      {onScanResume && (
                        <button
                          onClick={() => onScanResume(resume)}
                          className="bg-purple-50 hover:bg-purple-100 text-purple-700 text-[12.5px] font-bold px-3.5 py-1.5 rounded-full border border-purple-200 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Target className="w-3.5 h-3.5" />
                          ATS Scan
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {onExportPdf && (
                        <button
                          title="Export PDF"
                          disabled={exportingResumeId === resume.id}
                          onClick={() => onExportPdf(resume)}
                          className="flex items-center gap-1 px-3 py-1.5 text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors text-[12px] font-bold border border-slate-200 hover:border-indigo-300 active:scale-95 cursor-pointer"
                        >
                          {exportingResumeId === resume.id ? (
                            <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Download className="w-3.5 h-3.5 text-indigo-600" />
                          )}
                          <span>PDF</span>
                        </button>
                      )}

                      <button
                        title="Duplicate Resume"
                        onClick={() => onDuplicateResume(resume)}
                        className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors cursor-pointer"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        title="Delete Resume"
                        onClick={() => onDeleteResume(resume.id)}
                        className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
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
