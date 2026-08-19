import React from "react";
import { Resume } from "../types";

interface ResumeMiniPreviewProps {
  resume: Resume;
  className?: string;
}

export const ResumeMiniPreview: React.FC<ResumeMiniPreviewProps> = ({
  resume,
  className = "",
}) => {
  const template = resume.selectedTemplate || "modern";
  const name = `${resume.personal?.firstName || ""} ${resume.personal?.lastName || ""}`.trim() || "Candidate";
  const role = resume.targetRole || "Professional";
  const experienceCount = resume.experiences?.length || 1;
  const skills = resume.skills?.slice(0, 4) || [];

  return (
    <div
      className={`relative w-24 sm:w-28 aspect-[1/1.38] bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col p-2 select-none pointer-events-none shrink-0 ${className}`}
      style={{ boxSizing: "border-box" }}
    >
      {/* Modern Template Style */}
      {template === "modern" && (
        <div className="w-full h-full flex flex-col justify-between">
          <div className="border-l-2 border-indigo-600 pl-1.5 mb-1.5">
            <div className="text-[7.5px] font-extrabold text-slate-900 leading-tight truncate">
              {name}
            </div>
            <div className="text-[5.5px] font-bold text-indigo-600 leading-none truncate">
              {role}
            </div>
          </div>

          <div className="flex flex-col gap-1 my-auto">
            <div className="h-1 bg-slate-200 rounded-full w-4/5" />
            <div className="h-0.5 bg-slate-100 rounded-full w-full" />
            <div className="h-0.5 bg-slate-100 rounded-full w-3/4" />
            <div className="h-1 bg-indigo-100 rounded-full w-1/2 mt-1" />
            <div className="h-0.5 bg-slate-100 rounded-full w-full" />
            <div className="h-0.5 bg-slate-100 rounded-full w-5/6" />
          </div>

          <div className="flex flex-wrap gap-0.5 pt-1 border-t border-slate-100">
            {skills.slice(0, 3).map((s, i) => (
              <span
                key={i}
                className="text-[4.5px] font-mono bg-indigo-50 text-indigo-700 px-1 py-0.2 rounded-xs leading-none truncate max-w-[32px]"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Classic Template Style */}
      {template === "classic" && (
        <div className="w-full h-full flex flex-col justify-between font-serif">
          <div className="text-center border-b border-slate-800 pb-1 mb-1">
            <div className="text-[7.5px] font-bold text-slate-900 leading-tight uppercase truncate">
              {name}
            </div>
            <div className="text-[5px] text-slate-600 italic leading-none truncate">
              {role}
            </div>
          </div>

          <div className="flex flex-col gap-1 my-auto">
            <div className="h-0.5 bg-slate-300 rounded-full w-1/3" />
            <div className="h-0.5 bg-slate-200 rounded-full w-full" />
            <div className="h-0.5 bg-slate-200 rounded-full w-4/5" />
            <div className="h-0.5 bg-slate-300 rounded-full w-1/3 mt-0.5" />
            <div className="h-0.5 bg-slate-200 rounded-full w-full" />
          </div>

          <div className="flex justify-between items-center text-[4.5px] font-sans text-slate-400 pt-0.5 border-t border-slate-200">
            <span>Classic</span>
            <span>{experienceCount} Exp</span>
          </div>
        </div>
      )}

      {/* Minimal Template Style */}
      {template === "minimal" && (
        <div className="w-full h-full flex flex-col justify-between font-sans">
          <div className="flex justify-between items-baseline mb-1">
            <div className="text-[7.5px] font-medium text-slate-900 leading-tight truncate">
              {name}
            </div>
            <div className="text-[4.5px] text-slate-400 font-mono">
              •
            </div>
          </div>

          <div className="flex flex-col gap-0.5 my-auto">
            <div className="text-[5px] font-semibold text-slate-700 truncate">{role}</div>
            <div className="h-0.5 bg-slate-100 rounded-full w-full" />
            <div className="h-0.5 bg-slate-100 rounded-full w-5/6" />
            <div className="h-0.5 bg-slate-100 rounded-full w-4/5" />
            <div className="h-0.5 bg-slate-200 rounded-full w-1/2 mt-1" />
            <div className="h-0.5 bg-slate-100 rounded-full w-full" />
          </div>

          <div className="flex items-center gap-0.5 pt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[4.5px] font-mono text-slate-500">Clean</span>
          </div>
        </div>
      )}

      {/* Executive Template Style */}
      {template === "executive" && (
        <div className="w-full h-full flex flex-col justify-between">
          <div className="-m-2 p-1.5 bg-slate-900 text-white mb-1">
            <div className="text-[7px] font-bold tracking-wide truncate">{name}</div>
            <div className="text-[5px] text-amber-300 font-medium truncate">{role}</div>
          </div>

          <div className="flex flex-col gap-1 my-auto pt-1">
            <div className="h-0.5 bg-amber-200 rounded-full w-1/3" />
            <div className="h-0.5 bg-slate-200 rounded-full w-full" />
            <div className="h-0.5 bg-slate-200 rounded-full w-4/5" />
            <div className="h-0.5 bg-slate-200 rounded-full w-full" />
          </div>

          <div className="flex justify-between items-center text-[4.5px] font-mono text-slate-600 pt-0.5 border-t border-amber-100">
            <span className="text-amber-700 font-bold">Executive</span>
            <span>A4</span>
          </div>
        </div>
      )}
    </div>
  );
};
