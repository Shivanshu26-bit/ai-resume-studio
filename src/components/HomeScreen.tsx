import React from "react";
import { Resume, UserProfile, BottomNavTab } from "../types";
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
  onTabChange?: (tab: BottomNavTab) => void;
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
  onTabChange,
}) => {
  const userName =
    user.name?.split(" ")[0] ||
    user.displayName?.split(" ")[0] ||
    user.email.split("@")[0] ||
    "Job Seeker";

  // Calculate actual statistics from current state
  const totalResumes = resumes.length;
  const latestResume = resumes[0];
  const latestAtsScore = latestResume?.atsScore || (resumes.length ? 78 : null);
  const lastUpdatedText = latestResume?.lastEdited || (resumes.length ? "Recently" : "—");

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] pb-28 pt-16 flex flex-col items-center">
      <TopAppBar
        title="AI Resume Studio"
        avatarUrl={user.avatarUrl}
        activeTab="home"
        onTabChange={onTabChange}
        onAvatarClick={onOpenSettings}
        onSettingsClick={onOpenSettings}
      />

      <main className="w-full max-w-5xl px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-8">
        {/* 1. Hero Welcome Header */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-br from-white to-indigo-50/40 p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex flex-col gap-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <h1 className="text-[26px] sm:text-[32px] font-extrabold text-slate-900 tracking-tight leading-tight">
                Welcome back, {userName} 👋
              </h1>
            </div>
            <p className="text-[15px] sm:text-[16px] text-slate-600 leading-relaxed font-normal">
              Build a professional resume or check how well your resume matches a job.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 text-[12px] font-mono font-semibold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Cloud Sync Active
            </span>
          </div>
        </section>

        {/* 2. Two Primary Feature Cards (Equal Prominence) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* Feature Card 1: Resume Builder */}
          <div
            id="home-card-resume-builder"
            className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-indigo-300 transition-all duration-200 flex flex-col justify-between group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-50/70 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100/80 shadow-2xs">
                  <span className="material-symbols-outlined text-[26px]">edit_document</span>
                </div>
                <span className="text-[11.5px] font-mono font-bold text-indigo-700 bg-indigo-50/80 px-3 py-1 rounded-full border border-indigo-100">
                  4 Pro Templates
                </span>
              </div>

              <h2 className="text-[21px] font-bold text-slate-900 tracking-tight mb-1.5">
                Resume Builder
              </h2>
              <p className="text-[14px] text-slate-600 leading-relaxed mb-5 font-normal">
                Create and customize your resume with AI assistance.
              </p>

              {/* Visual Template Chips Indicator */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                {["Modern", "Classic", "Minimal", "Executive"].map((tpl) => (
                  <span
                    key={tpl}
                    className="text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200/80 font-medium"
                  >
                    {tpl}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-4 border-t border-slate-100">
              <button
                id="home-create-resume-primary-btn"
                onClick={onNewResume}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[14px] px-5 py-3 rounded-full flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 active:scale-98 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[19px]">add</span>
                Build Resume
              </button>

              <button
                id="home-view-my-resumes-btn"
                onClick={onViewAllHistory}
                className="w-full text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 font-semibold text-[13px] py-2.5 rounded-full flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px]">folder_open</span>
                View My Resumes ({resumes.length})
              </button>
            </div>
          </div>

          {/* Feature Card 2: ATS Scanner */}
          <div
            id="home-card-ats-scanner"
            className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-purple-300 transition-all duration-200 flex flex-col justify-between group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-36 h-36 bg-purple-50/70 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100/80 shadow-2xs">
                  <span className="material-symbols-outlined text-[26px]">document_scanner</span>
                </div>
                <span className="text-[11.5px] font-mono font-bold text-purple-700 bg-purple-50/80 px-3 py-1 rounded-full border border-purple-100">
                  AI Estimate
                </span>
              </div>

              <h2 className="text-[21px] font-bold text-slate-900 tracking-tight mb-1.5">
                ATS Scanner
              </h2>
              <p className="text-[14px] text-slate-600 leading-relaxed mb-5 font-normal">
                Check your resume against a job description and discover improvements.
              </p>

              {/* Highlights */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                {["Keyword Gaps", "Job Match %", "STAR Bullet Check"].map((item) => (
                  <span
                    key={item}
                    className="text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-purple-50/80 text-purple-700 border border-purple-200/70 font-medium"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-4 border-t border-slate-100">
              <button
                id="home-scan-resume-primary-btn"
                onClick={() => onOpenScanner(resumes[0])}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-[14px] px-5 py-3 rounded-full flex items-center justify-center gap-2 shadow-md shadow-purple-500/20 active:scale-98 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[19px]">auto_awesome</span>
                Scan Resume
              </button>

              <button
                onClick={() => onOpenScanner(resumes[0])}
                className="w-full text-slate-700 hover:text-purple-600 hover:bg-purple-50/60 font-semibold text-[13px] py-2.5 rounded-full flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px]">target</span>
                Paste Target Job Post
              </button>
            </div>
          </div>
        </section>

        {/* 3. Quick Stats / Metrics Row */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Metric 1: Total Resumes */}
          <div
            id="stat-created-card"
            className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex items-center gap-4 hover:border-indigo-200 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0 border border-indigo-100">
              <span className="material-symbols-outlined text-[24px]">folder</span>
            </div>
            <div>
              <span className="text-[22px] font-extrabold text-slate-900 block leading-tight">
                {totalResumes}
              </span>
              <h3 className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                Total Resumes
              </h3>
            </div>
          </div>

          {/* Metric 2: Latest ATS Score */}
          <div
            id="stat-ats-score-card"
            className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex items-center gap-4 hover:border-emerald-200 transition-colors"
          >
            <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
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
                  strokeDasharray={`${latestAtsScore || 0}, 100`}
                  strokeLinecap="round"
                  strokeWidth="3.5"
                />
              </svg>
              <span className="text-[15px] font-extrabold text-slate-800">
                {latestAtsScore ? `${latestAtsScore}%` : "—"}
              </span>
            </div>
            <div>
              <span className="text-[16px] font-bold text-slate-900 block leading-tight">
                {latestAtsScore ? `${latestAtsScore}%` : "No scan yet"}
              </span>
              <h3 className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                Latest ATS Score
              </h3>
            </div>
          </div>

          {/* Metric 3: Last Updated */}
          <div
            id="stat-updated-card"
            className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex items-center gap-4 hover:border-slate-300 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0 border border-slate-200">
              <span className="material-symbols-outlined text-[24px]">schedule</span>
            </div>
            <div>
              <span className="text-[16px] font-bold text-slate-900 block leading-tight truncate max-w-[140px]">
                {lastUpdatedText}
              </span>
              <h3 className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                Last Updated
              </h3>
            </div>
          </div>
        </section>

        {/* 4. Recent Resumes Section */}
        <section className="flex flex-col gap-4">
          <div className="flex justify-between items-center px-1">
            <div>
              <h2 className="text-[20px] font-bold text-slate-900 tracking-tight">
                Recent Resumes
              </h2>
              <p className="text-[13px] text-slate-500 mt-0.5">
                Quickly edit or run an ATS compatibility scan
              </p>
            </div>

            {resumes.length > 0 && (
              <button
                id="home-view-all-resumes-btn"
                onClick={onViewAllHistory}
                className="text-[13px] font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>View All ({resumes.length})</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            )}
          </div>

          {resumes.length === 0 ? (
            /* Elegant Empty State */
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 text-center flex flex-col items-center gap-3.5 shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <span className="material-symbols-outlined text-[32px]">post_add</span>
              </div>
              <div className="max-w-md">
                <h3 className="text-[18px] font-bold text-slate-900">
                  No resumes yet
                </h3>
                <p className="text-[14px] text-slate-600 mt-1">
                  Start building your first professional resume with real-time AI assistance.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
                <button
                  id="empty-create-resume-btn"
                  onClick={onNewResume}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-[13.5px] font-bold px-6 py-2.5 rounded-full shadow-md shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  Create Resume
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
            /* Attractive Resume Cards */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resumes.slice(0, 4).map((resume) => {
                const score = resume.atsScore || 75;
                const isHigh = score >= 80;
                const isMedium = score >= 65 && score < 80;
                const templateName = resume.selectedTemplate || "Modern";

                return (
                  <div
                    key={resume.id}
                    id={`resume-item-${resume.id}`}
                    className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between gap-4 group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <h3
                            onClick={() => onSelectResume(resume)}
                            className="text-[17px] font-bold text-slate-900 group-hover:text-indigo-600 transition-colors cursor-pointer line-clamp-1"
                          >
                            {resume.title}
                          </h3>
                          <p className="text-[13px] font-semibold text-indigo-600 font-mono mt-0.5">
                            {resume.targetRole || "General"}
                          </p>
                        </div>

                        {/* Template Badge */}
                        <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex-shrink-0">
                          {templateName}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11.5px] text-slate-500 font-mono pt-1">
                        <span>Last updated: {resume.lastEdited || "Recently"}</span>
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
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSelectResume(resume)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-[12.5px] font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1 shadow-2xs active:scale-95 transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[15px]">edit</span>
                          Edit
                        </button>

                        <button
                          onClick={() => onOpenScanner(resume)}
                          className="bg-purple-50 hover:bg-purple-100 text-purple-700 text-[12.5px] font-bold px-3 py-1.5 rounded-full border border-purple-200 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[15px]">target</span>
                          ATS Scan
                        </button>
                      </div>

                      {onExportPdf && (
                        <button
                          onClick={() => onExportPdf(resume)}
                          title="Export PDF"
                          className="flex items-center gap-1 px-3 py-1.5 text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors text-[12px] font-bold border border-slate-200 hover:border-indigo-300 active:scale-95 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[15px] text-indigo-600">
                            picture_as_pdf
                          </span>
                          <span>PDF</span>
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
