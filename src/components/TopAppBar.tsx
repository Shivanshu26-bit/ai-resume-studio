import React from "react";
import { BottomNavTab } from "../types";

interface TopAppBarProps {
  title?: string;
  avatarUrl?: string;
  activeTab?: BottomNavTab;
  onTabChange?: (tab: BottomNavTab) => void;
  onAvatarClick?: () => void;
  onSettingsClick?: () => void;
  onBackClick?: () => void;
  showBack?: boolean;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  title = "AI Resume Studio",
  avatarUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuA4owbeln06ShcDmz939csO4HP6hzVZM6zVggGvxGEQw4FIRCTKQZDhRNK6MSMN64wjkCNm6wzi5HXMqrVZ20AUdTMt6B6BAy3gpwN-zSMKMA_pY5y94k7x7CgBudSNEIxt9npwlQslnrDqTlZxF32bivGPSvTn5jgffZKw3vV01BeNPSCI4A8JL9nb54CB7zbRt5jWbmah6ES8kS8HHsyDrukhzs9KrOOIECWcQKOPt0lnhnULEveK",
  activeTab,
  onTabChange,
  onAvatarClick,
  onSettingsClick,
  onBackClick,
  showBack = false,
}) => {
  const navTabs: Array<{ id: BottomNavTab; label: string; icon: string }> = [
    { id: "home", label: "Dashboard", icon: "space_dashboard" },
    { id: "builder", label: "Resume Builder", icon: "edit_document" },
    { id: "scanner", label: "ATS Scanner", icon: "document_scanner" },
    { id: "history", label: "My Resumes", icon: "folder_open" },
    { id: "settings", label: "Settings", icon: "tune" },
  ];

  return (
    <header className="fixed top-0 w-full z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 h-16 flex items-center justify-between px-4 lg:px-8 shadow-xs select-none">
      {/* Brand & Left Section */}
      <div className="flex items-center gap-3">
        {showBack ? (
          <button
            id="top-back-btn"
            onClick={onBackClick}
            className="w-9 h-9 -ml-1 rounded-full flex items-center justify-center text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors active:scale-95 duration-150 cursor-pointer"
            aria-label="Go back"
          >
            <span className="material-symbols-outlined text-[22px]">arrow_back</span>
          </button>
        ) : (
          <div
            onClick={() => onTabChange && onTabChange("home")}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[20px]">description</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[17px] font-extrabold text-slate-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors">
                {title}
              </span>
              <span className="text-[10px] font-mono font-bold text-indigo-600 tracking-wider uppercase mt-0.5">
                AI Builder &amp; ATS Platform
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Navigation Links */}
      {onTabChange && (
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-full border border-slate-200/70 shadow-2xs">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`desktop-nav-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12.5px] font-semibold transition-all duration-150 cursor-pointer ${
                  isActive
                    ? "bg-white text-indigo-700 shadow-xs border border-slate-200/90 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <span className={`material-symbols-outlined text-[17px] ${isActive ? "text-indigo-600" : "text-slate-400"}`}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* Right User & Settings Section */}
      <div className="flex items-center gap-2">
        <button
          id="top-settings-btn"
          onClick={onSettingsClick || (() => onTabChange && onTabChange("settings"))}
          className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors active:scale-95 cursor-pointer"
          aria-label="Settings"
        >
          <span className="material-symbols-outlined text-[22px]">settings</span>
        </button>

        <button
          id="top-avatar-btn"
          onClick={onAvatarClick || (() => onTabChange && onTabChange("settings"))}
          className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-indigo-50 border border-slate-200 hover:border-indigo-500 hover:ring-2 hover:ring-indigo-100 active:scale-95 transition-all shadow-2xs cursor-pointer"
          aria-label="User profile photo"
        >
          <img
            src={avatarUrl}
            alt="User Profile"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </button>
      </div>
    </header>
  );
};
