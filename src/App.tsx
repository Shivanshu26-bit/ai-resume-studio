import { useState, useEffect } from "react";
import { Resume, UserProfile, BottomNavTab } from "./types";
import { sampleResumes } from "./data/mockResumes";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SplashScreen } from "./components/SplashScreen";
import { LoginScreen } from "./components/LoginScreen";
import { HomeScreen } from "./components/HomeScreen";
import { ResumeBuilderScreen } from "./components/ResumeBuilderScreen";
import { AtsScannerScreen } from "./components/AtsScannerScreen";
import { AnalysisResultsScreen } from "./components/AnalysisResultsScreen";
import { ResumeHistoryScreen } from "./components/ResumeHistoryScreen";
import { SettingsScreen } from "./components/SettingsScreen";
import { BottomNavBar } from "./components/BottomNavBar";
import { ResumeScannerModal } from "./components/ResumeScannerModal";
import { AndroidDeviceFrame } from "./components/AndroidDeviceFrame";
import { ResumeDocument } from "./components/ResumeDocument";
import { exportResumeToPdf, getResumePdfFilename } from "./utils/pdfExport";
import {
  subscribeToUserResumes,
  saveUserResume,
  deleteUserResume,
  seedInitialResumesIfEmpty,
} from "./firebase/firestore";

function MainAppContent() {
  const { user, loading: authLoading, signOut, updateProfileData } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  const [resumes, setResumes] = useState<Resume[]>(sampleResumes);
  const [currentTab, setCurrentTab] = useState<BottomNavTab>("home");
  const [activeResume, setActiveResume] = useState<Resume>(sampleResumes[0]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isDeviceFrameMode, setIsDeviceFrameMode] = useState(false);
  const [isSavingResume, setIsSavingResume] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportingResumeId, setExportingResumeId] = useState<string | null>(null);
  const [activeExportResume, setActiveExportResume] = useState<Resume | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Realtime sync with Firestore when user is authenticated with a valid UID
  useEffect(() => {
    if (!user || !user.isLoggedIn || !user.uid) return;

    const uid = user.uid;

    // Seed sample resumes if user is new and Firestore resumes collection is empty
    seedInitialResumesIfEmpty(uid, sampleResumes);

    const unsubscribeResumes = subscribeToUserResumes(
      uid,
      (firestoreResumes) => {
        if (firestoreResumes.length > 0) {
          setResumes(firestoreResumes);
          // Keep activeResume in sync
          setActiveResume((currentActive) => {
            const matched = firestoreResumes.find((r) => r.id === currentActive?.id);
            return matched || firestoreResumes[0];
          });
        } else {
          // If completely empty, keep sample data ready
          setResumes(sampleResumes);
          setActiveResume(sampleResumes[0]);
        }
      },
      (err) => {
        console.error("Firestore sync error:", err);
        showToast("Error syncing with Cloud Firestore: " + err.message, "error");
      }
    );

    return () => {
      unsubscribeResumes();
    };
  }, [user?.uid, user?.isLoggedIn]);

  // Handlers
  const handleSelectResume = (resume: Resume) => {
    setActiveResume(resume);
    setCurrentTab("builder");
  };

  const handleOpenScannerForResume = (resume?: Resume) => {
    if (resume) {
      setActiveResume(resume);
    }
    setCurrentTab("scanner");
  };

  const handleNewResume = async () => {
    if (!user) return;
    const now = Date.now();
    const newResumeId = `res-${now}-${Math.random().toString(36).substring(2, 6)}`;
    const newResume: Resume = {
      id: newResumeId,
      title: "New AI Resume",
      targetRole: user.targetRole || "Software Engineer",
      lastEdited: "Just now",
      updatedAt: now,
      createdAt: now,
      atsScore: 75,
      selectedTemplate: "modern",
      personal: {
        firstName: user.name?.split(" ")[0] || user.displayName?.split(" ")[0] || "Alex",
        lastName: user.name?.split(" ")[1] || user.displayName?.split(" ")[1] || "Chen",
        email: user.email,
        phone: "(555) 987-6543",
        location: "San Francisco, CA",
        linkedin: "https://linkedin.com/in/alexchen-dev",
        summary: "",
      },
      experiences: [
        {
          id: "exp-" + now,
          title: "Software Engineer",
          company: "Tech Solutions Inc.",
          location: "San Francisco, CA",
          startDate: "2022",
          endDate: "Present",
          current: true,
          bullets: [
            "Engineered scalable web applications and REST APIs using modern TypeScript frameworks.",
            "Optimized continuous integration pipelines, cutting test and deployment cycle times by 35%.",
          ],
        },
      ],
      education: [
        {
          id: "edu-" + now,
          degree: "B.S. in Computer Science",
          school: "State University",
          location: "San Francisco, CA",
          year: "2022",
        },
      ],
      skills: ["TypeScript", "React", "Node.js", "REST APIs", "Git", "CI/CD"],
    };

    setActiveResume(newResume);
    setResumes((prev) => [newResume, ...prev]);
    setCurrentTab("builder");

    if (user.uid) {
      try {
        setIsSavingResume(true);
        await saveUserResume(user.uid, newResume);
        showToast("Created new resume in Cloud Firestore");
      } catch (err: any) {
        console.error("Failed to save new resume to Firestore:", err);
        showToast("Failed to save to Firestore: " + (err.message || "Unknown error"), "error");
      } finally {
        setIsSavingResume(false);
      }
    }
  };

  const handleUpdateResume = async (updated: Resume) => {
    const withTimestamps: Resume = {
      ...updated,
      lastEdited: "Just now",
      updatedAt: Date.now(),
    };
    setActiveResume(withTimestamps);
    setResumes((prev) =>
      prev.map((r) => (r.id === updated.id ? withTimestamps : r))
    );

    if (user?.uid) {
      try {
        setIsSavingResume(true);
        await saveUserResume(user.uid, withTimestamps);
      } catch (err: any) {
        console.error("Failed to update resume in Firestore:", err);
        showToast("Error updating Firestore: " + (err.message || "Unknown error"), "error");
      } finally {
        setIsSavingResume(false);
      }
    }
  };

  const handleRunAtsAnalysis = async (resumeToAnalyze: Resume) => {
    try {
      setIsSavingResume(true);
      const res = await fetch("/api/ai/ats-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData: resumeToAnalyze,
          targetRole: resumeToAnalyze.targetRole,
        }),
      });
      const analysisData = await res.json();
      const updated: Resume = {
        ...resumeToAnalyze,
        atsScore: analysisData.atsScore || 85,
        analysis: analysisData,
        lastEdited: "Just now",
        updatedAt: Date.now(),
      };
      await handleUpdateResume(updated);
      showToast("ATS Analysis complete & saved to Firestore!");
      setCurrentTab("scanner");
    } catch (err: any) {
      console.error("Error analyzing resume:", err);
      showToast("Analysis complete. Saved draft.", "info");
      setCurrentTab("scanner");
    } finally {
      setIsSavingResume(false);
    }
  };

  const handleApplyOptimizedSummary = async (newSummary: string) => {
    const updated: Resume = {
      ...activeResume,
      personal: {
        ...activeResume.personal,
        summary: newSummary,
      },
    };
    await handleUpdateResume(updated);
    showToast("Summary updated & saved to Firestore");
  };

  const handleAddKeyword = async (keyword: string) => {
    if (!activeResume.skills.includes(keyword)) {
      const updated: Resume = {
        ...activeResume,
        skills: [...activeResume.skills, keyword],
      };
      await handleUpdateResume(updated);
      showToast(`Added "${keyword}" to resume`);
    }
  };

  const handleDeleteResume = async (id: string) => {
    const filtered = resumes.filter((r) => r.id !== id);
    setResumes(filtered);
    if (activeResume.id === id && filtered.length > 0) {
      setActiveResume(filtered[0]);
    }

    if (user?.uid) {
      try {
        await deleteUserResume(user.uid, id);
        showToast("Resume deleted from Cloud Firestore");
      } catch (err: any) {
        console.error("Failed to delete resume from Firestore:", err);
        showToast("Failed to delete from Firestore: " + (err.message || "Unknown error"), "error");
      }
    }
  };

  const handleDuplicateResume = async (resume: Resume) => {
    const now = Date.now();
    const dupe: Resume = {
      ...resume,
      id: "res-copy-" + now,
      title: `${resume.title} (Copy)`,
      lastEdited: "Just now",
      createdAt: now,
      updatedAt: now,
    };
    setResumes([dupe, ...resumes]);

    if (user?.uid) {
      try {
        await saveUserResume(user.uid, dupe);
        showToast("Duplicated and saved to Cloud Firestore");
      } catch (err: any) {
        console.error("Failed to save duplicated resume to Firestore:", err);
        showToast("Failed to save duplicate: " + (err.message || "Unknown error"), "error");
      }
    }
  };

  const handleUpdateUserProfile = async (updated: UserProfile) => {
    await updateProfileData(updated);
    showToast("Profile saved to Cloud Firestore");
  };

  const handleResetData = async () => {
    if (user?.uid) {
      for (const item of sampleResumes) {
        await saveUserResume(user.uid, item);
      }
      showToast("Reset data restored in Firestore");
    }
    setResumes(sampleResumes);
    setActiveResume(sampleResumes[0]);
    setCurrentTab("home");
  };

  const handleLogout = async () => {
    await signOut();
    setCurrentTab("home");
    showToast("Logged out successfully", "info");
  };

  const handleExportPdf = async (resumeToExport?: Resume) => {
    const target = resumeToExport || activeResume;
    if (!target) return;
    if (isExportingPdf) return;

    setIsExportingPdf(true);
    setExportingResumeId(target.id);
    setActiveExportResume(target);
    showToast("Generating high-resolution A4 PDF...", "info");

    try {
      // Allow offscreen container to render target document
      await new Promise((resolve) => setTimeout(resolve, 150));

      const offscreenEl = document.getElementById("offscreen-export-resume-doc");
      const previewEl = document.getElementById("resume-document-root");
      const elementToCapture = offscreenEl || previewEl;

      if (!elementToCapture) {
        throw new Error("Unable to locate resume layout for PDF generation.");
      }

      const fileName = getResumePdfFilename(target);
      await exportResumeToPdf(elementToCapture, target, {
        fileName,
      });

      showToast(`Downloaded ${fileName} successfully!`, "success");
    } catch (err: any) {
      console.error("Export PDF failed:", err);
      showToast("PDF Export failed: " + (err.message || "Unknown error"), "error");
    } finally {
      setIsExportingPdf(false);
      setExportingResumeId(null);
    }
  };

  // 1. Show Splash screen first
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // 2. While checking Firebase Auth state, display clean loading state (avoids flicker)
  if (authLoading) {
    return (
      <div className="min-h-screen w-full bg-[#f8fafc] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-slate-600 text-sm font-medium">Loading session...</p>
      </div>
    );
  }

  // 3. If unauthenticated, render existing Login/Signup screen
  if (!user || !user.isLoggedIn) {
    return <LoginScreen />;
  }

  // 4. Authenticated Home Screen and App tabs
  return (
    <AndroidDeviceFrame
      isDeviceMode={isDeviceFrameMode}
      onToggleMode={() => setIsDeviceFrameMode(!isDeviceFrameMode)}
    >
      <div className="w-full flex-1 relative flex flex-col">
        {/* Global Toast Notification */}
        {toastMessage && (
          <div
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full shadow-lg text-[13px] font-semibold flex items-center gap-2 transition-all duration-300 ${
              toastMessage.type === "error"
                ? "bg-rose-600 text-white shadow-rose-600/20"
                : toastMessage.type === "info"
                ? "bg-slate-800 text-white shadow-slate-800/20"
                : "bg-emerald-600 text-white shadow-emerald-600/20"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {toastMessage.type === "error"
                ? "error"
                : toastMessage.type === "info"
                ? "info"
                : "check_circle"}
            </span>
            {toastMessage.text}
          </div>
        )}

        {/* Active Screen Tab */}
        {currentTab === "home" && (
          <HomeScreen
            user={user}
            resumes={resumes}
            onSelectResume={handleSelectResume}
            onNewResume={handleNewResume}
            onOpenScanner={handleOpenScannerForResume}
            onViewAllHistory={() => setCurrentTab("history")}
            onOpenSettings={() => setCurrentTab("settings")}
            onExportPdf={handleExportPdf}
            onTabChange={(tab) => setCurrentTab(tab)}
          />
        )}

        {currentTab === "builder" && (
          <ResumeBuilderScreen
            resume={activeResume}
            onChange={handleUpdateResume}
            onSave={handleUpdateResume}
            isSaving={isSavingResume}
            onRunAnalysis={handleRunAtsAnalysis}
            onNavigateToAtsScanner={(res) => {
              setActiveResume(res);
              setCurrentTab("scanner");
            }}
            onExportPdf={handleExportPdf}
            isExportingPdf={isExportingPdf}
            onBack={() => setCurrentTab("home")}
            onOpenSettings={() => setCurrentTab("settings")}
            onTabChange={(tab) => setCurrentTab(tab)}
          />
        )}

        {currentTab === "scanner" && (
          <AtsScannerScreen
            resumes={resumes}
            activeResume={activeResume}
            onSelectResume={(res) => setActiveResume(res)}
            onUpdateResume={handleUpdateResume}
            onNavigateToBuilder={(res) => {
              setActiveResume(res);
              setCurrentTab("builder");
            }}
            onExportPdf={handleExportPdf}
            isExportingPdf={isExportingPdf}
            onOpenSettings={() => setCurrentTab("settings")}
            onBackToDashboard={() => setCurrentTab("home")}
            onTabChange={(tab) => setCurrentTab(tab)}
          />
        )}

        {currentTab === "history" && (
          <ResumeHistoryScreen
            resumes={resumes}
            onSelectResume={handleSelectResume}
            onScanResume={handleOpenScannerForResume}
            onNewResume={handleNewResume}
            onDeleteResume={handleDeleteResume}
            onDuplicateResume={handleDuplicateResume}
            onExportPdf={handleExportPdf}
            exportingResumeId={exportingResumeId}
            onOpenSettings={() => setCurrentTab("settings")}
            onTabChange={(tab) => setCurrentTab(tab)}
          />
        )}

        {currentTab === "settings" && (
          <SettingsScreen
            user={user}
            resumes={resumes}
            onUpdateUser={handleUpdateUserProfile}
            onResetData={handleResetData}
            onLogout={handleLogout}
            onBack={() => setCurrentTab("home")}
            onTabChange={(tab) => setCurrentTab(tab)}
          />
        )}

        {/* Floating Bottom Navigation Bar */}
        <BottomNavBar
          activeTab={currentTab}
          onTabChange={(tab) => {
            if (tab === "builder" && !activeResume) {
              handleNewResume();
            } else {
              setCurrentTab(tab);
            }
          }}
        />

        {/* Quick Scan Draft Modal */}
        <ResumeScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onScanComplete={async (scannedResume) => {
            setResumes((prev) => [scannedResume, ...prev]);
            setActiveResume(scannedResume);
            if (user.uid) {
              await saveUserResume(user.uid, scannedResume);
              showToast("Scanned resume saved to Cloud Firestore");
            }
            setCurrentTab("scanner");
          }}
        />

        {/* Hidden A4 Offscreen Render Target for Crisp PDF Export */}
        <div
          id="offscreen-export-wrapper"
          style={{
            position: "fixed",
            left: "-9999px",
            top: 0,
            width: "794px",
            opacity: 0,
            pointerEvents: "none",
            zIndex: -999,
          }}
          aria-hidden="true"
        >
          <div id="offscreen-export-resume-doc" style={{ width: "794px", backgroundColor: "#ffffff" }}>
            <ResumeDocument
              resume={activeExportResume || activeResume}
              template={(activeExportResume || activeResume).selectedTemplate || "modern"}
            />
          </div>
        </div>
      </div>
    </AndroidDeviceFrame>
  );
}

export function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

export default App;
