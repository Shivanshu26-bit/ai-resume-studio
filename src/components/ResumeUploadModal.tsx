import React, { useState, useRef } from "react";
import { Resume, SUPPORTED_INDUSTRIES, SUPPORTED_LANGUAGES } from "../types";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Sparkles, X, ArrowRight, BookOpen, Calculator, HeartPulse, ShoppingBag, Terminal } from "lucide-react";
import { ReviewExtractedModal } from "./ReviewExtractedModal";

interface ResumeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (resume: Resume) => void;
}

export const ResumeUploadModal: React.FC<ResumeUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  if (!isOpen) return null;

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState("");
  const [activeTab, setActiveTab] = useState<"file" | "paste">("file");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  
  // Review state
  const [extractedData, setExtractedData] = useState<Partial<Resume> | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setErrorMessage("");
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "application/msword",
    ];
    const isDocx = file.name.toLowerCase().endsWith(".docx");
    const isPdf = file.name.toLowerCase().endsWith(".pdf");
    const isTxt = file.name.toLowerCase().endsWith(".txt");

    if (!validTypes.includes(file.type) && !isDocx && !isPdf && !isTxt) {
      setErrorMessage("Please upload a valid PDF, DOCX, or TXT file.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage("File size exceeds 15MB limit.");
      return;
    }

    setSelectedFile(file);
  };

  const handleProcessFile = async () => {
    if (!selectedFile && !rawText.trim()) return;
    setIsProcessing(true);
    setErrorMessage("");

    try {
      setProcessingStep("Reading document in memory...");
      let bodyPayload: any = {};

      if (activeTab === "file" && selectedFile) {
        // Read as base64
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const res = reader.result as string;
            const base64 = res.split(",")[1] || res;
            resolve(base64);
          };
          reader.onerror = reject;
        });
        reader.readAsDataURL(selectedFile);
        const fileBase64 = await base64Promise;

        bodyPayload = {
          fileBase64,
          mimeType: selectedFile.type || (selectedFile.name.endsWith(".pdf") ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
          fileName: selectedFile.name,
        };
      } else {
        bodyPayload = {
          rawText: rawText.trim(),
        };
      }

      setProcessingStep("Extracting sections & multilingual content...");
      const res = await fetch("/api/ai/upload-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });

      if (!res.ok) {
        throw new Error("Failed to extract resume data from document.");
      }

      setProcessingStep("Detecting industry & classification...");
      const json = await res.json();
      const parsedResume = json.parsedResume;

      if (!parsedResume) {
        throw new Error("No structured resume data could be extracted.");
      }

      setExtractedData(parsedResume);
      setShowReviewModal(true);
    } catch (err: any) {
      console.error("Extraction error:", err);
      setErrorMessage(err?.message || "Could not parse this resume document. Please check the format or paste text directly.");
    } finally {
      setIsProcessing(false);
      setProcessingStep("");
    }
  };

  // Sample quick load buttons for diverse Indian professions
  const loadTeacherSample = () => {
    setActiveTab("paste");
    setRawText(`Sunita Sharma
New Delhi, India • +91 98765 43210 • sunita.sharma.edu@example.com

PROFESSIONAL SUMMARY
Dedicated PGT Hindi & Sanskrit Educator with over 7 years of teaching experience across CBSE and State Board affiliated secondary schools. Proven track record in Hindi literature pedagogy, classroom management, board examination preparation, and fostering creative student writing.

EDUCATION
- Master of Arts (M.A.) in Hindi Literature | Delhi University | 2016
- Bachelor of Education (B.Ed.) | Jamia Millia Islamia | 2017

TEACHING EXPERIENCE
PGT Hindi Teacher | Delhi Public Senior Secondary School | 2020 - Present
- Instructed Senior Secondary classes (Class 9 to 12) in Hindi Core and Literature aligned with CBSE guidelines.
- Conducted lesson planning, diagnostic assessments, and student progress tracking for board examination batches.
- Organized inter-school Hindi debate (वाद-विवाद) and annual Hindi Diwas cultural celebrations.

TGT Hindi & Sanskrit Teacher | Kendriya Vidyalaya Sangathan | 2017 - 2020
- Delivered interactive Hindi and Sanskrit grammar lessons using audio-visual classroom aids.
- Designed term-end examination papers and evaluated answer sheets.

SKILLS
Hindi Literature & Pedagogy, CBSE Curriculum, Lesson Planning (पाठ योजना), Classroom Management (कक्षा प्रबंधन), Board Exam Preparation, CTET Qualified, Sanskrit Grammar

LANGUAGES
Hindi (Native), English (Professional), Sanskrit (Proficient)`);
  };

  const loadAccountantSample = () => {
    setActiveTab("paste");
    setRawText(`Rajesh Gupta
Mumbai, Maharashtra, India • +91 99887 76655 • rajesh.gupta.acct@example.com

PROFESSIONAL SUMMARY
Detail-oriented Senior Accountant with 5+ years managing accounts payable/receivable, ledger reconciliations, GST return filing (GSTR-1, GSTR-3B), TDS compliance, and Tally Prime reporting.

WORK EXPERIENCE
Senior Accountant | Apex Commercial Logistics Pvt. Ltd. | 2021 - Present
- Supervised daily financial transactions, ledger maintenance, and bank reconciliations using Tally Prime and Advanced MS Excel.
- Prepared and filed monthly GST returns (GSTR-1, GSTR-3B) and quarterly TDS returns ensuring compliance.
- Generated monthly balance sheets, profit & loss statements, and cash flow reports for executive reviews.

EDUCATION
- Master of Commerce (M.Com - Accountancy) | University of Mumbai | 2019
- Bachelor of Commerce (B.Com) | R.A. Podar College | 2017

SKILLS & CERTIFICATIONS
Tally Prime & ERP 9, GST Filing (GSTR-1, 3B), TDS & Income Tax Compliance, Bank Reconciliation (BRS), Advanced Excel, Certified GST Practitioner

LANGUAGES
English, Hindi, Marathi`);
  };

  const loadNurseSample = () => {
    setActiveTab("paste");
    setRawText(`Priya Nair
Bengaluru, Karnataka, India • +91 97654 32109 • priya.nair.nurse@example.com

PROFESSIONAL SUMMARY
Registered Staff Nurse (B.Sc Nursing, KNC Registered) with 4+ years of Intensive Care Unit (ICU) and Emergency ward clinical experience. Skilled in patient triage, vital monitoring, IV cannulation, ventilator management, and CPR resuscitation.

CLINICAL EXPERIENCE
Staff Nurse - Intensive Care Unit (ICU) | Manipal Hospital | 2021 - Present
- Provided comprehensive nursing care to critically ill patients across medical and surgical ICU beds.
- Monitored multi-parameter vital signs, ventilator settings, and administered emergency medications.
- Maintained clinical documentation and nursing handover reports adhering to NABH standards.

EDUCATION
- Bachelor of Science in Nursing (B.Sc Nursing) | Rajiv Gandhi University of Health Sciences | 2020

CERTIFICATIONS & SKILLS
Critical Care Nursing, Ventilator Management, IV Cannulation, BLS & ACLS Protocols (AHA Certified), KNC Registered Nurse

LANGUAGES
English, Hindi, Malayalam, Kannada`);
  };

  const handleReviewConfirm = (finalResume: Resume) => {
    setShowReviewModal(false);
    onUploadSuccess(finalResume);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <div className="bg-white w-full max-w-xl rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200/80 flex flex-col gap-4 animate-scale-up max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-start pb-2 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-700 border border-indigo-100">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <h2 className="text-[18px] font-bold text-slate-900">
                  Upload Existing Resume
                </h2>
              </div>
              <p className="text-[12px] text-slate-500 mt-1">
                Supports all Indian & global professions (Education, Healthcare, Finance, Tech, Sales, etc.) and languages.
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Selector */}
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveTab("file")}
              className={`flex-1 py-2 text-[13px] font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "file"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Upload PDF / DOCX / TXT
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("paste")}
              className={`flex-1 py-2 text-[13px] font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "paste"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Paste Text / Samples
            </button>
          </div>

          {/* Tab 1: File Drag & Drop */}
          {activeTab === "file" && (
            <div className="flex flex-col gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  dragActive
                    ? "border-indigo-600 bg-indigo-50/60 scale-[1.01]"
                    : selectedFile
                    ? "border-emerald-400 bg-emerald-50/40"
                    : "border-slate-300 hover:border-indigo-400 bg-slate-50/60 hover:bg-indigo-50/20"
                }`}
              >
                {selectedFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <FileText className="w-6 h-6" />
                    </div>
                    <span className="text-[14px] font-bold text-slate-900">{selectedFile.name}</span>
                    <span className="text-[11px] text-slate-500">
                      {(selectedFile.size / 1024).toFixed(1)} KB • Click to choose a different file
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2.5">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-slate-800">
                        Drag and drop your resume file here
                      </p>
                      <p className="text-[12px] text-slate-500 mt-0.5">
                        or <span className="text-indigo-600 font-bold underline">browse files</span> from your computer
                      </p>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-slate-200 text-slate-600">
                      PDF, DOCX, TXT (up to 15MB)
                    </span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  <span className="font-bold text-slate-800">Transient & Private:</span> Documents are processed in-memory solely for text extraction and are never stored in external cloud buckets.
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: Text / Indian Profession Samples */}
          {activeTab === "paste" && (
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center flex-wrap gap-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                  Quick Load Indian Profession Samples:
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={loadTeacherSample}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-3 h-3" />
                    Teacher (Hindi PGT)
                  </button>
                  <button
                    type="button"
                    onClick={loadAccountantSample}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    <Calculator className="w-3 h-3" />
                    Accountant (GST/Tally)
                  </button>
                  <button
                    type="button"
                    onClick={loadNurseSample}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    <HeartPulse className="w-3 h-3" />
                    Staff Nurse (ICU)
                  </button>
                </div>
              </div>

              <textarea
                rows={7}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste any resume text, teaching bio, nursing experience, accounting background, or software resume..."
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-[12px] text-slate-900 outline-hidden focus:border-indigo-600 focus:bg-white transition-colors"
              />
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-red-700 text-[12px]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-slate-300 text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleProcessFile}
              disabled={isProcessing || (activeTab === "file" && !selectedFile) || (activeTab === "paste" && !rawText.trim())}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-full text-[13px] font-bold shadow-md shadow-indigo-500/20 flex items-center gap-2 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{processingStep || "Extracting Information..."}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Extract & Review Resume</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && extractedData && (
        <ReviewExtractedModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          extractedResume={extractedData}
          onConfirm={handleReviewConfirm}
        />
      )}
    </>
  );
};
