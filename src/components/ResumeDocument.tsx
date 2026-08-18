import React from "react";
import { Resume } from "../types";

export interface ResumeDocumentProps {
  resume: Resume;
  template?: string; // "modern" | "classic" | "minimal" | "executive"
  className?: string;
  isPrintMode?: boolean;
}

export const ResumeDocument: React.FC<ResumeDocumentProps> = ({
  resume,
  template = resume.selectedTemplate || "modern",
  className = "",
  isPrintMode = false,
}) => {
  const { personal, experiences = [], education = [], skills = [], projects = [], certifications = [], achievements = [] } = resume;
  const fullName = `${personal?.firstName || ""} ${personal?.lastName || ""}`.trim() || "Candidate Name";
  const targetRole = resume.targetRole || "Software Professional";

  // Template 1: CLASSIC (Serif headings, traditional horizontal bars, centered formal structure)
  if (template === "classic") {
    return (
      <div
        id="resume-document-root"
        className={`bg-white text-slate-900 font-serif leading-normal p-8 sm:p-10 ${className}`}
        style={{ boxSizing: "border-box" }}
      >
        {/* Header */}
        <header data-page-item className="text-center border-b-2 border-slate-800 pb-4 mb-5">
          <h1 className="text-[26px] sm:text-[28px] font-bold text-slate-900 tracking-wide uppercase font-serif">
            {fullName}
          </h1>
          <p className="text-[14px] font-semibold text-slate-700 italic mt-0.5">
            {targetRole}
          </p>

          <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-[12px] text-slate-700 mt-2 font-sans">
            {personal?.email && <span>{personal.email}</span>}
            {personal?.phone && <span>• {personal.phone}</span>}
            {personal?.location && <span>• {personal.location}</span>}
            {personal?.linkedin && <span>• {personal.linkedin.replace(/^https?:\/\//, "")}</span>}
            {personal?.github && <span>• {personal.github.replace(/^https?:\/\//, "")}</span>}
            {personal?.portfolio && <span>• {personal.portfolio.replace(/^https?:\/\//, "")}</span>}
          </div>
        </header>

        {/* Professional Summary */}
        {personal?.summary && (
          <section data-page-item className="mb-5">
            <h2 className="text-[13px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-400 pb-1 mb-2 font-sans">
              Professional Summary
            </h2>
            <p className="text-[13px] text-slate-800 text-justify leading-relaxed font-sans">
              {personal.summary}
            </p>
          </section>
        )}

        {/* Work Experience */}
        {experiences.length > 0 && (
          <section className="mb-5">
            <h2 data-page-item className="text-[13px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-400 pb-1 mb-3 font-sans">
              Work Experience
            </h2>
            <div className="flex flex-col gap-4 font-sans">
              {experiences.map((exp) => (
                <div key={exp.id} data-page-item className="text-[13px]">
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span className="text-[14px]">{exp.title || "Job Title"}</span>
                    <span className="text-[12px] font-normal text-slate-600">
                      {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-700 italic text-[12px] mb-1.5">
                    <span>{exp.company}</span>
                    <span>{exp.location}</span>
                  </div>
                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul className="list-disc list-outside ml-4 space-y-1 text-slate-800 text-[12.5px] leading-snug">
                      {exp.bullets.map((bullet, idx) => (
                        <li key={idx}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <section className="mb-5 font-sans">
            <h2 data-page-item className="text-[13px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-400 pb-1 mb-2.5">
              Education
            </h2>
            <div className="flex flex-col gap-2.5">
              {education.map((edu) => (
                <div key={edu.id} data-page-item className="flex justify-between items-baseline text-[13px]">
                  <div>
                    <span className="font-bold text-slate-900">{edu.degree}</span>
                    <span className="text-slate-700">, {edu.school}</span>
                    {edu.location && <span className="text-slate-500 text-[12px]"> — {edu.location}</span>}
                  </div>
                  <span className="text-[12px] text-slate-600 font-medium">{edu.year}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects (if available) */}
        {projects.length > 0 && (
          <section className="mb-5 font-sans">
            <h2 data-page-item className="text-[13px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-400 pb-1 mb-3">
              Key Projects
            </h2>
            <div className="flex flex-col gap-3">
              {projects.map((proj) => (
                <div key={proj.id} data-page-item className="text-[13px]">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-900">{proj.title}</span>
                    {proj.link && <span className="text-[11px] text-slate-600">{proj.link}</span>}
                  </div>
                  <p className="text-slate-700 mt-0.5 text-[12.5px] leading-relaxed">{proj.description}</p>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <p className="text-[11.5px] text-slate-600 italic mt-0.5 font-mono">
                      Tech: {proj.technologies.join(", ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <section data-page-item className="mb-4 font-sans">
            <h2 className="text-[13px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-400 pb-1 mb-2">
              Skills & Competencies
            </h2>
            <p className="text-[12.5px] text-slate-800 leading-relaxed">
              {skills.join(" • ")}
            </p>
          </section>
        )}

        {/* Certifications & Achievements */}
        {(certifications.length > 0 || achievements.length > 0) && (
          <section data-page-item className="font-sans">
            <h2 className="text-[13px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-400 pb-1 mb-2">
              Certifications & Honors
            </h2>
            <ul className="list-disc list-outside ml-4 text-[12.5px] text-slate-800 space-y-1">
              {certifications.map((c, i) => <li key={`cert-${i}`}>{c}</li>)}
              {achievements.map((a, i) => <li key={`ach-${i}`}>{a}</li>)}
            </ul>
          </section>
        )}
      </div>
    );
  }

  // Template 2: MINIMAL (Crisp monochrome, generous spacing, clean line breaks, modern sans-serif)
  if (template === "minimal") {
    return (
      <div
        id="resume-document-root"
        className={`bg-white text-slate-900 font-sans leading-normal p-8 sm:p-10 ${className}`}
        style={{ boxSizing: "border-box" }}
      >
        {/* Header */}
        <header data-page-item className="mb-6">
          <h1 className="text-[26px] font-bold tracking-tight text-slate-950">
            {fullName}
          </h1>
          <p className="text-[14px] font-medium text-slate-600 mt-0.5">
            {targetRole}
          </p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-slate-500 mt-2 font-mono">
            {personal?.email && <span>{personal.email}</span>}
            {personal?.phone && <span>/ {personal.phone}</span>}
            {personal?.location && <span>/ {personal.location}</span>}
            {personal?.linkedin && <span>/ {personal.linkedin.replace(/^https?:\/\//, "")}</span>}
            {personal?.github && <span>/ {personal.github.replace(/^https?:\/\//, "")}</span>}
          </div>
          <div className="w-full h-[1px] bg-slate-200 mt-4" />
        </header>

        {/* Summary */}
        {personal?.summary && (
          <section data-page-item className="mb-6">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 font-mono">
              About
            </h2>
            <p className="text-[13px] text-slate-700 leading-relaxed">
              {personal.summary}
            </p>
          </section>
        )}

        {/* Experience */}
        {experiences.length > 0 && (
          <section className="mb-6">
            <h2 data-page-item className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3 font-mono">
              Experience
            </h2>
            <div className="flex flex-col gap-4">
              {experiences.map((exp) => (
                <div key={exp.id} data-page-item className="text-[13px]">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-900">{exp.title || "Role Title"}</span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {exp.startDate} — {exp.current ? "Present" : exp.endDate}
                    </span>
                  </div>
                  <div className="text-[12px] text-slate-600 font-medium mb-1">
                    {exp.company} • {exp.location}
                  </div>
                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul className="space-y-1 text-slate-700 text-[12.5px] leading-snug">
                      {exp.bullets.map((bullet, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-slate-400 mt-1 text-[8px]">▪</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <section className="mb-6">
            <h2 data-page-item className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2.5 font-mono">
              Education
            </h2>
            <div className="flex flex-col gap-2">
              {education.map((edu) => (
                <div key={edu.id} data-page-item className="flex justify-between items-baseline text-[13px]">
                  <div>
                    <span className="font-semibold text-slate-900">{edu.degree}</span>
                    <span className="text-slate-600"> — {edu.school}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">{edu.year}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section className="mb-6">
            <h2 data-page-item className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2.5 font-mono">
              Projects
            </h2>
            <div className="flex flex-col gap-3">
              {projects.map((proj) => (
                <div key={proj.id} data-page-item className="text-[13px]">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-slate-900">{proj.title}</span>
                    {proj.link && <span className="text-[11px] text-slate-500 font-mono">{proj.link}</span>}
                  </div>
                  <p className="text-slate-600 text-[12.5px] mt-0.5 leading-relaxed">{proj.description}</p>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      Stack: {proj.technologies.join(", ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <section data-page-item className="mb-4">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2 font-mono">
              Skills
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded text-[11.5px] font-mono"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Certifications & Achievements */}
        {(certifications.length > 0 || achievements.length > 0) && (
          <section data-page-item className="mb-4">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2 font-mono">
              Honors & Certifications
            </h2>
            <ul className="text-slate-700 text-[12.5px] space-y-1">
              {certifications.map((c, i) => (
                <li key={`cert-${i}`} className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1 text-[8px]">▪</span>
                  <span>{c}</span>
                </li>
              ))}
              {achievements.map((a, i) => (
                <li key={`ach-${i}`} className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1 text-[8px]">▪</span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    );
  }

  // Template 3: EXECUTIVE / TECH (Sidebar layout for contact, skills, education + main body for experiences)
  if (template === "executive") {
    return (
      <div
        id="resume-document-root"
        className={`bg-white text-slate-900 font-sans leading-normal ${className}`}
        style={{ boxSizing: "border-box" }}
      >
        <div className="flex flex-row min-h-full">
          {/* Left Column Sidebar */}
          <div className="w-[32%] bg-slate-900 text-slate-100 p-6 flex flex-col gap-5 text-[12px]">
            {/* Name in Sidebar */}
            <div data-page-item>
              <h1 className="text-[20px] font-extrabold text-white leading-tight">
                {fullName}
              </h1>
              <p className="text-[12px] font-semibold text-indigo-400 mt-1">
                {targetRole}
              </p>
            </div>

            {/* Contact */}
            <div data-page-item className="flex flex-col gap-2 text-slate-300">
              <h3 className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider font-mono border-b border-slate-700 pb-1">
                Contact
              </h3>
              {personal?.email && <div className="break-all">{personal.email}</div>}
              {personal?.phone && <div>{personal.phone}</div>}
              {personal?.location && <div>{personal.location}</div>}
              {personal?.linkedin && <div className="break-all">{personal.linkedin.replace(/^https?:\/\//, "")}</div>}
              {personal?.github && <div className="break-all">{personal.github.replace(/^https?:\/\//, "")}</div>}
            </div>

            {/* Skills */}
            {skills.length > 0 && (
              <div data-page-item className="flex flex-col gap-2">
                <h3 className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider font-mono border-b border-slate-700 pb-1">
                  Skills
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded text-[11px] font-mono border border-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {education.length > 0 && (
              <div data-page-item className="flex flex-col gap-2.5">
                <h3 className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider font-mono border-b border-slate-700 pb-1">
                  Education
                </h3>
                {education.map((edu) => (
                  <div key={edu.id} className="text-[11.5px]">
                    <div className="font-bold text-white">{edu.degree}</div>
                    <div className="text-slate-400">{edu.school}</div>
                    <div className="text-indigo-400 font-mono text-[10.5px]">{edu.year}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Certifications in sidebar if available */}
            {certifications.length > 0 && (
              <div data-page-item className="flex flex-col gap-2">
                <h3 className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider font-mono border-b border-slate-700 pb-1">
                  Certifications
                </h3>
                <ul className="text-slate-300 text-[11px] space-y-1">
                  {certifications.map((c, i) => (
                    <li key={`cert-exec-${i}`}>• {c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column Content */}
          <div className="w-[68%] p-6 flex flex-col gap-5 text-slate-800">
            {/* Summary */}
            {personal?.summary && (
              <section data-page-item>
                <h2 className="text-[13px] font-bold text-slate-900 uppercase tracking-wider border-b-2 border-indigo-600 pb-1 mb-2 font-mono">
                  Executive Summary
                </h2>
                <p className="text-[12.5px] text-slate-700 leading-relaxed">
                  {personal.summary}
                </p>
              </section>
            )}

            {/* Work Experience */}
            {experiences.length > 0 && (
              <section className="flex flex-col gap-4">
                <h2 data-page-item className="text-[13px] font-bold text-slate-900 uppercase tracking-wider border-b-2 border-indigo-600 pb-1 mb-1 font-mono">
                  Work Experience
                </h2>
                {experiences.map((exp) => (
                  <div key={exp.id} data-page-item className="text-[12.5px]">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-slate-900 text-[13px]">{exp.title}</span>
                      <span className="text-[11px] font-mono text-slate-500">
                        {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                      </span>
                    </div>
                    <div className="text-[12px] font-semibold text-indigo-700 mb-1">
                      {exp.company} • {exp.location}
                    </div>
                    {exp.bullets && exp.bullets.length > 0 && (
                      <ul className="list-disc list-outside ml-4 space-y-1 text-slate-700 leading-snug">
                        {exp.bullets.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </section>
            )}

            {/* Key Projects */}
            {projects.length > 0 && (
              <section className="flex flex-col gap-3">
                <h2 data-page-item className="text-[13px] font-bold text-slate-900 uppercase tracking-wider border-b-2 border-indigo-600 pb-1 mb-1 font-mono">
                  Key Projects
                </h2>
                {projects.map((proj) => (
                  <div key={proj.id} data-page-item className="text-[12px]">
                    <div className="font-bold text-slate-900">{proj.title}</div>
                    <p className="text-slate-700 leading-relaxed">{proj.description}</p>
                    {proj.technologies && (
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Stack: {proj.technologies.join(", ")}
                      </div>
                    )}
                  </div>
                ))}
              </section>
            )}

            {/* Achievements */}
            {achievements.length > 0 && (
              <section className="flex flex-col gap-2">
                <h2 data-page-item className="text-[13px] font-bold text-slate-900 uppercase tracking-wider border-b-2 border-indigo-600 pb-1 mb-1 font-mono">
                  Key Achievements & Honors
                </h2>
                <ul className="list-disc list-outside ml-4 space-y-1 text-slate-700 text-[12px]">
                  {achievements.map((a, i) => (
                    <li key={`ach-exec-${i}`}>{a}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Template 4: MODERN (DEFAULT - Sleek Indigo branding, clean dividers, highest ATS compliance)
  return (
    <div
      id="resume-document-root"
      className={`bg-white text-slate-900 font-sans leading-normal p-7 sm:p-9 ${className}`}
      style={{ boxSizing: "border-box" }}
    >
      {/* Header */}
      <header data-page-item className="border-b-2 border-indigo-100 pb-4 text-center">
        <h1 className="text-[24px] sm:text-[26px] font-extrabold text-indigo-950 tracking-tight mb-0.5">
          {fullName}
        </h1>
        <p className="text-[13px] font-bold text-indigo-600 mb-2 font-mono">
          {targetRole}
        </p>

        <div className="flex justify-center items-center gap-x-3 gap-y-1 text-[12px] text-slate-600 flex-wrap font-mono">
          {personal?.email && (
            <span className="flex items-center gap-1">
              <span>✉</span>
              {personal.email}
            </span>
          )}
          {personal?.phone && (
            <span className="flex items-center gap-1">
              <span>☎</span>
              {personal.phone}
            </span>
          )}
          {personal?.location && (
            <span className="flex items-center gap-1">
              <span>📍</span>
              {personal.location}
            </span>
          )}
          {personal?.linkedin && (
            <span className="flex items-center gap-1">
              <span>🔗</span>
              {personal.linkedin.replace(/^https?:\/\//, "")}
            </span>
          )}
          {personal?.github && (
            <span className="flex items-center gap-1">
              <span>⌨</span>
              {personal.github.replace(/^https?:\/\//, "")}
            </span>
          )}
          {personal?.portfolio && (
            <span className="flex items-center gap-1">
              <span>🌐</span>
              {personal.portfolio.replace(/^https?:\/\//, "")}
            </span>
          )}
        </div>
      </header>

      {/* Professional Summary */}
      {personal?.summary && (
        <section data-page-item className="mt-4">
          <h2 className="text-[12px] font-bold text-indigo-900 uppercase tracking-wider mb-1 font-mono border-b border-slate-100 pb-0.5">
            Professional Summary
          </h2>
          <p className="text-[13px] text-slate-800 leading-relaxed text-justify">
            {personal.summary}
          </p>
        </section>
      )}

      {/* Work Experience */}
      {experiences.length > 0 && (
        <section className="mt-4">
          <h2 data-page-item className="text-[12px] font-bold text-indigo-900 uppercase tracking-wider mb-2.5 font-mono border-b border-slate-100 pb-0.5">
            Work Experience
          </h2>
          <div className="flex flex-col gap-3.5">
            {experiences.map((exp) => (
              <div key={exp.id} data-page-item>
                <div className="flex justify-between items-baseline">
                  <span className="text-[13.5px] font-bold text-slate-900">
                    {exp.title || "Job Title"}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                  </span>
                </div>
                <span className="text-[12px] text-indigo-700 font-semibold block mb-1">
                  {exp.company} • {exp.location}
                </span>
                {exp.bullets && exp.bullets.length > 0 && (
                  <ul className="list-disc list-outside ml-4 mt-1 text-[12px] text-slate-700 space-y-0.5">
                    {exp.bullets.map((b, i) => (
                      <li key={i} className="leading-snug">
                        {b || "Core role responsibilities and results."}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className="mt-4">
          <h2 data-page-item className="text-[12px] font-bold text-indigo-900 uppercase tracking-wider mb-2 font-mono border-b border-slate-100 pb-0.5">
            Education
          </h2>
          <div className="flex flex-col gap-2">
            {education.map((edu) => (
              <div key={edu.id} data-page-item className="flex justify-between items-baseline text-[12.5px]">
                <div>
                  <span className="font-bold text-slate-900">{edu.degree}</span>
                  <span className="text-slate-600"> — {edu.school}</span>
                  {edu.location && <span className="text-slate-400 text-[11.5px]">, {edu.location}</span>}
                </div>
                <span className="text-[11.5px] text-slate-500 font-mono">{edu.year}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="mt-4">
          <h2 data-page-item className="text-[12px] font-bold text-indigo-900 uppercase tracking-wider mb-2 font-mono border-b border-slate-100 pb-0.5">
            Projects
          </h2>
          <div className="flex flex-col gap-2.5">
            {projects.map((proj) => (
              <div key={proj.id} data-page-item className="text-[12.5px]">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-slate-900">{proj.title}</span>
                  {proj.link && <span className="text-[11px] text-indigo-600 font-mono">{proj.link}</span>}
                </div>
                <p className="text-slate-700 leading-snug text-[12px] mt-0.5">{proj.description}</p>
                {proj.technologies && proj.technologies.length > 0 && (
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Stack: {proj.technologies.join(" • ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section data-page-item className="mt-4">
          <h2 className="text-[12px] font-bold text-indigo-900 uppercase tracking-wider mb-1.5 font-mono border-b border-slate-100 pb-0.5">
            Technical Skills
          </h2>
          <p className="text-[12px] text-slate-800 leading-relaxed font-mono font-medium">
            {skills.join(" • ")}
          </p>
        </section>
      )}

      {/* Certifications & Achievements */}
      {(certifications.length > 0 || achievements.length > 0) && (
        <section data-page-item className="mt-4">
          <h2 className="text-[12px] font-bold text-indigo-900 uppercase tracking-wider mb-1.5 font-mono border-b border-slate-100 pb-0.5">
            Certifications & Highlights
          </h2>
          <ul className="list-disc list-outside ml-4 text-[12px] text-slate-700 space-y-0.5">
            {certifications.map((c, i) => <li key={`cert-${i}`}>{c}</li>)}
            {achievements.map((a, i) => <li key={`ach-${i}`}>{a}</li>)}
          </ul>
        </section>
      )}
    </div>
  );
};
