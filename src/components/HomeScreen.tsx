import React from "react";
import { Resume, UserProfile } from "../types";
import { TopAppBar } from "./TopAppBar";

interface HomeScreenProps {
  user: UserProfile;
  resumes: Resume[];
  onSelectResume: (resume: Resume) => void;
  onNewAnalysis: () => void;
  onViewAllHistory: () => void;
  onOpenSettings: () => void;
  onOpenScanner: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  user,
  resumes,
  onSelectResume,
  onNewAnalysis,
  onViewAllHistory,
  onOpenSettings,
  onOpenScanner,
}) => {
  // Calculate average ATS score
  const avgAtsScore = resumes.length
    ? Math.round(
        resumes.reduce((acc, r) => acc + (r.atsScore || 75), 0) / resumes.length
      )
    : 78;

  const totalCreated = resumes.length || 12;

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] pb-28 pt-16 flex flex-col items-center">
      <TopAppBar
        title="AI Resume Studio"
        avatarUrl={user.avatarUrl}
        onAvatarClick={onOpenSettings}
        onSettingsClick={onOpenSettings}
      />

      <main className="w-full max-w-xl md:max-w-2xl px-4 py-5 flex flex-col gap-6">
        {/* Primary CTA: New AI Analysis */}
        <section>
          <div
            id="home-cta-analysis-card"
            className="w-full bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-900 text-white rounded-3xl p-6 md:p-7 flex flex-col items-start relative overflow-hidden shadow-xl shadow-indigo-600/15 active:scale-[0.99] transition-all duration-200 group border border-indigo-400/20"
          >
            {/* Decorative background ambient glows */}
            <div className="absolute -right-8 -top-8 w-44 h-44 bg-purple-400/20 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700 pointer-events-none" />
            <div className="absolute right-4 bottom-2 text-white/10 pointer-events-none">
              <span
                className="material-symbols-outlined text-[88px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                auto_awesome
              </span>
            </div>

            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 text-emerald-300 border border-white/20 shadow-inner">
              <span
                className="material-symbols-outlined text-[24px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                magic_button
              </span>
            </div>

            <h2 className="text-[22px] md:text-[24px] font-bold tracking-tight mb-1 text-white">
              New AI Analysis
            </h2>
            <p className="text-[14px] text-indigo-100 max-w-[85%] leading-relaxed mb-5 font-normal">
              Upload a draft and let AI optimize your content for ATS compatibility.
            </p>

            <div className="flex flex-wrap gap-2.5 z-10">
              <button
                id="cta-start-builder-btn"
                onClick={onNewAnalysis}
                className="bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-[13px] px-5 py-2.5 rounded-full flex items-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px] text-indigo-600">add</span>
                Build from Scratch
              </button>

              <button
                id="cta-scan-draft-btn"
                onClick={onOpenScanner}
                className="bg-white/15 hover:bg-white/25 text-white border border-white/30 font-medium text-[13px] px-4 py-2.5 rounded-full flex items-center gap-1.5 backdrop-blur-sm transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">document_scanner</span>
                Scan / Paste Draft
              </button>
            </div>
          </div>
        </section>

        {/* Quick Stats (Bento Grid) */}
        <section className="grid grid-cols-2 gap-4">
          {/* Stat Card 1: Avg ATS Score */}
          <div
            id="stat-ats-score-card"
            className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex flex-col items-center justify-center text-center hover:shadow-md hover:border-emerald-200 transition-all duration-200"
          >
            <div className="relative w-16 h-16 mb-2 flex items-center justify-center">
              {/* Circular Gauge */}
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
              <span className="text-[20px] font-extrabold text-slate-800">
                {avgAtsScore}
              </span>
            </div>
            <h3 className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
              Avg ATS Score
            </h3>
          </div>

          {/* Stat Card 2: Resumes Created */}
          <div
            id="stat-created-card"
            className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex flex-col items-center justify-center text-center hover:shadow-md hover:border-indigo-200 transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center mb-1 text-indigo-600">
              <span
                className="material-symbols-outlined text-[24px]"
                style={{ fontVariationSettings: "'FILL' 0" }}
              >
                description
              </span>
            </div>
            <span className="text-[24px] font-extrabold text-slate-900">
              {totalCreated}
            </span>
            <h3 className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
              Created
            </h3>
          </div>
        </section>

        {/* Recent Resumes Section */}
        <section className="flex flex-col gap-3 mt-1">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-[20px] font-bold text-slate-900 tracking-tight">
              Recent Resumes
            </h2>
            <button
              id="home-view-all-resumes-btn"
              onClick={onViewAllHistory}
              className="text-[13px] font-bold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors flex items-center gap-0.5"
            >
              View All
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>

          {/* Resume Cards List */}
          <div className="flex flex-col gap-2.5">
            {resumes.slice(0, 4).map((resume) => {
              const score = resume.atsScore || 80;
              const isHigh = score >= 80;
              const isMedium = score >= 65 && score < 80;

              return (
                <button
                  key={resume.id}
                  id={`resume-item-${resume.id}`}
                  onClick={() => onSelectResume(resume)}
                  className="bg-white rounded-2xl p-4 border border-slate-200/80 flex justify-between items-center shadow-xs hover:shadow-md hover:border-indigo-300 active:bg-slate-50 transition-all text-left group"
                >
                  <div className="flex flex-col gap-1 pr-3">
                    <span className="text-[16px] font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {resume.title}
                    </span>
                    <div className="flex items-center gap-2 text-[12px] text-slate-500 font-mono">
                      <span>Last edited: {resume.lastEdited}</span>
                      <span>•</span>
                      <span className="text-slate-600 truncate max-w-[140px]">
                        {resume.targetRole}
                      </span>
                    </div>
                  </div>

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
                </button>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};
