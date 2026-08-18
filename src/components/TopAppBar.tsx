import React from "react";

interface TopAppBarProps {
  title?: string;
  avatarUrl?: string;
  onAvatarClick?: () => void;
  onSettingsClick?: () => void;
  onBackClick?: () => void;
  showBack?: boolean;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  title = "AI Resume Studio",
  avatarUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuA4owbeln06ShcDmz939csO4HP6hzVZM6zVggGvxGEQw4FIRCTKQZDhRNK6MSMN64wjkCNm6wzi5HXMqrVZ20AUdTMt6B6BAy3gpwN-zSMKMA_pY5y94k7x7CgBudSNEIxt9npwlQslnrDqTlZxF32bivGPSvTn5jgffZKw3vV01BeNPSCI4A8JL9nb54CB7zbRt5jWbmah6ES8kS8HHsyDrukhzs9KrOOIECWcQKOPt0lnhnULEveK",
  onAvatarClick,
  onSettingsClick,
  onBackClick,
  showBack = false,
}) => {
  return (
    <header className="fixed top-0 w-full z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 h-16 flex items-center justify-between px-4 md:px-6 shadow-xs select-none">
      <div className="flex items-center gap-3">
        {showBack ? (
          <button
            id="top-back-btn"
            onClick={onBackClick}
            className="w-10 h-10 -ml-1 rounded-full flex items-center justify-center text-indigo-700 hover:bg-indigo-50 transition-colors active:scale-95 duration-150"
            aria-label="Go back"
          >
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
        ) : (
          <button
            id="top-avatar-btn"
            onClick={onAvatarClick}
            className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-indigo-50 border-2 border-indigo-500/30 hover:opacity-90 active:scale-95 transition-all shadow-xs"
            aria-label="User profile photo"
          >
            <img
              src={avatarUrl}
              alt="User Profile"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </button>
        )}

        <div className="flex flex-col">
          <h1 className="text-[20px] md:text-[22px] font-bold text-slate-900 tracking-tight leading-tight flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block shadow-xs shadow-indigo-500/50" />
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          id="top-settings-btn"
          onClick={onSettingsClick}
          className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors active:scale-95 duration-150"
          aria-label="Settings"
        >
          <span className="material-symbols-outlined text-[24px]">settings</span>
        </button>
      </div>
    </header>
  );
};
