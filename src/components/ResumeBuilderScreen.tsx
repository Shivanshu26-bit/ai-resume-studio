import React, { useState } from "react";
import { Resume, WorkExperience, EducationItem, ProjectItem, BottomNavTab } from "../types";
import { TopAppBar } from "./TopAppBar";
import { demoAlexChenData } from "../data/mockResumes";
import { ResumeDocument } from "./ResumeDocument";
import { JobMatcherModal } from "./JobMatcherModal";
import { SummaryAiModal } from "./SummaryAiModal";
import { BulletEnhancerModal } from "./BulletEnhancerModal";
import { ProjectEnhancerModal } from "./ProjectEnhancerModal";

type BuilderSectionId = "personal" | "summary" | "experience" | "projects" | "education" | "skills" | "templates";

interface ResumeBuilderScreenProps {
  resume: Resume;
  onChange: (updated: Resume) => void;
  onSave?: (resume: Resume) => void;
  isSaving?: boolean;
  onRunAnalysis: (resume: Resume) => void;
  onNavigateToAtsScanner?: (resume: Resume) => void;
  onExportPdf?: (resume: Resume) => void;
  isExportingPdf?: boolean;
  onBack: () => void;
  onOpenSettings: () => void;
  onTabChange?: (tab: BottomNavTab) => void;
}

export const ResumeBuilderScreen: React.FC<ResumeBuilderScreenProps> = ({
  resume,
  onChange,
  onSave,
  isSaving = false,
  onRunAnalysis,
  onNavigateToAtsScanner,
  onExportPdf,
  isExportingPdf = false,
  onBack,
  onOpenSettings,
  onTabChange,
}) => {
  const [activeSection, setActiveSection] = useState<BuilderSectionId>("personal");
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [newSkillInput, setNewSkillInput] = useState("");

  // Modals state
  const [isJobMatcherOpen, setIsJobMatcherOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [bulletModalData, setBulletModalData] = useState<{
    isOpen: boolean;
    expId: string;
    bIndex: number;
    currentBullet: string;
    jobTitle?: string;
    company?: string;
  }>({
    isOpen: false,
    expId: "",
    bIndex: 0,
    currentBullet: "",
  });
  const [projectModalData, setProjectModalData] = useState<{
    isOpen: boolean;
    projectIndex: number;
    project: ProjectItem;
  }>({
    isOpen: false,
    projectIndex: 0,
    project: { id: "", title: "", description: "" },
  });

  const handleManualSave = async () => {
    if (onSave) {
      await onSave(resume);
    } else {
      onChange(resume);
    }
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 2500);
  };

  // Demo toggle handler
  const handleDemoToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsDemoMode(checked);
    if (checked) {
      onChange({
        ...resume,
        targetRole: "Senior Android Engineer",
        personal: {
          ...resume.personal,
          ...demoAlexChenData,
        },
        skills: [
          "Kotlin",
          "Jetpack Compose",
          "Coroutines & Flow",
          "Hilt / Dagger",
          "Clean Architecture",
          "Room DB",
          "CI/CD"
        ],
        experiences: [
          {
            id: "exp-demo-1",
            title: "Senior Mobile Engineer",
            company: "Apex Tech Labs",
            location: "San Francisco, CA",
            startDate: "2021",
            endDate: "Present",
            current: true,
            bullets: [
              "Architected modern Android client using Kotlin, Jetpack Compose, and MVI architecture for 500k+ active users.",
              "Spearheaded multi-module migration reducing clean build time by 45% across 14 mobile developers.",
              "Integrated offline-first Room database and Ktor networking client with 99.9% crash-free sessions."
            ]
          },
          {
            id: "exp-demo-2",
            title: "Android Developer",
            company: "Vanguard Digital",
            location: "San Jose, CA",
            startDate: "2019",
            endDate: "2021",
            current: false,
            bullets: [
              "Developed core e-commerce checkout flow in Kotlin Coroutines, boosting conversion rate by 18%.",
              "Implemented automated CI/CD GitHub Actions pipelines deploying signed release bundles directly to Google Play."
            ]
          }
        ]
      });
    }
  };

  const handleOpenBulletModal = (expId: string, bIndex: number, currentBullet: string) => {
    const exp = resume.experiences.find((e) => e.id === expId);
    setBulletModalData({
      isOpen: true,
      expId,
      bIndex,
      currentBullet,
      jobTitle: exp?.title,
      company: exp?.company,
    });
  };

  const handleApplyBullet = (enhancedBullet: string) => {
    const updatedExperiences = resume.experiences.map((e) => {
      if (e.id === bulletModalData.expId) {
        const newBullets = [...e.bullets];
        newBullets[bulletModalData.bIndex] = enhancedBullet;
        return { ...e, bullets: newBullets };
      }
      return e;
    });
    onChange({ ...resume, experiences: updatedExperiences });
  };

  const handleAddExperience = () => {
    const newExp: WorkExperience = {
      id: "exp-" + Date.now(),
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: true,
      bullets: ["Contributed to core product features and collaborated with cross-functional teams to deliver milestones."],
    };
    onChange({ ...resume, experiences: [newExp, ...resume.experiences] });
  };

  const handleRemoveExperience = (id: string) => {
    onChange({
      ...resume,
      experiences: resume.experiences.filter((e) => e.id !== id),
    });
  };

  const handleAddProject = () => {
    const newProj: ProjectItem = {
      id: "proj-" + Date.now(),
      title: "",
      description: "",
      technologies: [],
      link: "",
    };
    onChange({ ...resume, projects: [...(resume.projects || []), newProj] });
  };

  const handleRemoveProject = (id: string) => {
    onChange({
      ...resume,
      projects: (resume.projects || []).filter((p) => p.id !== id),
    });
  };

  const handleAddEducation = () => {
    const newEdu: EducationItem = {
      id: "edu-" + Date.now(),
      degree: "B.S. in Computer Science",
      school: "University",
      location: "City, State",
      year: "2024",
    };
    onChange({ ...resume, education: [...resume.education, newEdu] });
  };

  const handleRemoveEducation = (id: string) => {
    onChange({
      ...resume,
      education: resume.education.filter((e) => e.id !== id),
    });
  };

  const handleAddSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !resume.skills.includes(trimmed)) {
      onChange({ ...resume, skills: [...resume.skills, trimmed] });
      setNewSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    onChange({
      ...resume,
      skills: resume.skills.filter((s) => s !== skillToRemove),
    });
  };

  const sectionsList: Array<{ id: BuilderSectionId; label: string; icon: string; count?: number }> = [
    { id: "personal", label: "Personal Info", icon: "person" },
    { id: "summary", label: "Summary", icon: "short_text" },
    { id: "experience", label: "Experience", icon: "work", count: resume.experiences?.length },
    { id: "projects", label: "Projects", icon: "code", count: resume.projects?.length },
    { id: "education", label: "Education", icon: "school", count: resume.education?.length },
    { id: "skills", label: "Skills", icon: "psychology", count: resume.skills?.length },
    { id: "templates", label: "Templates", icon: "palette" },
  ];

  const templates = [
    {
      id: "modern",
      name: "Modern",
      desc: "Clean typography with subtle indigo accents and high ATS readability.",
      badge: "Most Popular",
    },
    {
      id: "classic",
      name: "Classic",
      desc: "Traditional serif styling, formal dividers, and time-tested formatting.",
      badge: "Traditional",
    },
    {
      id: "minimal",
      name: "Minimal",
      desc: "Understated hierarchy, generous margins, and maximum content clarity.",
      badge: "Clean",
    },
    {
      id: "executive",
      name: "Executive",
      desc: "Two-column layout highlighting key competencies, leadership, and summary.",
      badge: "Senior / Exec",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] pb-28 pt-16 flex flex-col">
      <TopAppBar
        title="AI Resume Studio"
        activeTab="builder"
        onTabChange={onTabChange}
        showBack={true}
        onBackClick={onBack}
        onSettingsClick={onOpenSettings}
      />

      {/* Main Workspace Layout */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col lg:flex-row gap-6">
        {/* Left Column (Desktop Section Sidebar + Form Area) */}
        <div className="w-full lg:w-7/12 flex flex-col gap-4">
          {/* Top Status & AI Action Bar */}
          <div className="bg-white rounded-2xl p-3 sm:px-4 border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            {/* Status & Cloud Sync */}
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isSaving ? "bg-amber-400 animate-ping" : "bg-emerald-500"}`} />
              <span className="text-[12px] font-mono text-slate-600 font-semibold">
                {isSaving ? "Saving to Firestore..." : saveSuccessNotice ? "Saved to Cloud Firestore ✓" : "Cloud Sync Active"}
              </span>
            </div>

            {/* Top Toolbar Actions */}
            <div className="flex items-center gap-2">
              {/* Match Job Description Trigger */}
              <button
                type="button"
                id="open-job-matcher-btn"
                onClick={() => setIsJobMatcherOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-[12px] border border-purple-200 transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                <span className="material-symbols-outlined text-[16px]">target</span>
                <span>Match Job Post</span>
              </button>

              {/* Check ATS Score Button */}
              <button
                type="button"
                id="check-ats-score-btn"
                onClick={() => {
                  if (onNavigateToAtsScanner) {
                    onNavigateToAtsScanner(resume);
                  } else {
                    onRunAnalysis(resume);
                  }
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[12px] border border-indigo-200 transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                <span className="material-symbols-outlined text-[16px]">document_scanner</span>
                <span>Check ATS Score</span>
              </button>

              {/* Save Resume Button */}
              <button
                type="button"
                id="save-resume-cloud-btn"
                onClick={handleManualSave}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-[12px] transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                <span className="material-symbols-outlined text-[15px]">
                  {saveSuccessNotice ? "check" : isSaving ? "sync" : "cloud_upload"}
                </span>
                <span>{isSaving ? "Saving..." : saveSuccessNotice ? "Saved!" : "Save"}</span>
              </button>
            </div>
          </div>

          {/* Section Navigation Tabs (Horizontal Scrollable Pills) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {sectionsList.map((sec) => {
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  id={`section-tab-${sec.id}`}
                  onClick={() => setActiveSection(sec.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12.5px] font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                    isActive
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs font-bold"
                      : "bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <span className={`material-symbols-outlined text-[16px] ${isActive ? "text-white" : "text-slate-400"}`}>
                    {sec.icon}
                  </span>
                  <span>{sec.label}</span>
                  {typeof sec.count === "number" && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                        isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {sec.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Form Content Cards */}
          <div className="flex flex-col gap-4">
            {/* 1. PERSONAL INFO SECTION */}
            {activeSection === "personal" && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col gap-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-[17px] font-bold text-slate-900 tracking-tight">
                      Personal &amp; Contact Details
                    </h3>
                    <p className="text-[12.5px] text-slate-500 mt-0.5">
                      Ensure your contact information is accurate for recruiters and ATS parsers.
                    </p>
                  </div>

                  {/* Sample Autofill Toggle */}
                  <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                    <input
                      type="checkbox"
                      checked={isDemoMode}
                      onChange={handleDemoToggle}
                      className="w-3.5 h-3.5 text-indigo-600 rounded-sm focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="text-[11.5px] font-mono font-semibold text-slate-700">Autofill Demo Data</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12.5px] font-bold text-slate-800 mb-1.5">
                      Resume Title / Label:
                    </label>
                    <input
                      type="text"
                      value={resume.title}
                      onChange={(e) => onChange({ ...resume, title: e.target.value })}
                      placeholder="e.g. Senior Android Engineer Resume"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13.5px] text-slate-900 focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[12.5px] font-bold text-slate-800 mb-1.5">
                      Target Role / Header:
                    </label>
                    <input
                      type="text"
                      value={resume.targetRole}
                      onChange={(e) => onChange({ ...resume, targetRole: e.target.value })}
                      placeholder="e.g. Senior Software Engineer"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13.5px] text-slate-900 focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[12.5px] font-bold text-slate-800 mb-1.5">
                      First Name:
                    </label>
                    <input
                      type="text"
                      value={resume.personal.firstName}
                      onChange={(e) =>
                        onChange({
                          ...resume,
                          personal: { ...resume.personal, firstName: e.target.value },
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13.5px] text-slate-900 focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[12.5px] font-bold text-slate-800 mb-1.5">
                      Last Name:
                    </label>
                    <input
                      type="text"
                      value={resume.personal.lastName}
                      onChange={(e) =>
                        onChange({
                          ...resume,
                          personal: { ...resume.personal, lastName: e.target.value },
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13.5px] text-slate-900 focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[12.5px] font-bold text-slate-800 mb-1.5">
                      Email Address:
                    </label>
                    <input
                      type="email"
                      value={resume.personal.email}
                      onChange={(e) =>
                        onChange({
                          ...resume,
                          personal: { ...resume.personal, email: e.target.value },
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13.5px] text-slate-900 focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[12.5px] font-bold text-slate-800 mb-1.5">
                      Phone Number:
                    </label>
                    <input
                      type="text"
                      value={resume.personal.phone}
                      onChange={(e) =>
                        onChange({
                          ...resume,
                          personal: { ...resume.personal, phone: e.target.value },
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13.5px] text-slate-900 focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[12.5px] font-bold text-slate-800 mb-1.5">
                      Location (City, State / Country):
                    </label>
                    <input
                      type="text"
                      value={resume.personal.location}
                      onChange={(e) =>
                        onChange({
                          ...resume,
                          personal: { ...resume.personal, location: e.target.value },
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13.5px] text-slate-900 focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[12.5px] font-bold text-slate-800 mb-1.5">
                      LinkedIn / Portfolio URL:
                    </label>
                    <input
                      type="text"
                      value={resume.personal.linkedin || ""}
                      onChange={(e) =>
                        onChange({
                          ...resume,
                          personal: { ...resume.personal, linkedin: e.target.value },
                        })
                      }
                      placeholder="linkedin.com/in/yourprofile"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13.5px] text-slate-900 focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. SUMMARY SECTION */}
            {activeSection === "summary" && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-[17px] font-bold text-slate-900 tracking-tight">
                      Professional Summary
                    </h3>
                    <p className="text-[12.5px] text-slate-500 mt-0.5">
                      A concise 2-4 sentence overview of your career impact and core strengths.
                    </p>
                  </div>

                  {/* AI Generate Summary Action */}
                  <button
                    type="button"
                    id="open-summary-ai-btn"
                    onClick={() => setIsSummaryModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[12px] border border-indigo-200 transition-all cursor-pointer self-start sm:self-auto shadow-2xs active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                    <span>Generate with AI</span>
                  </button>
                </div>

                <textarea
                  rows={6}
                  value={resume.personal.summary || ""}
                  onChange={(e) =>
                    onChange({
                      ...resume,
                      personal: { ...resume.personal, summary: e.target.value },
                    })
                  }
                  placeholder="e.g. Results-driven Software Engineer with 4+ years of experience in architecting scalable mobile and web applications..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-[13.5px] text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 leading-relaxed font-sans"
                />
              </div>
            )}

            {/* 3. WORK EXPERIENCE SECTION */}
            {activeSection === "experience" && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between px-1">
                  <div>
                    <h3 className="text-[17px] font-bold text-slate-900 tracking-tight">
                      Work Experience
                    </h3>
                    <p className="text-[12.5px] text-slate-500 mt-0.5">
                      Highlight your accomplishments with quantifiable, action-oriented bullet points.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddExperience}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-[12.5px] font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    Add Job
                  </button>
                </div>

                {resume.experiences.map((exp, expIdx) => (
                  <div
                    key={exp.id}
                    className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col gap-4 relative"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <span className="text-[13px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                        Position #{expIdx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveExperience(exp.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-full transition-colors cursor-pointer"
                        title="Remove Job"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[12px] font-bold text-slate-700 mb-1">
                          Job Title:
                        </label>
                        <input
                          type="text"
                          value={exp.title}
                          onChange={(e) => {
                            const updated = [...resume.experiences];
                            updated[expIdx] = { ...exp, title: e.target.value };
                            onChange({ ...resume, experiences: updated });
                          }}
                          placeholder="e.g. Senior Mobile Engineer"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[13.5px] text-slate-900 focus:outline-hidden focus:border-indigo-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[12px] font-bold text-slate-700 mb-1">
                          Company Name:
                        </label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => {
                            const updated = [...resume.experiences];
                            updated[expIdx] = { ...exp, company: e.target.value };
                            onChange({ ...resume, experiences: updated });
                          }}
                          placeholder="e.g. Acme Corporation"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[13.5px] text-slate-900 focus:outline-hidden focus:border-indigo-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[12px] font-bold text-slate-700 mb-1">
                          Location:
                        </label>
                        <input
                          type="text"
                          value={exp.location}
                          onChange={(e) => {
                            const updated = [...resume.experiences];
                            updated[expIdx] = { ...exp, location: e.target.value };
                            onChange({ ...resume, experiences: updated });
                          }}
                          placeholder="e.g. San Francisco, CA (or Remote)"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[13.5px] text-slate-900 focus:outline-hidden focus:border-indigo-600"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[12px] font-bold text-slate-700 mb-1">
                            Start Date:
                          </label>
                          <input
                            type="text"
                            value={exp.startDate}
                            onChange={(e) => {
                              const updated = [...resume.experiences];
                              updated[expIdx] = { ...exp, startDate: e.target.value };
                              onChange({ ...resume, experiences: updated });
                            }}
                            placeholder="e.g. 2021"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[13.5px] text-slate-900 focus:outline-hidden focus:border-indigo-600"
                          />
                        </div>

                        <div>
                          <label className="block text-[12px] font-bold text-slate-700 mb-1">
                            End Date:
                          </label>
                          <input
                            type="text"
                            value={exp.endDate}
                            onChange={(e) => {
                              const updated = [...resume.experiences];
                              updated[expIdx] = { ...exp, endDate: e.target.value };
                              onChange({ ...resume, experiences: updated });
                            }}
                            placeholder="e.g. Present"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[13.5px] text-slate-900 focus:outline-hidden focus:border-indigo-600"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bullet Points with AI Enhance Button */}
                    <div className="flex flex-col gap-2.5 pt-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[12px] font-bold text-slate-800">
                          Accomplishment Bullets:
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...resume.experiences];
                            updated[expIdx] = {
                              ...exp,
                              bullets: [...exp.bullets, "New impactful contribution with measurable metrics."],
                            };
                            onChange({ ...resume, experiences: updated });
                          }}
                          className="text-[11.5px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[15px]">add</span>
                          Add Bullet
                        </button>
                      </div>

                      {exp.bullets.map((bullet, bIdx) => (
                        <div key={bIdx} className="flex items-start gap-2">
                          <textarea
                            rows={2}
                            value={bullet}
                            onChange={(e) => {
                              const updatedBullets = [...exp.bullets];
                              updatedBullets[bIdx] = e.target.value;
                              const updated = [...resume.experiences];
                              updated[expIdx] = { ...exp, bullets: updatedBullets };
                              onChange({ ...resume, experiences: updated });
                            }}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[13px] text-slate-900 focus:outline-hidden focus:border-indigo-600 leading-relaxed font-sans"
                          />

                          {/* AI Bullet Enhancer Trigger */}
                          <button
                            type="button"
                            title="Improve with AI (STAR Method)"
                            onClick={() => handleOpenBulletModal(exp.id, bIdx, bullet)}
                            className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/80 transition-colors cursor-pointer shadow-2xs flex-shrink-0"
                          >
                            <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                          </button>

                          {/* Remove Bullet */}
                          <button
                            type="button"
                            onClick={() => {
                              const updatedBullets = exp.bullets.filter((_, i) => i !== bIdx);
                              const updated = [...resume.experiences];
                              updated[expIdx] = { ...exp, bullets: updatedBullets };
                              onChange({ ...resume, experiences: updated });
                            }}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 transition-colors cursor-pointer flex-shrink-0"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 4. KEY PROJECTS SECTION */}
            {activeSection === "projects" && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between px-1">
                  <div>
                    <h3 className="text-[17px] font-bold text-slate-900 tracking-tight">
                      Key Projects
                    </h3>
                    <p className="text-[12.5px] text-slate-500 mt-0.5">
                      Showcase high-impact projects, open-source work, or software products.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddProject}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-[12.5px] font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    Add Project
                  </button>
                </div>

                {(resume.projects || []).length === 0 ? (
                  <div className="bg-white rounded-3xl p-6 border border-slate-200/80 text-center flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined text-[32px] text-slate-400">code</span>
                    <p className="text-[13.5px] text-slate-600">No projects added yet.</p>
                    <button
                      type="button"
                      onClick={handleAddProject}
                      className="text-[13px] font-bold text-indigo-600 hover:underline cursor-pointer"
                    >
                      + Add your first project
                    </button>
                  </div>
                ) : (
                  (resume.projects || []).map((proj, pIdx) => (
                    <div
                      key={proj.id}
                      className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col gap-4"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <span className="text-[13px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                          Project #{pIdx + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setProjectModalData({
                                isOpen: true,
                                projectIndex: pIdx,
                                project: proj,
                              })
                            }
                            className="flex items-center gap-1 px-3 py-1 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 text-[11.5px] font-bold border border-purple-200 transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                            Improve Project
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveProject(proj.id)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[12px] font-bold text-slate-700 mb-1">
                            Project Title:
                          </label>
                          <input
                            type="text"
                            value={proj.title}
                            onChange={(e) => {
                              const updated = [...(resume.projects || [])];
                              updated[pIdx] = { ...proj, title: e.target.value };
                              onChange({ ...resume, projects: updated });
                            }}
                            placeholder="e.g. AI Content Studio"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[13.5px] text-slate-900 focus:outline-hidden focus:border-indigo-600"
                          />
                        </div>

                        <div>
                          <label className="block text-[12px] font-bold text-slate-700 mb-1">
                            Live URL / Repo Link:
                          </label>
                          <input
                            type="text"
                            value={proj.link || ""}
                            onChange={(e) => {
                              const updated = [...(resume.projects || [])];
                              updated[pIdx] = { ...proj, link: e.target.value };
                              onChange({ ...resume, projects: updated });
                            }}
                            placeholder="e.g. github.com/user/project"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[13.5px] text-slate-900 focus:outline-hidden focus:border-indigo-600"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[12px] font-bold text-slate-700 mb-1">
                          Project Summary / Tech Stack:
                        </label>
                        <textarea
                          rows={3}
                          value={proj.description}
                          onChange={(e) => {
                            const updated = [...(resume.projects || [])];
                            updated[pIdx] = { ...proj, description: e.target.value };
                            onChange({ ...resume, projects: updated });
                          }}
                          placeholder="Describe the architectural design, technologies used, and business outcome..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-[13px] text-slate-900 focus:outline-hidden focus:border-indigo-600 leading-relaxed font-sans"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 5. EDUCATION SECTION */}
            {activeSection === "education" && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between px-1">
                  <div>
                    <h3 className="text-[17px] font-bold text-slate-900 tracking-tight">
                      Education
                    </h3>
                    <p className="text-[12.5px] text-slate-500 mt-0.5">
                      Degrees, academic honors, universities, and graduation dates.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddEducation}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-[12.5px] font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    Add Education
                  </button>
                </div>

                {resume.education.map((edu, eduIdx) => (
                  <div
                    key={edu.id}
                    className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col gap-4"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <span className="text-[13px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                        Degree #{eduIdx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEducation(edu.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[12px] font-bold text-slate-700 mb-1">
                          Degree / Major:
                        </label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => {
                            const updated = [...resume.education];
                            updated[eduIdx] = { ...edu, degree: e.target.value };
                            onChange({ ...resume, education: updated });
                          }}
                          placeholder="e.g. B.S. in Computer Science"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[13.5px] text-slate-900 focus:outline-hidden focus:border-indigo-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[12px] font-bold text-slate-700 mb-1">
                          University / Institution:
                        </label>
                        <input
                          type="text"
                          value={edu.school}
                          onChange={(e) => {
                            const updated = [...resume.education];
                            updated[eduIdx] = { ...edu, school: e.target.value };
                            onChange({ ...resume, education: updated });
                          }}
                          placeholder="e.g. UC Berkeley"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[13.5px] text-slate-900 focus:outline-hidden focus:border-indigo-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[12px] font-bold text-slate-700 mb-1">
                          Location:
                        </label>
                        <input
                          type="text"
                          value={edu.location || ""}
                          onChange={(e) => {
                            const updated = [...resume.education];
                            updated[eduIdx] = { ...edu, location: e.target.value };
                            onChange({ ...resume, education: updated });
                          }}
                          placeholder="e.g. Berkeley, CA"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[13.5px] text-slate-900 focus:outline-hidden focus:border-indigo-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[12px] font-bold text-slate-700 mb-1">
                          Graduation Year:
                        </label>
                        <input
                          type="text"
                          value={edu.year}
                          onChange={(e) => {
                            const updated = [...resume.education];
                            updated[eduIdx] = { ...edu, year: e.target.value };
                            onChange({ ...resume, education: updated });
                          }}
                          placeholder="e.g. 2022"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[13.5px] text-slate-900 focus:outline-hidden focus:border-indigo-600"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 6. SKILLS SECTION */}
            {activeSection === "skills" && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col gap-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-[17px] font-bold text-slate-900 tracking-tight">
                    Technical &amp; Professional Skills
                  </h3>
                  <p className="text-[12.5px] text-slate-500 mt-0.5">
                    ATS parsing engines scan skills for direct keyword alignment with job postings.
                  </p>
                </div>

                {/* Add Skill Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSkill(newSkillInput);
                      }
                    }}
                    placeholder="Type a skill (e.g. React, TypeScript, Docker) and press Enter..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13.5px] text-slate-900 focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkill(newSkillInput)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-bold px-5 py-2.5 rounded-xl shadow-xs cursor-pointer active:scale-95"
                  >
                    Add
                  </button>
                </div>

                {/* Skills Pills */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {resume.skills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-indigo-50/80 text-indigo-900 border border-indigo-200/80 text-[12.5px] font-mono font-medium px-3 py-1.5 rounded-xl flex items-center gap-1.5 group"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-indigo-400 hover:text-rose-600 p-0.5 rounded-full"
                      >
                        <span className="material-symbols-outlined text-[15px]">close</span>
                      </button>
                    </span>
                  ))}
                </div>

                {/* Recommended Quick-Add Skills */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <span className="text-[12px] font-bold text-slate-600 block mb-2 font-mono">
                    Popular In-Demand Skills:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {["TypeScript", "React", "Node.js", "Python", "GraphQL", "Docker", "AWS", "Tailwind CSS", "CI/CD", "Jest"].map((quickSkill) => {
                      const alreadyHas = resume.skills.includes(quickSkill);
                      return (
                        <button
                          key={quickSkill}
                          type="button"
                          onClick={() => !alreadyHas && handleAddSkill(quickSkill)}
                          disabled={alreadyHas}
                          className={`text-[11.5px] font-mono px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                            alreadyHas
                              ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                              : "bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border-slate-200 hover:border-indigo-300"
                          }`}
                        >
                          + {quickSkill}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 7. TEMPLATES SELECTOR SECTION */}
            {activeSection === "templates" && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col gap-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-[17px] font-bold text-slate-900 tracking-tight">
                    Select Resume Template
                  </h3>
                  <p className="text-[12.5px] text-slate-500 mt-0.5">
                    Choose an ATS-compliant layout crafted for maximum recruiter readability.
                  </p>
                </div>

                {/* Visual Template Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {templates.map((tpl) => {
                    const isSelected = (resume.selectedTemplate || "modern") === tpl.id;
                    return (
                      <div
                        key={tpl.id}
                        onClick={() => onChange({ ...resume, selectedTemplate: tpl.id })}
                        className={`rounded-2xl p-4 border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 relative ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-50/20 shadow-sm ring-2 ring-indigo-100"
                            : "border-slate-200 hover:border-indigo-300 bg-white hover:bg-slate-50/50"
                        }`}
                      >
                        {/* Selected Checkmark Badge */}
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                            <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                          </div>
                        )}

                        <div>
                          {/* Miniature Template Wireframe Preview */}
                          <div className="w-full h-24 bg-slate-100 rounded-xl mb-3 border border-slate-200/80 p-2 flex flex-col justify-between overflow-hidden">
                            {tpl.id === "modern" && (
                              <div className="flex flex-col gap-1 w-full">
                                <div className="h-2.5 w-1/3 bg-indigo-600 rounded-sm" />
                                <div className="h-1.5 w-2/3 bg-slate-300 rounded-sm" />
                                <div className="h-px w-full bg-indigo-200 my-0.5" />
                                <div className="h-2 w-full bg-slate-200 rounded-sm" />
                                <div className="h-2 w-4/5 bg-slate-200 rounded-sm" />
                              </div>
                            )}
                            {tpl.id === "classic" && (
                              <div className="flex flex-col items-center gap-1 w-full text-center">
                                <div className="h-2.5 w-1/2 bg-slate-800 rounded-sm" />
                                <div className="h-1.5 w-3/4 bg-slate-400 rounded-sm" />
                                <div className="h-0.5 w-full bg-slate-800 my-0.5" />
                                <div className="h-2 w-full bg-slate-200 rounded-sm" />
                              </div>
                            )}
                            {tpl.id === "minimal" && (
                              <div className="flex flex-col gap-1 w-full">
                                <div className="h-2.5 w-1/4 bg-slate-900 rounded-sm" />
                                <div className="h-1.5 w-1/2 bg-slate-400 rounded-sm" />
                                <div className="h-2 w-full bg-slate-200 rounded-sm mt-1" />
                                <div className="h-2 w-3/4 bg-slate-200 rounded-sm" />
                              </div>
                            )}
                            {tpl.id === "executive" && (
                              <div className="grid grid-cols-3 gap-1.5 w-full h-full">
                                <div className="col-span-1 bg-slate-200/80 rounded-sm p-1 flex flex-col gap-1">
                                  <div className="h-2 w-full bg-slate-400 rounded-sm" />
                                  <div className="h-1.5 w-3/4 bg-slate-300 rounded-sm" />
                                </div>
                                <div className="col-span-2 flex flex-col gap-1">
                                  <div className="h-2.5 w-1/2 bg-indigo-700 rounded-sm" />
                                  <div className="h-2 w-full bg-slate-200 rounded-sm" />
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <h4 className="text-[15px] font-bold text-slate-900">{tpl.name}</h4>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                              {tpl.badge}
                            </span>
                          </div>

                          <p className="text-[12px] text-slate-600 mt-1 leading-relaxed">
                            {tpl.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sticky Live A4 Document Preview (Desktop) */}
        <div className="hidden lg:flex lg:w-5/12 flex-col">
          <div className="sticky top-20 bg-white rounded-3xl shadow-md border border-slate-200/80 overflow-hidden flex flex-col h-[calc(100vh-6.5rem)]">
            {/* Live Preview Header Toolbar */}
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex flex-wrap justify-between items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600 text-[18px]">
                  visibility
                </span>
                <span className="text-[12px] font-bold text-slate-800 uppercase tracking-wider font-mono">
                  Live A4 Preview
                </span>
              </div>

              {/* Template Selector & Export PDF Action */}
              <div className="flex items-center gap-2">
                <select
                  id="template-select-dropdown"
                  value={resume.selectedTemplate || "modern"}
                  onChange={(e) => onChange({ ...resume, selectedTemplate: e.target.value })}
                  className="text-[11.5px] font-mono font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 outline-hidden hover:border-indigo-400 cursor-pointer"
                >
                  <option value="modern">Modern</option>
                  <option value="classic">Classic</option>
                  <option value="minimal">Minimal</option>
                  <option value="executive">Executive</option>
                </select>

                {onExportPdf && (
                  <button
                    type="button"
                    id="builder-export-pdf-btn"
                    disabled={isExportingPdf}
                    onClick={() => onExportPdf(resume)}
                    className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-3.5 py-1 rounded-lg text-[12px] font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    {isExportingPdf ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="material-symbols-outlined text-[15px]">picture_as_pdf</span>
                    )}
                    <span>PDF</span>
                  </button>
                )}
              </div>
            </div>

            {/* Simulated A4 Document Scroll Area */}
            <div className="flex-grow overflow-y-auto bg-slate-100 p-4 flex justify-center">
              <div className="w-full max-w-[650px] shadow-sm rounded-xl overflow-hidden bg-white">
                <ResumeDocument
                  resume={resume}
                  template={resume.selectedTemplate || "modern"}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile floating live preview trigger */}
        <div className="lg:hidden fixed bottom-24 right-4 z-30">
          <button
            type="button"
            onClick={() => setShowMobilePreview(!showMobilePreview)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-full shadow-lg shadow-indigo-500/25 flex items-center gap-2 text-[13px] font-bold active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">visibility</span>
            {showMobilePreview ? "Hide Preview" : "Live A4 Preview"}
          </button>
        </div>

        {/* Mobile Preview Modal Sheet */}
        {showMobilePreview && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex flex-col justify-end p-2 sm:p-4">
            <div className="bg-white rounded-t-3xl max-h-[88vh] flex flex-col overflow-hidden shadow-2xl">
              <div className="flex justify-between items-center p-3.5 border-b border-slate-200 bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold text-indigo-900 font-mono">
                    A4 Preview ({resume.selectedTemplate || "modern"})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {onExportPdf && (
                    <button
                      type="button"
                      disabled={isExportingPdf}
                      onClick={() => onExportPdf(resume)}
                      className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[12px] font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      {isExportingPdf ? (
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span className="material-symbols-outlined text-[15px]">picture_as_pdf</span>
                      )}
                      Export PDF
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowMobilePreview(false)}
                    className="p-1 rounded-full hover:bg-slate-200 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>
              </div>
              <div className="p-2 overflow-y-auto bg-slate-100">
                <div className="bg-white rounded-lg shadow-xs overflow-hidden">
                  <ResumeDocument
                    resume={resume}
                    template={resume.selectedTemplate || "modern"}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* AI Modals */}
      <JobMatcherModal
        isOpen={isJobMatcherOpen}
        onClose={() => setIsJobMatcherOpen(false)}
        resume={resume}
        onAddSkill={handleAddSkill}
      />

      <SummaryAiModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        resume={resume}
        onApply={(newSummary) => {
          onChange({
            ...resume,
            personal: { ...resume.personal, summary: newSummary },
          });
        }}
      />

      <BulletEnhancerModal
        isOpen={bulletModalData.isOpen}
        onClose={() => setBulletModalData((prev) => ({ ...prev, isOpen: false }))}
        currentBullet={bulletModalData.currentBullet}
        jobTitle={bulletModalData.jobTitle}
        company={bulletModalData.company}
        onApply={handleApplyBullet}
      />

      <ProjectEnhancerModal
        isOpen={projectModalData.isOpen}
        onClose={() => setProjectModalData((prev) => ({ ...prev, isOpen: false }))}
        project={projectModalData.project}
        onApply={(improvedDescription) => {
          const updatedProjects = [...(resume.projects || [])];
          if (updatedProjects[projectModalData.projectIndex]) {
            updatedProjects[projectModalData.projectIndex] = {
              ...updatedProjects[projectModalData.projectIndex],
              description: improvedDescription,
            };
            onChange({ ...resume, projects: updatedProjects });
          }
        }}
      />
    </div>
  );
};
