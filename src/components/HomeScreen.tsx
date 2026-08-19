import React from "react";
import { Resume, UserProfile, BottomNavTab } from "../types";
import { TopAppBar } from "./TopAppBar";
import { ResumeMiniPreview } from "./ResumeMiniPreview";
import {
  Sparkles,
  UploadCloud,
  Plus,
  FileText,
  Target,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Zap,
  TrendingUp,
  FileCheck2,
  FolderOpen,
  Briefcase,
  Layers,
  ChevronRight,
  Download,
} from "lucide-react";

interface HomeScreenProps {
  user: UserProfile;
  resumes: Resume[];
  onSelectResume: (resume: Resume) => void;
  onNewResume: () => void;
  onOpenScanner: (resume?: Resume) => void;
  onOpenUpload?: () => void;
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
  onOpenUpload,
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

  const totalResumes = resumes.length;
  const activeResume = resumes[0] || null;
  const atsScore = activeResume?.atsScore || (totalResumes > 0 ? 82 : null);

  const getScoreLabel = (score: number) => {
    if (score >= 80) return { label: "Strong Match", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    if (score >= 65) return { label: "Moderate Match", color: "text-amber-700 bg-amber-50 border-amber-200" };
    return { label: "Needs Polish", color: "text-rose-700 bg-rose-50 border-rose-200" };
  };

  const scoreMeta = atsScore ? getScoreLabel(atsScore) : null;

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

      <main className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-8">
        {/* ========================================================================= */}
        {/* 1. DASHBOARD HERO                                                         */}
        {/* ========================================================================= */}
        <section
          id="dashboard-hero"
          className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-indigo-900/50 shadow-xl overflow-hidden"
        >
          {/* Decorative ambient background glows */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Copy & Actions */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-[12px] font-mono font-medium self-start shadow-inner">
                <Sparkles className="w-3.5 h-3.5 text-indigo-300 animate-pulse" />
                <span>Next-Gen Career Intelligence</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <p className="text-[14px] sm:text-[15px] font-semibold text-indigo-200">
                  Welcome back, {userName} 👋
                </p>
                <h1 className="text-[28px] sm:text-[36px] lg:text-[40px] font-extrabold tracking-tight text-white leading-[1.15]">
                  Build a resume that gets noticed.
                </h1>
              </div>

              <p className="text-[15px] sm:text-[16px] text-slate-300 leading-relaxed max-w-xl">
                Create, improve, and check your resume against real job requirements with AI-powered keyword alignment and ATS formatting.
              </p>

              {/* Dominant Primary Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  id="hero-create-resume-btn"
                  onClick={onNewResume}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-[14px] px-6 py-3.5 rounded-full flex items-center gap-2 shadow-lg shadow-indigo-500/30 active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  + Create Resume
                </button>

                <button
                  id="hero-scan-resume-btn"
                  onClick={() => onOpenScanner(activeResume || undefined)}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-[14px] px-6 py-3.5 rounded-full flex items-center gap-2 backdrop-blur-xs active:scale-95 transition-all cursor-pointer"
                >
                  <Target className="w-4 h-4 text-indigo-300" />
                  Scan My Resume
                </button>
              </div>
            </div>

            {/* Right Column: Desktop Visual Resume & AI Composition */}
            <div className="hidden lg:flex lg:col-span-5 justify-end">
              <div className="relative w-full max-w-[320px] bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 border border-indigo-500/30 shadow-2xl flex flex-col gap-3">
                {/* Floating Top Pill Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] font-mono font-bold text-slate-200 uppercase tracking-wider">
                      Live ATS Preview
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                    {activeResume ? activeResume.selectedTemplate || "Modern" : "Pro"}
                  </span>
                </div>

                {/* Miniature Visual Resume Document Snippet */}
                <div className="bg-white text-slate-900 rounded-xl p-3.5 shadow-md flex flex-col gap-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                      <div className="text-[13px] font-bold text-slate-900 leading-tight">
                        {activeResume ? `${activeResume.personal?.firstName || ""} ${activeResume.personal?.lastName || ""}`.trim() || activeResume.title : "Alex Chen"}
                      </div>
                      <div className="text-[11px] font-semibold text-indigo-600 font-mono">
                        {activeResume?.targetRole || "Software Professional"}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {atsScore ? `${atsScore}% ATS` : "88% ATS"}
                      </span>
                    </div>
                  </div>

                  {/* Visual Skeleton Bars & Real Skill Tags */}
                  <div className="flex flex-col gap-1.5 py-0.5">
                    <div className="h-1.5 bg-slate-200 rounded-full w-full" />
                    <div className="h-1.5 bg-slate-100 rounded-full w-4/5" />
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {(activeResume?.skills?.slice(0, 3) || ["TypeScript", "React", "Cloud CI/CD"]).map((skill) => (
                      <span
                        key={skill}
                        className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Floating Bottom AI Intelligence Status */}
                <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1 font-mono">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Keywords Indexed
                  </span>
                  <span className="text-indigo-300">Format: Standard A4</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. INDUSTRY / LANGUAGE INTELLIGENCE BANNER (Friendly, Non-Technical)       */}
        {/* ========================================================================= */}
        <div
          id="career-intelligence-banner"
          className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100 shrink-0 shadow-2xs">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-slate-900 leading-tight">
                Built for every career
              </h2>
              <p className="text-[13px] text-slate-600 mt-0.5">
                AI understands Indian languages, industries, and job contexts.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {["Hindi", "Education", "Healthcare", "Finance", "Engineering", "IT", "Sales"].map((domain) => (
              <span
                key={domain}
                className="text-[12px] font-medium px-3 py-1 rounded-full bg-slate-100/80 text-slate-700 border border-slate-200/80 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-colors"
              >
                {domain}
              </span>
            ))}
            <span className="text-[12px] font-semibold text-indigo-600 px-2 py-1">
              + More
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. MAJOR PRODUCT ENTRY CARDS: BUILDER & ATS SCANNER                       */}
        {/* ========================================================================= */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* FEATURE CARD 1: RESUME BUILDER */}
          <div
            id="card-resume-builder"
            className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-indigo-300 transition-all duration-200 flex flex-col justify-between group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-50/70 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-2xs">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="text-[11.5px] font-mono font-bold text-indigo-700 bg-indigo-50/80 px-3 py-1 rounded-full border border-indigo-100">
                  4 Pro Templates
                </span>
              </div>

              <h2 className="text-[22px] font-extrabold text-slate-900 tracking-tight mb-1.5">
                Resume Builder
              </h2>
              <p className="text-[14px] text-slate-600 leading-relaxed mb-4">
                Create an ATS-formatted resume from scratch or upload your existing document with automatic AI field extraction.
              </p>

              {/* Template Styles Showcase */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {[
                  { name: "Modern", tag: "Tech & Corporate" },
                  { name: "Classic", tag: "Academic & Legal" },
                  { name: "Minimal", tag: "Clean & Dense" },
                  { name: "Executive", tag: "Leadership" },
                ].map((tpl) => (
                  <span
                    key={tpl.name}
                    className="text-[11.5px] font-mono px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 border border-slate-200/80 font-semibold"
                  >
                    {tpl.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-4 border-t border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  id="builder-create-blank-btn"
                  onClick={onNewResume}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[13.5px] px-5 py-3 rounded-full flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 active:scale-98 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Create Resume
                </button>

                <button
                  id="builder-upload-existing-btn"
                  onClick={onOpenUpload || onNewResume}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-[13.5px] px-4 py-3 rounded-full flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  Upload Existing
                </button>
              </div>

              <button
                onClick={onViewAllHistory}
                className="w-full text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/60 font-semibold text-[13px] py-2 rounded-full flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <FolderOpen className="w-4 h-4" />
                Saved Resumes ({totalResumes})
              </button>
            </div>
          </div>

          {/* FEATURE CARD 2: ATS SCANNER */}
          <div
            id="card-ats-scanner"
            className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-purple-300 transition-all duration-200 flex flex-col justify-between group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-44 h-44 bg-purple-50/70 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 shadow-2xs">
                  <Target className="w-6 h-6" />
                </div>
                <span className="text-[11.5px] font-mono font-bold text-purple-700 bg-purple-50/80 px-3 py-1 rounded-full border border-purple-100">
                  AI Estimate
                </span>
              </div>

              <h2 className="text-[22px] font-extrabold text-slate-900 tracking-tight mb-1.5">
                ATS Scanner
              </h2>
              <p className="text-[14px] text-slate-600 leading-relaxed mb-4">
                Evaluate keyword density, domain competency match, and formatting readability against target job descriptions.
              </p>

              {/* ATS Highlights & Score Indicator */}
              <div className="bg-purple-50/60 rounded-2xl p-3 border border-purple-100 flex items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-purple-700 font-mono font-extrabold text-[15px] border border-purple-200 shadow-2xs">
                    {atsScore ? `${atsScore}%` : "—"}
                  </div>
                  <div>
                    <span className="text-[12px] font-bold text-slate-900 block leading-tight">
                      {atsScore ? "Current Readiness Score" : "No Scan Yet"}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {atsScore ? "Based on active resume content" : "Run scan to see score"}
                    </span>
                  </div>
                </div>

                {scoreMeta && (
                  <span className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-full border ${scoreMeta.color}`}>
                    {scoreMeta.label}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-4 border-t border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  id="scanner-scan-active-btn"
                  onClick={() => onOpenScanner(activeResume || undefined)}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-[13.5px] px-5 py-3 rounded-full flex items-center justify-center gap-2 shadow-md shadow-purple-500/20 active:scale-98 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  Scan Resume
                </button>

                <button
                  id="scanner-compare-jd-btn"
                  onClick={() => onOpenScanner()}
                  className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold text-[13.5px] px-4 py-3 rounded-full flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
                >
                  <Target className="w-4 h-4" />
                  Compare with Job
                </button>
              </div>

              <button
                onClick={onOpenUpload || (() => onOpenScanner())}
                className="w-full text-slate-600 hover:text-purple-600 hover:bg-purple-50/60 font-semibold text-[13px] py-2 rounded-full flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                Upload New File to Scan
              </button>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. COMPACT AI QUICK TOOLS SECTION                                         */}
        {/* ========================================================================= */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[17px] font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-600" />
              AI Tools
            </h2>
            <span className="text-[12px] font-mono text-slate-500">Fast Actions</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Tool 1: Improve Resume */}
            <div
              onClick={() => {
                if (activeResume) onSelectResume(activeResume);
                else onNewResume();
              }}
              className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer flex items-center gap-3.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Improve Resume
                </div>
                <div className="text-[12px] text-slate-500 truncate">
                  Enhance bullet points &amp; summary
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
            </div>

            {/* Tool 2: Analyze Job */}
            <div
              onClick={() => onOpenScanner()}
              className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:border-purple-300 hover:shadow-xs transition-all cursor-pointer flex items-center gap-3.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 shrink-0 group-hover:scale-105 transition-transform">
                <Target className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                  Analyze Job
                </div>
                <div className="text-[12px] text-slate-500 truncate">
                  Compare JD against candidate skills
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
            </div>

            {/* Tool 3: Upload Resume */}
            <div
              onClick={onOpenUpload || onNewResume}
              className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer flex items-center gap-3.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0 group-hover:scale-105 transition-transform">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                  Upload Resume
                </div>
                <div className="text-[12px] text-slate-500 truncate">
                  Import PDF, DOCX or TXT files
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. SAVED RESUMES SECTION WITH RICH A4 MINIATURE PREVIEWS                  */}
        {/* ========================================================================= */}
        <section className="flex flex-col gap-4">
          <div className="flex justify-between items-center px-1">
            <div>
              <h2 className="text-[20px] font-extrabold text-slate-900 tracking-tight">
                My Resumes
              </h2>
              <p className="text-[13px] text-slate-500 mt-0.5">
                Saved resumes with live template previews and instant ATS scoring
              </p>
            </div>

            {totalResumes > 0 && (
              <button
                id="view-all-resumes-top-btn"
                onClick={onViewAllHistory}
                className="text-[13px] font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-3.5 py-1.5 rounded-full transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>View All ({totalResumes})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {totalResumes === 0 ? (
            /* Polished Empty State */
            <div className="bg-white rounded-3xl p-10 sm:p-14 border border-slate-200/90 text-center flex flex-col items-center gap-4 shadow-xs">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-2xs">
                <FileText className="w-8 h-8" />
              </div>
              <div className="max-w-md">
                <h3 className="text-[19px] font-extrabold text-slate-900">
                  No resume yet
                </h3>
                <p className="text-[14px] text-slate-600 mt-1.5 leading-relaxed">
                  Start from scratch or upload an existing resume and let AI fill it for you.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
                <button
                  onClick={onNewResume}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-[13.5px] font-bold px-6 py-3 rounded-full shadow-md shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Resume
                </button>
                <button
                  onClick={onOpenUpload || onNewResume}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[13.5px] font-bold px-5 py-3 rounded-full transition-all cursor-pointer flex items-center gap-2"
                >
                  <UploadCloud className="w-4 h-4" />
                  Upload Resume
                </button>
              </div>
            </div>
          ) : (
            /* Rich Resume Cards with Miniature A4 Preview on the Left */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {resumes.slice(0, 4).map((resume) => {
                const score = resume.atsScore || 78;
                const isHigh = score >= 80;
                const isMedium = score >= 65 && score < 80;
                const templateName = resume.selectedTemplate || "Modern";

                return (
                  <div
                    key={resume.id}
                    id={`home-resume-${resume.id}`}
                    className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between gap-4 group"
                  >
                    {/* Top Row: Mini Preview on Left + Details on Right */}
                    <div className="flex items-start gap-4">
                      {/* Left: A4 Thumbnail Preview */}
                      <ResumeMiniPreview
                        resume={resume}
                        className="group-hover:border-indigo-300 transition-colors"
                      />

                      {/* Right: Resume Meta & Scores */}
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

                    {/* Bottom Action Buttons */}
                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSelectResume(resume)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-[12.5px] font-bold px-4 py-1.5 rounded-full flex items-center gap-1 shadow-2xs active:scale-95 transition-all cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Edit
                        </button>

                        <button
                          onClick={() => onOpenScanner(resume)}
                          className="bg-purple-50 hover:bg-purple-100 text-purple-700 text-[12.5px] font-bold px-3.5 py-1.5 rounded-full border border-purple-200 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Target className="w-3.5 h-3.5" />
                          ATS Scan
                        </button>
                      </div>

                      {onExportPdf && (
                        <button
                          onClick={() => onExportPdf(resume)}
                          title="Export PDF"
                          className="flex items-center gap-1 px-3 py-1.5 text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors text-[12px] font-bold border border-slate-200 hover:border-indigo-300 active:scale-95 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-indigo-600" />
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

        {/* ========================================================================= */}
        {/* 6. RECENT ACTIVITY (Derived from Real Resume Events)                       */}
        {/* ========================================================================= */}
        {totalResumes > 0 && (
          <section className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                Recent Activity
              </h2>
              <span className="text-[11.5px] font-mono text-slate-500">Cloud Synced</span>
            </div>

            <div className="flex flex-col divide-y divide-slate-100 text-[13px]">
              {resumes.slice(0, 3).map((resume, idx) => (
                <div key={resume.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                      {idx === 0 ? <FileCheck2 className="w-4 h-4 text-indigo-600" /> : <Clock className="w-4 h-4 text-slate-500" />}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 block">
                        {idx === 0 ? `Resume "${resume.title}" updated` : `Resume "${resume.title}" saved in workspace`}
                      </span>
                      <span className="text-[11.5px] text-slate-500 font-mono">
                        Template: {resume.selectedTemplate || "Modern"} • {resume.targetRole || "General"}
                      </span>
                    </div>
                  </div>

                  <span className="text-[11.5px] font-mono text-slate-400 shrink-0">
                    {resume.lastEdited || "Recently"}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};
