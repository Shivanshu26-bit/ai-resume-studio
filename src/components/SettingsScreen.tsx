import React, { useState, useRef } from "react";
import { UserProfile, Resume, BottomNavTab } from "../types";
import { TopAppBar } from "./TopAppBar";
import { uploadProfileAvatar } from "../firebase/storage";

interface SettingsScreenProps {
  user: UserProfile;
  resumes: Resume[];
  onUpdateUser: (updated: UserProfile) => void;
  onResetData: () => void;
  onLogout: () => void;
  onBack: () => void;
  onTabChange?: (tab: BottomNavTab) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  user,
  resumes,
  onUpdateUser,
  onResetData,
  onLogout,
  onBack,
  onTabChange,
}) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [targetRole, setTargetRole] = useState(user.targetRole);
  const [isSaved, setIsSaved] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      name,
      email,
      targetRole,
      updatedAt: Date.now(),
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user.uid) return;

    setIsUploadingAvatar(true);
    try {
      const downloadUrl = await uploadProfileAvatar(user.uid, file);
      const updatedUser: UserProfile = {
        ...user,
        avatarUrl: downloadUrl,
        updatedAt: Date.now(),
      };
      onUpdateUser(updatedUser);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err) {
      console.error("Avatar upload failed:", err);
      alert("Failed to upload avatar image to Firebase Storage.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleExportAllJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(resumes, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ai-resume-studio-backup-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] pb-28 pt-16 flex flex-col items-center">
      <TopAppBar
        title="AI Resume Studio"
        activeTab="settings"
        onTabChange={onTabChange}
        showBack={true}
        onBackClick={onBack}
        onSettingsClick={() => {}}
      />

      <main className="w-full max-w-xl px-4 py-6 flex flex-col gap-5">
        {/* User Card with Storage Avatar Upload */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="relative group">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-indigo-600 flex-shrink-0 shadow-xs bg-slate-100 flex items-center justify-center">
              {isUploadingAvatar ? (
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Upload photo to Firebase Storage"
              className="absolute -bottom-1 -right-1 bg-indigo-600 hover:bg-indigo-700 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md cursor-pointer transition-transform group-hover:scale-110"
            >
              <span className="material-symbols-outlined text-[14px]">photo_camera</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <div className="flex-1">
            <h2 className="text-[18px] font-bold text-slate-900">{user.name}</h2>
            <p className="text-[13px] text-slate-500">{user.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-block bg-indigo-50 text-indigo-700 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-indigo-100">
                {user.targetRole}
              </span>
              <span className="inline-block bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                Firestore Synced
              </span>
            </div>
          </div>
        </div>

        {/* AI Engine Status Card */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 text-white rounded-3xl p-5 shadow-lg shadow-indigo-500/20 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-white flex-shrink-0 shadow-2xs">
            <span className="material-symbols-outlined text-[24px]">psychology</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-bold">Google Gemini AI + Cloud Firestore</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[12px] text-indigo-100/90 mt-0.5 leading-relaxed">
              Powered by Server-Side Gemini API for ATS compliance scoring, keyword optimization, and real-time Firestore persistence.
            </p>
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col gap-4">
          <h3 className="text-[16px] font-bold text-slate-900">Profile Settings</h3>

          <div>
            <label className="block text-[12.5px] font-bold text-slate-800 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13.5px] text-slate-900 focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label className="block text-[12.5px] font-bold text-slate-800 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13.5px] text-slate-900 focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label className="block text-[12.5px] font-bold text-slate-800 mb-1">
              Primary Target Role
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13.5px] text-slate-900 focus:outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="flex justify-between items-center pt-2">
            {isSaved ? (
              <span className="text-[12px] text-emerald-600 font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                Saved to Firestore successfully
              </span>
            ) : <span />}

            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-bold px-6 py-2.5 rounded-full shadow-md shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
            >
              Save Profile
            </button>
          </div>
        </form>

        {/* Data & Portfolio Actions */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col gap-3">
          <h3 className="text-[16px] font-bold text-slate-900">Data Management</h3>

          <button
            type="button"
            onClick={handleExportAllJson}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-indigo-600">download</span>
              <div>
                <span className="text-[14px] font-bold text-slate-900 block">
                  Export Resume Portfolio (JSON)
                </span>
                <span className="text-[11.5px] text-slate-500 font-medium">
                  Download a full backup of your structured resume documents
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-400">chevron_right</span>
          </button>

          <button
            type="button"
            onClick={onResetData}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-amber-600">restart_alt</span>
              <div>
                <span className="text-[14px] font-bold text-slate-900 block">
                  Reset Sample Data
                </span>
                <span className="text-[11.5px] text-slate-500 font-medium">
                  Restore default Senior Dev, Product Manager, and Startup resumes to Firestore
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-400">chevron_right</span>
          </button>
        </div>

        {/* Sign Out */}
        <button
          type="button"
          onClick={onLogout}
          className="w-full border border-rose-300 text-rose-600 hover:bg-rose-50 py-3 rounded-full font-bold text-[14px] flex items-center justify-center gap-2 active:scale-95 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Sign Out of AI Resume Studio
        </button>
      </main>
    </div>
  );
};
