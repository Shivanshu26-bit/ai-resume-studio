import React from "react";
import { BottomNavTab } from "../types";

interface BottomNavBarProps {
  activeTab: BottomNavTab;
  onTabChange: (tab: BottomNavTab) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs: Array<{ id: BottomNavTab; label: string; icon: string }> = [
    { id: "home", label: "Dashboard", icon: "space_dashboard" },
    { id: "builder", label: "Builder", icon: "edit_document" },
    { id: "scanner", label: "ATS Scanner", icon: "document_scanner" },
    { id: "history", label: "My Resumes", icon: "folder_open" },
    { id: "settings", label: "Settings", icon: "tune" },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-4px_24px_rgba(79,70,229,0.06)] flex justify-around items-center h-18 pb-1.5 px-2 select-none md:hidden">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            id={`bottom-nav-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center transition-all duration-200 active:scale-90 px-3 py-1 rounded-2xl cursor-pointer ${
              isActive ? "text-indigo-600" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <div
              className={`px-4 py-1 rounded-full flex items-center justify-center transition-all duration-200 ${
                isActive
                  ? "bg-indigo-100/80 text-indigo-700 shadow-2xs ring-1 ring-indigo-300/40"
                  : "hover:bg-slate-100"
              }`}
            >
              <span
                className={`material-symbols-outlined text-[22px] ${
                  isActive ? "font-bold" : ""
                }`}
              >
                {tab.icon}
              </span>
            </div>
            <span
              className={`text-[10.5px] mt-0.5 tracking-tight font-medium ${
                isActive ? "font-bold text-indigo-700" : "text-slate-600"
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
