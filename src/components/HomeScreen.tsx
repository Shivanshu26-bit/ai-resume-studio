import React from "react";
import { Resume, UserProfile } from "../types";
import { TopAppBar } from "./TopAppBar";

interface HomeScreenProps {
  user: UserProfile;
  resumes: Resume[];
  onSelectResume: (resume: Resume) => void;
  onNewResume: () => void;
  onOpenScanner: (resume?: Resume) => void;
  onViewAllHistory: () => void;
  onOpenSettings: () => void;
  onExportPdf?: (resume: Resume) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  user,
  resumes,
  onSelectResume,
  onNewResume,
  onOpenScanner,
  onViewAllHistory,
  onOpenSettings,
  onExportPdf,
}) => {
  const userName =
    user.name?.split(" ")[0] ||
    user.displayName?.split(" ")[0] ||
    user.email.split("@")[0] ||
    "Job Seeker";

  // Calculate average ATS score
  const avgAtsScore = resumes.length
    ? Math.round(
        resumes.reduce((acc, r) => acc + (r.atsScore || 75), 0) / resumes.length
      )
    : 78;

  const totalCreated = resumes.length;

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] pb-28 pt-16 flex flex-col items-center">
      <TopAppBar
        title="AI Resume Studio"
        avatarUrl={user.avatarUrl}
        onAvatarClick={onOpenSettings}
        onSettingsClick={onOpenSettings}
      />

      <main className="w-full max-w-2xl md:max-w-3xl px-4 py-5 flex flex-col gap-6">
        {/* Welcome Header */}
        <section className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h1 className="text-[24px] md:text-[28px] font-extrabold text-slate-900 tracking-tight">
              Welcome back, {userName}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[12px] font-mono font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Cloud Sync Active
            </span>
          </div>
          <p className="text-[14.5px] text-slate-600 leading-relaxed font-normal">
            Build a professional resume or check how well your resume matches a job.
          </p>
        </section>

        {/* Two Prominent Action Cards (Equal Hierarchy) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Action Card 1: Resume Builder */}
          <div
            id="home-card-resume-builder"
            className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-indigo-300 transition-all duration-200 flex flex-col justify-between group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/60 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />

            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 border border-indigo-100/80 shadow-xs">
                <span className="material-symbols-outlined text-[26px]">edit_document</span>
              </div>

              <div className="flex items-center justify-between mb-1">
                <h2 className="text-[20px] font-bold text-slate-900 tracking-tight">
                  Resume Builder
                </h2>
                <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                  4 Templates
                </span>
              </div>

              <p className="text-[13.5px] text-slate-600 leading-relaxed mb-5 font-normal">
                Create and customize a professional resume with AI-powered assistance.
              </p>

              {/* Template chips preview */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                {["Modern", "Classic", "Minimal", "Executive"].map((tpl) => (
                  <span
                    key={tpl}
                    className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-medium"
                  >
                    {tpl}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-100">
              <button
                id="home-create-resume-primary-btn"
                onClick={onNewResume}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[13.5px] px-5 py-2.5 rounded-full flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Create Resume
              </button>

              <button
                id="home-view-my-resumes-btn"
                onClick={onViewAllHistory}
                className="w-full text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 font-semibold text-[13px] py-2 rounded-full flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px]">folder_open</span>
                View My Resumes ({resumes.length})
              </button>
            </div>
          </div>

          {/* Action Card 2: ATS Scanner */}
          <div
            id="home-card-ats-scanner"
            className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-purple-300 transition-all duration-200 flex flex-col justify-between group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50/60 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />

            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 border border-purple-100/80 shadow-xs">
                <span className="material-symbols-outlined text-[26px]">document_scanner</span>
              </div>

              <div className="flex items-center justify-between mb-1">
                <h2 className="text-[20px] font-bold text-slate-900 tracking-tight">
                  ATS Scanner
                </h2>
                <span className="text-[11px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                  AI Estimate
                </span>
              </div>

              <p className="text-[13.5px] text-slate-600 leading-relaxed mb-5 font-normal">
                Check your resume against a job description and discover ATS improvements.
              </p>

              {/* Scanner highlights */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                {["Keyword Gaps", "Job Match %", "STAR Bullet Check"].map((item) => (
                  <span
                    key={item}
                    className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200/60 font-medium"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-100">
              <button
                id="home-scan-resume-primary-btn"
                onClick={() => onOpenScanner(resumes[0])}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-[13.5px] px-5 py-2.5 rounded-full flex items-center justify-center gap-2 shadow-md shadow-purple-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                Scan Resume
              </button>

              <button
                onClick={() => onOpenScanner(resumes[0])}
                className="w-full text-slate-700 hover:text-purple-600 hover:bg-purple-50/60 font-semibold text-[13px] py-2 rounded-full flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px]">target</span>
                Paste Target Job Post
              </button>
            </div>
          </div>
        </section>

        {/* Quick Metrics Bento Row */}
        <section className="grid grid-cols-2 gap-4">
          {/* Stat Card 1: Avg ATS Score */}
          <div
            id="stat-ats-score-card"
            className="bg-white rounded-2xl p-4 md:p-5 shadow-xs border border-slate-200/80 flex items-center gap-4 hover:shadow-md hover:border-emerald-200 transition-all duration-200"
          >
            <div className="relative w-14 h-14 flex-shrink-0 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100 stroke-current"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  strokeWidth="3.5"
                />
                <path
                  className="text-emerald-500 stroke-current"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  strokeDasharray={`${avgAtsScore}, 100`}
                  strokeLinecap="round"
                  strokeWidth="3.5"
                />
              </svg>
              <span className="text-[18px] font-extrabold text-slate-800">
                {avgAtsScore}%
              </span>
            </div>
            <div>
              <h3 className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                Avg ATS Score
              </h3>
              <p className="text-[11px] text-slate-600 font-mono">AI Estimate</p>
            </div>
          </div>

          {/* Stat Card 2: Resumes in Cloud */}
          <div
            id="stat-created-card"
            className="bg-white rounded-2xl p-4 md:p-5 shadow-xs border border-slate-200/80 flex items-center gap-4 hover:shadow-md hover:border-indigo-200 transition-all duration-200"
          >
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0 border border-indigo-100">
              <span className="material-symbols-outlined text-[26px]">folder</span>
            </div>
            <div>
              <span className="text-[20px] font-extrabold text-slate-900 block leading-tight">
                {totalCreated} {totalCreated === 1 ? "Resume" : "Resumes"}
              </span>
              <h3 className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                In Cloud Storage
              </h3>
            </div>
          </div>
        </section>

        {/* Recent Resumes or Empty State */}
        <section className="flex flex-col gap-3">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-[19px] font-bold text-slate-900 tracking-tight">
              Recent Resumes
            </h2>
            {resumes.length > 0 && (
              <button
                id="home-view-all-resumes-btn"
                onClick={onViewAllHistory}
                className="text-[13px] font-bold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors flex items-center gap-0.5"
              >
                View All
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            )}
          </div>

          {resumes.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-3xl p-8 border border-slate-200/90 text-center flex flex-col items-center gap-3 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[32px]">post_add</span>
              </div>
              <div>
                <h3 className="text-[18px] font-bold text-slate-900">
                  Create your first resume
                </h3>
                <p className="text-[13.5px] text-slate-600 max-w-sm mt-1">
                  Start building your professional resume with real-time AI assistance, or scan an existing draft to check ATS scores.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 mt-2">
                <button
                  onClick={onNewResume}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-[13.5px] font-bold px-6 py-2.5 rounded-full shadow-md shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  Start Building
                </button>
                <button
                  onClick={() => onOpenScanner()}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-[13.5px] font-bold px-5 py-2.5 rounded-full transition-all cursor-pointer"
                >
                  Scan an Existing Resume
                </button>
              </div>
            </div>
          ) : (
            /* Resume Cards List */
            <div className="flex flex-col gap-2.5">
              {resumes.slice(0, 4).map((resume) => {
                const score = resume.atsScore || 75;
                const isHigh = score >= 80;
                const isMedium = score >= 65 && score < 80;

                return (
                  <div
                    key={resume.id}
                    id={`resume-item-${resume.id}`}
                    className="bg-white rounded-2xl p-4 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all group"
                  >
                    <div
                      onClick={() => onSelectResume(resume)}
                      className="flex flex-col gap-1 cursor-pointer flex-1"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[16px] font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                          {resume.title}
                        </span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                          {resume.selectedTemplate || "Modern"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[12px] text-slate-500 font-mono">
                        <span>Last edited: {resume.lastEdited}</span>
                        <span>•</span>
                        <span className="text-slate-600 truncate max-w-[160px]">
                          {resume.targetRole}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                      <div
                        className={`rounded-full px-3 py-1 flex items-center gap-1.5 flex-shrink-0 text-[12px] font-bold font-mono border ${
                          isHigh
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : isMedium
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        <span>{score}%</span>
                        <span className="material-symbols-outlined text-[16px]">
                          {isHigh ? "check_circle" : "warning"}
                        </span>
                      </div>

                      <button
                        onClick={() => onSelectResume(resume)}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[12px] font-bold px-3 py-1.5 rounded-full transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[15px]">edit</span>
                        Edit
                      </button>

                      <button
                        onClick={() => onOpenScanner(resume)}
                        className="bg-purple-50 hover:bg-purple-100 text-purple-700 text-[12px] font-bold px-3 py-1.5 rounded-full transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[15px]">target</span>
                        Scan
                      </button>

                      {onExportPdf && (
                        <button
                          onClick={() => onExportPdf(resume)}
                          title="Export PDF"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            picture_as_pdf
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
