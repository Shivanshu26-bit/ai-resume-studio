import React from "react";

interface AndroidDeviceFrameProps {
  children: React.ReactNode;
  isDeviceMode: boolean;
  onToggleMode: () => void;
}

export const AndroidDeviceFrame: React.FC<AndroidDeviceFrameProps> = ({
  children,
  isDeviceMode,
  onToggleMode,
}) => {
  // Current time for Android Status Bar
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

  return (
    <div className="min-h-screen w-full bg-slate-200/90 flex flex-col items-center justify-start relative">
      {/* Top Bar Switcher Controls (Fixed) */}
      <aside aria-label="Device Viewport Controls" className="fixed top-2 right-3 z-50 flex items-center gap-2 bg-indigo-950/90 text-white backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-indigo-700/50 text-xs select-none">
        <span className="font-mono text-[11px] text-indigo-200 hidden sm:inline">
          {isDeviceMode ? "Google Pixel Frame" : "Responsive View"}
        </span>
        <button
          onClick={onToggleMode}
          className="bg-white/20 hover:bg-white/30 text-white px-2.5 py-0.5 rounded-full font-bold transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[14px]">
            {isDeviceMode ? "smartphone" : "laptop"}
          </span>
          {isDeviceMode ? "Fit Screen" : "Pixel Frame"}
        </button>
      </aside>

      {isDeviceMode ? (
        <div className="py-6 sm:py-10 px-2 flex justify-center items-center w-full max-w-full">
          {/* Physical Phone Shell */}
          <div className="relative w-full max-w-[420px] h-[890px] bg-slate-950 rounded-[48px] p-3.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.1)] border-[4px] border-slate-700 flex flex-col overflow-hidden">
            {/* Camera Punch Hole */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-4 h-4 bg-black rounded-full z-50 flex items-center justify-center pointer-events-none ring-1 ring-white/10">
              <div className="w-1.5 h-1.5 bg-indigo-900/50 rounded-full" />
            </div>

            {/* Android Status Bar */}
            <div className="h-6 w-full px-7 flex justify-between items-center text-white/90 text-[12px] font-medium z-40 bg-transparent pointer-events-none select-none font-mono">
              <span>{timeString}</span>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">wifi</span>
                <span className="material-symbols-outlined text-[14px]">signal_cellular_4_bar</span>
                <span className="material-symbols-outlined text-[14px]">battery_full</span>
              </div>
            </div>

            {/* Android Screen Viewport */}
            <div className="flex-1 w-full h-full bg-[#f8fafc] rounded-[36px] overflow-hidden overflow-y-auto relative flex flex-col">
              {children}

              {/* Android Gesture Navigation Bar Pill */}
              <div className="fixed bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-slate-900/60 rounded-full z-50 pointer-events-none" />
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full min-h-screen bg-[#f8fafc] flex flex-col">
          {children}
        </div>
      )}
    </div>
  );
};
