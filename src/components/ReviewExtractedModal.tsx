import React, { useState } from "react";
import { Resume, ResumeClassification, SUPPORTED_INDUSTRIES, SUPPORTED_LANGUAGES, WorkExperience, EducationItem } from "../types";
import { Check, Edit3, Sparkles, X, Plus, Trash2, Globe, Briefcase, Award, GraduationCap, FileText, User } from "lucide-react";

interface ReviewExtractedModalProps {
  isOpen: boolean;
  onClose: () => void;
  extractedResume: Partial<Resume>;
  onConfirm: (finalResume: Resume) => void;
}

export const ReviewExtractedModal: React.FC<ReviewExtractedModalProps> = ({
  isOpen,
  onClose,
  extractedResume,
  onConfirm,
}) => {
  if (!isOpen) return null;

  const [classification, setClassification] = useState<ResumeClassification>(
    extractedResume.classification || {
      language: extractedResume.preferredLanguage || "English",
      industry: "Education / Teaching",
      profession: extractedResume.targetRole || "Educator / Teacher",
      roleLevel: "Experienced",
      confidence: 0.9,
    }
  );

  const [targetRole, setTargetRole] = useState(extractedResume.targetRole || classification.profession || "Professional");
  const [preferredLanguage, setPreferredLanguage] = useState(
    extractedResume.preferredLanguage || classification.language || "English"
  );

  // Personal Info
  const [personal, setPersonal] = useState({
    firstName: extractedResume.personal?.firstName || "",
    lastName: extractedResume.personal?.lastName || "",
    email: extractedResume.personal?.email || "",
    phone: extractedResume.personal?.phone || "",
    location: extractedResume.personal?.location || "",
    summary: extractedResume.personal?.summary || "",
  });

  // Experiences
  const [experiences, setExperiences] = useState<WorkExperience[]>(
    Array.isArray(extractedResume.experiences) ? extractedResume.experiences : []
  );

  // Education
  const [education, setEducation] = useState<EducationItem[]>(
    Array.isArray(extractedResume.education) ? extractedResume.education : []
  );

  // Skills
  const [skills, setSkills] = useState<string[]>(
    Array.isArray(extractedResume.skills) ? extractedResume.skills : []
  );
  const [newSkillInput, setNewSkillInput] = useState("");

  // Certifications
  const [certifications, setCertifications] = useState<string[]>(
    Array.isArray(extractedResume.certifications) ? extractedResume.certifications : []
  );
  const [newCertInput, setNewCertInput] = useState("");

  // Languages
  const [languages, setLanguages] = useState<string[]>(
    Array.isArray(extractedResume.languages)
      ? extractedResume.languages
      : [classification.language || "English"]
  );
  const [newLangInput, setNewLangInput] = useState("");

  const handleAddSkill = () => {
    if (!newSkillInput.trim()) return;
    setSkills([...skills, newSkillInput.trim()]);
    setNewSkillInput("");
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleAddCert = () => {
    if (!newCertInput.trim()) return;
    setCertifications([...certifications, newCertInput.trim()]);
    setNewCertInput("");
  };

  const handleRemoveCert = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const handleAddLang = () => {
    if (!newLangInput.trim()) return;
    setLanguages([...languages, newLangInput.trim()]);
    setNewLangInput("");
  };

  const handleRemoveLang = (index: number) => {
    setLanguages(languages.filter((_, i) => i !== index));
  };

  const handleUpdateExperience = (index: number, field: keyof WorkExperience, value: any) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    setExperiences(updated);
  };

  const handleRemoveExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const handleUpdateEducation = (index: number, field: keyof EducationItem, value: any) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    setEducation(updated);
  };

  const handleRemoveEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const handleSaveAndUse = () => {
    const updatedClassification: ResumeClassification = {
      ...classification,
      profession: targetRole,
      language: preferredLanguage,
    };

    const finalResume: Resume = {
      id: extractedResume.id || "res-upload-" + Date.now(),
      title: `${targetRole} Resume`,
      targetRole: targetRole || "Professional",
      lastEdited: "Just now",
      updatedAt: Date.now(),
      createdAt: Date.now(),
      atsScore: extractedResume.atsScore || 82,
      selectedTemplate: extractedResume.selectedTemplate || "classic",
      preferredLanguage: preferredLanguage,
      classification: updatedClassification,
      personal,
      experiences,
      education,
      skills,
      certifications,
      achievements: extractedResume.achievements || [],
      languages,
    };

    onConfirm(finalResume);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl p-5 sm:p-7 shadow-2xl border border-slate-200/80 flex flex-col gap-5 max-h-[92vh] overflow-y-auto animate-scale-up my-auto">
        {/* Header */}
        <div className="flex justify-between items-start pb-3 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-700 border border-indigo-100">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-[19px] font-bold text-slate-900">
                Review Extracted Resume
              </h2>
            </div>
            <p className="text-[12px] text-slate-500 mt-1">
              Verify and edit the extracted details before populating your builder. Missing fields are kept clean without invented information.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Classification & Intelligence Banner */}
        <div className="p-4 bg-gradient-to-r from-indigo-50/80 via-blue-50/50 to-slate-50 border border-indigo-100 rounded-2xl flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              <span className="text-[12px] font-bold text-indigo-950 uppercase tracking-wider">
                Detected Domain & Intelligence
              </span>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
              AI Confidence: {Math.round((classification.confidence || 0.9) * 100)}%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Industry Selector */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-600">Industry / Sector</label>
              <select
                value={classification.industry}
                onChange={(e) => setClassification({ ...classification, industry: e.target.value })}
                className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-[12px] text-slate-800 font-medium outline-hidden focus:border-indigo-600"
              >
                {SUPPORTED_INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Role */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-600">Target Role / Profession</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. PGT Hindi Teacher"
                className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-[12px] text-slate-800 font-medium outline-hidden focus:border-indigo-600"
              />
            </div>

            {/* Preferred AI Language */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-600">AI Suggestion Language</label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-[12px] text-slate-800 font-medium outline-hidden focus:border-indigo-600"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.label.split(" ")[0]}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 1: Personal Info */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-[14px]">
            <User className="w-4 h-4 text-indigo-600" />
            <h3>Personal Information</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="m3-input-field">
              <input
                type="text"
                placeholder=" "
                value={personal.firstName}
                onChange={(e) => setPersonal({ ...personal, firstName: e.target.value })}
              />
              <label>First Name</label>
            </div>
            <div className="m3-input-field">
              <input
                type="text"
                placeholder=" "
                value={personal.lastName}
                onChange={(e) => setPersonal({ ...personal, lastName: e.target.value })}
              />
              <label>Last Name</label>
            </div>
            <div className="m3-input-field">
              <input
                type="email"
                placeholder=" "
                value={personal.email}
                onChange={(e) => setPersonal({ ...personal, email: e.target.value })}
              />
              <label>Email Address</label>
            </div>
            <div className="m3-input-field">
              <input
                type="text"
                placeholder=" "
                value={personal.phone}
                onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
              />
              <label>Phone Number</label>
            </div>
            <div className="m3-input-field sm:col-span-2">
              <input
                type="text"
                placeholder=" "
                value={personal.location}
                onChange={(e) => setPersonal({ ...personal, location: e.target.value })}
              />
              <label>Location (e.g. New Delhi, India)</label>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-bold text-slate-600">Professional Summary</label>
            <textarea
              rows={3}
              value={personal.summary}
              onChange={(e) => setPersonal({ ...personal, summary: e.target.value })}
              placeholder="Summary of experience, teaching/clinical/financial background..."
              className="bg-slate-50 border border-slate-300 rounded-2xl p-3 text-[13px] text-slate-900 outline-hidden focus:border-indigo-600 focus:bg-white"
            />
          </div>
        </div>

        {/* Section 2: Experience */}
        <div className="flex flex-col gap-3 pt-2 border-t border-slate-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-[14px]">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              <h3>Work / Professional Experience ({experiences.length})</h3>
            </div>
          </div>

          {experiences.length === 0 ? (
            <p className="text-[12px] text-slate-400 italic">No experience found in document (or entry-level profile).</p>
          ) : (
            <div className="flex flex-col gap-3">
              {experiences.map((exp, idx) => (
                <div key={exp.id || idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col gap-2 relative">
                  <button
                    type="button"
                    onClick={() => handleRemoveExperience(idx)}
                    className="absolute top-3 right-3 text-slate-400 hover:text-red-600 p-1 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-6">
                    <input
                      type="text"
                      value={exp.title}
                      onChange={(e) => handleUpdateExperience(idx, "title", e.target.value)}
                      placeholder="Title (e.g. PGT Hindi Teacher)"
                      className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-[12px] font-bold text-slate-900"
                    />
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => handleUpdateExperience(idx, "company", e.target.value)}
                      placeholder="Institution / Employer"
                      className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-[12px] font-medium text-slate-900"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={exp.startDate}
                      onChange={(e) => handleUpdateExperience(idx, "startDate", e.target.value)}
                      placeholder="Start (e.g. 2020)"
                      className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-[12px] text-slate-700"
                    />
                    <input
                      type="text"
                      value={exp.endDate}
                      onChange={(e) => handleUpdateExperience(idx, "endDate", e.target.value)}
                      placeholder="End (or Present)"
                      className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-[12px] text-slate-700"
                    />
                  </div>
                  {exp.bullets && exp.bullets.length > 0 && (
                    <div className="text-[12px] text-slate-600 space-y-1 mt-1 pl-2 border-l-2 border-indigo-200">
                      {exp.bullets.map((b, bIdx) => (
                        <p key={bIdx}>• {b}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 3: Education */}
        <div className="flex flex-col gap-3 pt-2 border-t border-slate-200">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-[14px]">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <h3>Education & Degrees ({education.length})</h3>
          </div>
          {education.length === 0 ? (
            <p className="text-[12px] text-slate-400 italic">No education entries found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {education.map((edu, idx) => (
                <div key={edu.id || idx} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col gap-1 relative">
                  <button
                    type="button"
                    onClick={() => handleRemoveEducation(idx)}
                    className="absolute top-2 right-2 text-slate-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => handleUpdateEducation(idx, "degree", e.target.value)}
                    placeholder="Degree (e.g. M.A., B.Ed., B.Com)"
                    className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-[12px] font-bold text-slate-900"
                  />
                  <input
                    type="text"
                    value={edu.school}
                    onChange={(e) => handleUpdateEducation(idx, "school", e.target.value)}
                    placeholder="School / University"
                    className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-[11px] text-slate-700"
                  />
                  <input
                    type="text"
                    value={edu.year}
                    onChange={(e) => handleUpdateEducation(idx, "year", e.target.value)}
                    placeholder="Year (e.g. 2018)"
                    className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-[11px] text-slate-600 w-24"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 4: Skills & Certifications */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
          {/* Skills */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-[13px]">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>Skills ({skills.length})</span>
            </div>
            <div className="flex flex-wrap gap-1.5 min-h-[40px] p-2 bg-slate-50 border border-slate-200 rounded-2xl">
              {skills.map((skill, sIdx) => (
                <span
                  key={sIdx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-slate-300 text-[11px] font-semibold text-slate-800"
                >
                  {skill}
                  <button type="button" onClick={() => handleRemoveSkill(sIdx)} className="text-slate-400 hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                placeholder="Add skill..."
                className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-[12px] flex-1 outline-hidden focus:border-indigo-600"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[12px] font-bold"
              >
                Add
              </button>
            </div>
          </div>

          {/* Certifications & Languages */}
          <div className="flex flex-col gap-3">
            {/* Certifications */}
            <div className="flex flex-col gap-2">
              <span className="text-[13px] font-bold text-slate-800">Certifications & Licenses</span>
              <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 bg-slate-50 border border-slate-200 rounded-2xl">
                {certifications.map((cert, cIdx) => (
                  <span
                    key={cIdx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-800"
                  >
                    {cert}
                    <button type="button" onClick={() => handleRemoveCert(cIdx)} className="text-emerald-500 hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={newCertInput}
                  onChange={(e) => setNewCertInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCert())}
                  placeholder="e.g. CTET, BLS, Tally Certified..."
                  className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-[12px] flex-1 outline-hidden focus:border-indigo-600"
                />
                <button
                  type="button"
                  onClick={handleAddCert}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[12px] font-bold"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Languages */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1 text-[13px] font-bold text-slate-800">
                <Globe className="w-3.5 h-3.5 text-indigo-600" />
                <span>Languages</span>
              </div>
              <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-2xl">
                {languages.map((lang, lIdx) => (
                  <span
                    key={lIdx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-[11px] font-semibold text-indigo-800"
                  >
                    {lang}
                    <button type="button" onClick={() => handleRemoveLang(lIdx)} className="text-indigo-400 hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={newLangInput}
                  onChange={(e) => setNewLangInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddLang())}
                  placeholder="e.g. Hindi, English, Bengali..."
                  className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-[12px] flex-1 outline-hidden focus:border-indigo-600"
                />
                <button
                  type="button"
                  onClick={handleAddLang}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[12px] font-bold"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full border border-slate-300 text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveAndUse}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-7 py-2.5 rounded-full text-[13px] font-bold shadow-md shadow-indigo-500/20 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            Use This Information in Builder
          </button>
        </div>
      </div>
    </div>
  );
};
