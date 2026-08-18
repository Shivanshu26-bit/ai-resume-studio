import React, { useState } from "react";
import { Resume, WorkExperience, EducationItem, ProjectItem } from "../types";
import { TopAppBar } from "./TopAppBar";
import { demoAlexChenData } from "../data/mockResumes";
import { ResumeDocument } from "./ResumeDocument";
import { JobMatcherModal } from "./JobMatcherModal";
import { SummaryAiModal } from "./SummaryAiModal";
import { BulletEnhancerModal } from "./BulletEnhancerModal";
import { ProjectEnhancerModal } from "./ProjectEnhancerModal";

interface ResumeBuilderScreenProps {
  resume: Resume;
  onChange: (updated: Resume) => void;
  onSave?: (resume: Resume) => void;
  isSaving?: boolean;
  onRunAnalysis: (resume: Resume) => void;
  onExportPdf?: (resume: Resume) => void;
  isExportingPdf?: boolean;
  onBack: () => void;
  onOpenSettings: () => void;
}

export const ResumeBuilderScreen: React.FC<ResumeBuilderScreenProps> = ({
  resume,
  onChange,
  onSave,
  isSaving = false,
  onRunAnalysis,
  onExportPdf,
  isExportingPdf = false,
  onBack,
  onOpenSettings,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
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
      bullets: ["Contributed to core application development and collaborated on feature implementation."],
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

  const stepTitles = {
    1: "Personal Info",
    2: "Experience & Projects",
    3: "Skills & Education",
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] pb-28 pt-16 flex flex-col">
      <TopAppBar
        title="AI Resume Studio"
        showBack={true}
        onBackClick={onBack}
        onSettingsClick={onOpenSettings}
      />

      <main className="w-full max-w-6xl mx-auto px-4 py-5 flex flex-col lg:flex-row gap-6">
        {/* Left Column: Multi-step Form Area */}
        <div className="w-full lg:w-7/12 flex flex-col gap-4">
          {/* Firestore Sync & Top Actions Toolbar */}
          <div className="flex items-center justify-between px-2 text-[12px] flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isSaving ? "bg-amber-400 animate-ping" : "bg-emerald-500"}`} />
              <span className="font-mono text-slate-500">
                {isSaving ? "Saving to Cloud Firestore..." : saveSuccessNotice ? "Saved to Cloud Firestore ✓" : "Cloud Sync Active"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Job Matcher Trigger */}
              <button
                type="button"
                id="open-job-matcher-btn"
                onClick={() => setIsJobMatcherOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-[12px] border border-purple-200 transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                <span className="material-symbols-outlined text-[16px]">target</span>
                Match Job Description
              </button>

              <button
                type="button"
                id="save-resume-cloud-btn"
                onClick={handleManualSave}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-indigo-50 text-indigo-700 font-bold text-[12px] border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {saveSuccessNotice ? "check" : isSaving ? "sync" : "cloud_upload"}
                </span>
                {isSaving ? "Saving..." : saveSuccessNotice ? "Saved!" : "Save Changes"}
              </button>
            </div>
          </div>

          {/* Stepper Card */}
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[12px] font-bold text-indigo-700 uppercase tracking-wider font-mono">
                Step {currentStep} of 3
              </span>
              <span className="text-[13px] font-semibold text-slate-600">
                {stepTitles[currentStep]}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-1.5 mb-5 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-400"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>

            {/* Stepper Buttons */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { step: 1, label: "Personal", icon: "person" },
                { step: 2, label: "Experience", icon: "work" },
                { step: 3, label: "Skills", icon: "psychology" },
              ].map(({ step, label }) => {
                const isActive = currentStep === step;
                const isPassed = currentStep > step;
                return (
                  <button
                    key={step}
                    id={`builder-step-tab-${step}`}
                    type="button"
                    onClick={() => setCurrentStep(step as 1 | 2 | 3)}
                    className="flex flex-col items-center group cursor-pointer"
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold mb-1 transition-all ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-xs scale-110"
                          : isPassed
                          ? "bg-indigo-100 text-indigo-700 font-bold"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {isPassed ? "✓" : step}
                    </div>
                    <span
                      className={`text-[12px] ${
                        isActive
                          ? "font-bold text-indigo-700"
                          : "text-slate-500 group-hover:text-slate-800"
                      }`}
                    >
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Contextual Assistant Banner */}
          <div className="bg-gradient-to-r from-indigo-50/90 via-purple-50/70 to-emerald-50/50 rounded-2xl p-4 md:p-5 shadow-xs border border-indigo-100 relative overflow-hidden flex items-start gap-3.5">
            <div className="w-1.5 absolute left-0 top-0 bottom-0 bg-indigo-600" />
            <div className="w-9 h-9 rounded-xl bg-white shadow-xs flex items-center justify-center text-indigo-600 flex-shrink-0 mt-0.5 border border-indigo-100">
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                auto_awesome
              </span>
            </div>
            <div className="flex-1">
              <h4 className="text-[15px] font-bold text-indigo-900 mb-0.5">
                AI Assistant Ready
              </h4>
              <p className="text-[13px] text-slate-600 leading-relaxed">
                {currentStep === 1
                  ? "I can help generate a professional summary based on your experience later. For now, let's get the basics down."
                  : currentStep === 2
                  ? "Quantify achievements using metrics and percentages. Tap the ✨ Enhance button on any bullet for instant ATS optimization."
                  : "Include both core technical competencies and specialized tools like Kotlin, Compose, and Hilt to maximize your ATS match score."}
              </p>
            </div>
          </div>

          {/* Form Content Card */}
          <div className="bg-white rounded-2xl p-5 md:p-6 shadow-xs border border-slate-200/80 flex flex-col gap-4">
            {/* STEP 1: Personal Details */}
            {currentStep === 1 && (
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center mb-1">
                  <h2 className="text-[18px] font-bold text-slate-900">
                    Personal Details
                  </h2>
                  <span className="text-[12px] text-slate-400 font-mono">Step 1/3</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="m3-input-field">
                    <input
                      id="firstName"
                      type="text"
                      placeholder=" "
                      value={resume.personal.firstName}
                      onChange={(e) =>
                        onChange({
                          ...resume,
                          personal: { ...resume.personal, firstName: e.target.value },
                        })
                      }
                    />
                    <label htmlFor="firstName">First Name</label>
                  </div>

                  <div className="m3-input-field">
                    <input
                      id="lastName"
                      type="text"
                      placeholder=" "
                      value={resume.personal.lastName}
                      onChange={(e) =>
                        onChange({
                          ...resume,
                          personal: { ...resume.personal, lastName: e.target.value },
                        })
                      }
                    />
                    <label htmlFor="lastName">Last Name</label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="m3-input-field">
                    <input
                      id="targetRole"
                      type="text"
                      placeholder=" "
                      value={resume.targetRole}
                      onChange={(e) =>
                        onChange({
                          ...resume,
                          targetRole: e.target.value,
                          title: e.target.value ? `${e.target.value} Resume` : resume.title,
                        })
                      }
                    />
                    <label htmlFor="targetRole">Target Job Title</label>
                  </div>

                  <div className="m3-input-field">
                    <input
                      id="email"
                      type="email"
                      placeholder=" "
                      value={resume.personal.email}
                      onChange={(e) =>
                        onChange({
                          ...resume,
                          personal: { ...resume.personal, email: e.target.value },
                        })
                      }
                    />
                    <label htmlFor="email">Email Address</label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="m3-input-field">
                    <input
                      id="phone"
                      type="tel"
                      placeholder=" "
                      value={resume.personal.phone}
                      onChange={(e) =>
                        onChange({
                          ...resume,
                          personal: { ...resume.personal, phone: e.target.value },
                        })
                      }
                    />
                    <label htmlFor="phone">Phone Number</label>
                  </div>

                  <div className="m3-input-field">
                    <input
                      id="location"
                      type="text"
                      placeholder=" "
                      value={resume.personal.location}
                      onChange={(e) =>
                        onChange({
                          ...resume,
                          personal: { ...resume.personal, location: e.target.value },
                        })
                      }
                    />
                    <label htmlFor="location">Location (City, State)</label>
                  </div>
                </div>

                <div className="m3-input-field">
                  <input
                    id="linkedin"
                    type="url"
                    placeholder=" "
                    value={resume.personal.linkedin}
                    onChange={(e) =>
                      onChange({
                        ...resume,
                        personal: { ...resume.personal, linkedin: e.target.value },
                      })
                    }
                  />
                  <label htmlFor="linkedin">LinkedIn Profile URL</label>
                </div>

                <div className="m3-input-field relative">
                  <textarea
                    id="summary"
                    rows={4}
                    placeholder=" "
                    value={resume.personal.summary}
                    onChange={(e) =>
                      onChange({
                        ...resume,
                        personal: { ...resume.personal, summary: e.target.value },
                      })
                    }
                  />
                  <label htmlFor="summary">Professional Summary</label>

                  <button
                    id="generate-summary-ai-btn"
                    type="button"
                    onClick={() => setIsSummaryModalOpen(true)}
                    title="Generate / Optimize with AI"
                    className="absolute bottom-2.5 right-2.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-full shadow-xs transition-all active:scale-95 flex items-center gap-1 text-[12px] font-bold cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      auto_awesome
                    </span>
                    AI Assistant
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Work Experience & Projects */}
            {currentStep === 2 && (
              <div className="flex flex-col gap-6">
                {/* Work Experience Section */}
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-[18px] font-bold text-slate-900">
                        Work Experience
                      </h2>
                      <p className="text-[13px] text-slate-600">
                        Add professional roles with key accomplishments.
                      </p>
                    </div>
                    <button
                      type="button"
                      id="add-experience-btn"
                      onClick={handleAddExperience}
                      className="bg-indigo-50 text-indigo-700 font-bold text-[13px] px-3.5 py-1.5 rounded-full flex items-center gap-1 hover:bg-indigo-100 transition-colors shadow-2xs border border-indigo-200/60 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                      Add Role
                    </button>
                  </div>

                  {resume.experiences.map((exp, expIdx) => (
                    <div
                      key={exp.id}
                      className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 flex flex-col gap-3 relative"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[12px] font-bold font-mono text-indigo-700">
                          Role #{expIdx + 1}
                        </span>
                        {resume.experiences.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveExperience(exp.id)}
                            className="text-rose-600 hover:bg-rose-50 p-1 rounded-md text-[12px] flex items-center gap-1 font-semibold cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="m3-input-field">
                          <input
                            type="text"
                            placeholder=" "
                            value={exp.title}
                            onChange={(e) => {
                              const updated = [...resume.experiences];
                              updated[expIdx].title = e.target.value;
                              onChange({ ...resume, experiences: updated });
                            }}
                          />
                          <label>Job Title</label>
                        </div>

                        <div className="m3-input-field">
                          <input
                            type="text"
                            placeholder=" "
                            value={exp.company}
                            onChange={(e) => {
                              const updated = [...resume.experiences];
                              updated[expIdx].company = e.target.value;
                              onChange({ ...resume, experiences: updated });
                            }}
                          />
                          <label>Company</label>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="m3-input-field">
                          <input
                            type="text"
                            placeholder=" "
                            value={exp.startDate}
                            onChange={(e) => {
                              const updated = [...resume.experiences];
                              updated[expIdx].startDate = e.target.value;
                              onChange({ ...resume, experiences: updated });
                            }}
                          />
                          <label>Start Date</label>
                        </div>

                        <div className="m3-input-field">
                          <input
                            type="text"
                            placeholder=" "
                            value={exp.endDate}
                            onChange={(e) => {
                              const updated = [...resume.experiences];
                              updated[expIdx].endDate = e.target.value;
                              onChange({ ...resume, experiences: updated });
                            }}
                          />
                          <label>End Date</label>
                        </div>
                      </div>

                      {/* Experience Bullets */}
                      <div className="flex flex-col gap-2 mt-1">
                        <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                          Key Accomplishments & Bullets
                        </label>
                        {exp.bullets.map((bullet, bIdx) => (
                          <div key={bIdx} className="flex gap-2 items-center">
                            <span className="text-indigo-600 font-bold text-[14px]">•</span>
                            <div className="flex-1 m3-input-field">
                              <input
                                type="text"
                                placeholder="Accomplished [X] as measured by [Y] by doing [Z]"
                                value={bullet}
                                onChange={(e) => {
                                  const updated = [...resume.experiences];
                                  updated[expIdx].bullets[bIdx] = e.target.value;
                                  onChange({ ...resume, experiences: updated });
                                }}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleOpenBulletModal(exp.id, bIdx, bullet)}
                              title="Enhance bullet with AI"
                              className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold px-2.5 py-2 rounded-xl flex items-center gap-1 flex-shrink-0 transition-all active:scale-95 shadow-xs cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                auto_awesome
                              </span>
                              AI
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...resume.experiences];
                            updated[expIdx].bullets.push("");
                            onChange({ ...resume, experiences: updated });
                          }}
                          className="text-[12px] text-indigo-600 font-bold flex items-center gap-1 self-start mt-1 hover:underline cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">add</span>
                          Add bullet
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Projects Section */}
                <div className="flex flex-col gap-4 border-t border-slate-200 pt-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-[18px] font-bold text-slate-900">
                        Key Projects & Portfolios
                      </h2>
                      <p className="text-[13px] text-slate-600">
                        Highlight personal apps, open source contributions, or client deliverables.
                      </p>
                    </div>
                    <button
                      type="button"
                      id="add-project-btn"
                      onClick={handleAddProject}
                      className="bg-purple-50 text-purple-700 font-bold text-[13px] px-3.5 py-1.5 rounded-full flex items-center gap-1 hover:bg-purple-100 transition-colors shadow-2xs border border-purple-200/60 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                      Add Project
                    </button>
                  </div>

                  {(resume.projects || []).map((proj, pIdx) => (
                    <div
                      key={proj.id || pIdx}
                      className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 flex flex-col gap-3 relative"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[12px] font-bold font-mono text-purple-700">
                          Project #{pIdx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveProject(proj.id)}
                          className="text-rose-600 hover:bg-rose-50 p-1 rounded-md text-[12px] flex items-center gap-1 font-semibold cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="m3-input-field">
                          <input
                            type="text"
                            placeholder=" "
                            value={proj.title}
                            onChange={(e) => {
                              const updated = [...(resume.projects || [])];
                              updated[pIdx].title = e.target.value;
                              onChange({ ...resume, projects: updated });
                            }}
                          />
                          <label>Project Title / Name</label>
                        </div>

                        <div className="m3-input-field">
                          <input
                            type="url"
                            placeholder=" "
                            value={proj.link || ""}
                            onChange={(e) => {
                              const updated = [...(resume.projects || [])];
                              updated[pIdx].link = e.target.value;
                              onChange({ ...resume, projects: updated });
                            }}
                          />
                          <label>Project Link / GitHub URL</label>
                        </div>
                      </div>

                      <div className="m3-input-field relative">
                        <textarea
                          rows={2}
                          placeholder=" "
                          value={proj.description}
                          onChange={(e) => {
                            const updated = [...(resume.projects || [])];
                            updated[pIdx].description = e.target.value;
                            onChange({ ...resume, projects: updated });
                          }}
                        />
                        <label>Description & Tech Architecture</label>

                        <button
                          type="button"
                          onClick={() =>
                            setProjectModalData({
                              isOpen: true,
                              projectIndex: pIdx,
                              project: proj,
                            })
                          }
                          title="Improve project description with AI"
                          className="absolute bottom-2.5 right-2.5 bg-purple-600 hover:bg-purple-700 text-white px-2.5 py-1 rounded-full shadow-xs transition-all active:scale-95 flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            auto_awesome
                          </span>
                          AI Polish
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: Skills & Education */}
            {currentStep === 3 && (
              <div className="flex flex-col gap-5">
                <div>
                  <h2 className="text-[18px] font-bold text-slate-900">
                    Skills & Competencies
                  </h2>
                  <p className="text-[13px] text-slate-600">
                    High-relevance keywords indexed by modern ATS search filters.
                  </p>
                </div>

                {/* Skill input */}
                <div className="flex gap-2">
                  <div className="flex-1 m3-input-field">
                    <input
                      type="text"
                      placeholder="e.g. Kotlin Coroutines, Jetpack Compose, Hilt"
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSkill(newSkillInput);
                        }
                      }}
                    />
                    <label>Add Skill or Tech Keyword</label>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddSkill(newSkillInput)}
                    className="bg-indigo-600 text-white px-5 rounded-xl font-bold text-[13px] hover:bg-indigo-700 transition-colors shadow-xs"
                  >
                    Add
                  </button>
                </div>

                {/* Skill Chips */}
                <div className="flex flex-wrap gap-2">
                  {resume.skills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-indigo-50 text-indigo-900 border border-indigo-200 font-mono text-[12px] font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-2xs group"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-slate-400 hover:text-rose-600 flex items-center justify-center ml-0.5 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </span>
                  ))}
                </div>

                {/* Recommended Quick Chips */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  <span className="text-[11px] uppercase tracking-wider font-mono font-bold text-slate-500 block mb-2">
                    Popular keywords to add:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {["Kotlin Coroutines", "Jetpack Compose", "Hilt", "CI/CD", "Room DB", "MVVM", "Clean Architecture", "Unit Testing"].map(
                      (kw) => {
                        const hasSkill = resume.skills.includes(kw);
                        if (hasSkill) return null;
                        return (
                          <button
                            key={kw}
                            type="button"
                            onClick={() => handleAddSkill(kw)}
                            className="bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 text-indigo-700 text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 transition-all"
                          >
                            <span className="material-symbols-outlined text-[12px]">add</span>
                            {kw}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* Education section */}
                <div className="border-t border-slate-200 pt-4 mt-2">
                  <h3 className="text-[16px] font-bold text-slate-900 mb-3">
                    Education
                  </h3>
                  {resume.education.map((edu, idx) => (
                    <div key={edu.id || idx} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <div className="m3-input-field">
                        <input
                          type="text"
                          placeholder=" "
                          value={edu.degree}
                          onChange={(e) => {
                            const updated = [...resume.education];
                            updated[idx].degree = e.target.value;
                            onChange({ ...resume, education: updated });
                          }}
                        />
                        <label>Degree / Major</label>
                      </div>
                      <div className="m3-input-field">
                        <input
                          type="text"
                          placeholder=" "
                          value={edu.school}
                          onChange={(e) => {
                            const updated = [...resume.education];
                            updated[idx].school = e.target.value;
                            onChange({ ...resume, education: updated });
                          }}
                        />
                        <label>Institution / University</label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Actions & Demo Toggle */}
            <div className="flex items-center justify-between pt-5 mt-3 border-t border-slate-200">
              {/* Demo Mode Toggle */}
              <div className="flex items-center gap-2.5">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    id="demoToggle"
                    type="checkbox"
                    checked={isDemoMode}
                    onChange={handleDemoToggle}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
                </label>
                <label
                  htmlFor="demoToggle"
                  className="text-[13px] font-semibold text-slate-600 cursor-pointer select-none font-mono"
                >
                  Demo Mode
                </label>
              </div>

              <div className="flex items-center gap-2">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((s) => (s - 1) as 1 | 2 | 3)}
                    className="border border-slate-300 text-slate-700 hover:bg-slate-50 text-[13px] font-bold px-4 py-2.5 rounded-full transition-colors active:scale-95"
                  >
                    Back
                  </button>
                )}

                {currentStep < 3 ? (
                  <button
                    type="button"
                    id="next-step-btn"
                    onClick={() => setCurrentStep((s) => (s + 1) as 1 | 2 | 3)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-[14px] font-bold px-6 py-2.5 rounded-full shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    Next: {currentStep === 1 ? "Experience" : "Skills"}
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    id="run-analysis-btn"
                    onClick={() => onRunAnalysis(resume)}
                    className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-[14px] font-bold px-6 py-2.5 rounded-full shadow-lg shadow-indigo-500/25 flex items-center gap-1.5 transition-all active:scale-95 animate-pulse"
                  >
                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                    Run ATS Analysis
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live A4 Document Preview */}
        <div className="hidden lg:flex lg:w-5/12 flex-col">
          <div className="sticky top-20 bg-white rounded-2xl shadow-md border border-slate-200/80 overflow-hidden flex flex-col h-[calc(100vh-6rem)]">
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex flex-wrap justify-between items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600 text-[18px]">
                  visibility
                </span>
                <span className="text-[12px] font-bold text-slate-700 uppercase tracking-wider font-mono">
                  Live Preview
                </span>
              </div>

              {/* Template Selector & Export PDF Action */}
              <div className="flex items-center gap-2">
                <select
                  id="template-select-dropdown"
                  value={resume.selectedTemplate || "modern"}
                  onChange={(e) => onChange({ ...resume, selectedTemplate: e.target.value })}
                  className="text-[11.5px] font-mono font-semibold bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 outline-hidden hover:border-indigo-400 cursor-pointer"
                >
                  <option value="modern">Modern (Default)</option>
                  <option value="classic">Classic / Serif</option>
                  <option value="minimal">Minimalist</option>
                  <option value="executive">Executive / Two-Col</option>
                </select>

                {onExportPdf && (
                  <button
                    type="button"
                    id="builder-export-pdf-btn"
                    disabled={isExportingPdf}
                    onClick={() => onExportPdf(resume)}
                    className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-3 py-1 rounded-lg text-[11.5px] font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    {isExportingPdf ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="material-symbols-outlined text-[14px]">picture_as_pdf</span>
                    )}
                    <span>{isExportingPdf ? "Exporting..." : "Export PDF"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Simulated A4 Document Content */}
            <div className="flex-grow overflow-y-auto bg-slate-100 p-4 flex justify-center">
              <div className="w-full max-w-[700px] shadow-sm rounded-lg overflow-hidden bg-white">
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
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-full shadow-lg shadow-indigo-500/25 flex items-center gap-2 text-[13px] font-bold active:scale-95"
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
                      className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[12px] font-bold flex items-center gap-1 shadow-xs"
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
                    className="p-1 rounded-full hover:bg-slate-200"
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
        onApply={(improvedDescription, bullets) => {
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
