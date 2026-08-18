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
    { id: "home", label: "Home", icon: "home" },
    { id: "builder", label: "Build", icon: "add_circle" },
    { id: "history", label: "History", icon: "history" },
    { id: "settings", label: "Settings", icon: "person" },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-4px_24px_rgba(79,70,229,0.06)] flex justify-around items-center h-20 pb-2 px-2 select-none">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            id={`bottom-nav-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center transition-all duration-200 active:scale-90 px-3 py-1 rounded-2xl ${
              isActive ? "text-indigo-600" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <div
              className={`px-5 py-1.5 rounded-full flex items-center justify-center transition-all duration-200 ${
                isActive
                  ? "bg-indigo-100 text-indigo-700 shadow-xs ring-1 ring-indigo-300/50"
                  : "hover:bg-slate-100"
              }`}
            >
              <span
                className={`material-symbols-outlined text-[24px] ${
                  isActive ? "icon-fill font-bold" : ""
                }`}
              >
                {tab.icon}
              </span>
            </div>
            <span
              className={`text-[11px] mt-1 tracking-wide font-medium ${
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
