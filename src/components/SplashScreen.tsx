import React, { useEffect } from "react";

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2200);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      id="splash-screen"
      onClick={onFinish}
      className="fixed inset-0 z-50 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 flex flex-col items-center justify-center p-6 cursor-pointer select-none overflow-hidden"
    >
      {/* Decorative gradient radial glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-indigo-950/80 to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center animate-fade-in text-center">
        {/* App Icon (Document with Sparkle) */}
        <div className="relative w-24 h-24 mb-6 flex items-center justify-center bg-white rounded-2xl shadow-2xl text-indigo-600 transition-transform hover:scale-105 duration-300">
          <span
            className="material-symbols-outlined text-[64px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            description
          </span>
          <span
            className="material-symbols-outlined absolute -top-2 -right-2 text-amber-400 animate-bounce"
            style={{ fontVariationSettings: "'FILL' 1", fontSize: "32px" }}
          >
            auto_awesome
          </span>
        </div>

        <h1 className="text-[32px] md:text-[36px] font-extrabold text-white tracking-tight mb-2">
          AI Resume Studio
        </h1>

        <p className="text-[13px] tracking-[0.2em] uppercase font-semibold text-indigo-200 opacity-90">
          AI-Powered Career Growth
        </p>

        {/* Material 3 Progress Indicator */}
        <div className="w-36 h-1 bg-white/20 rounded-full mt-10 overflow-hidden">
          <div className="h-full bg-indigo-400 rounded-full animate-[pulse_1.5s_ease-in-out_infinite] w-full" />
        </div>

        <p className="text-xs text-indigo-300/60 mt-4 font-mono">Tap anywhere to enter</p>
      </div>
    </div>
  );
};
