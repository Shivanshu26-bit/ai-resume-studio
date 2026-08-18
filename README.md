# AI Resume Studio

> A full-stack, enterprise-grade AI resume builder and ATS optimization platform engineered with React 19, TypeScript, Express, Google Gemini, and Firebase.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4.1-38bdf8.svg)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com/)
[![Firebase](https://img.shields.io/badge/Firebase-v12-orange.svg)](https://firebase.google.com/)
[![Google Gemini](https://img.shields.io/badge/Gemini-3.7--Flash-purple.svg)](https://ai.google.dev/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ed.svg)](https://www.docker.com/)

---

## 📌 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [AI Guardrails & Anti-Hallucination Engineering](#ai-guardrails--anti-hallucination-engineering)
- [Getting Started & Local Setup](#getting-started--local-setup)
- [Environment Variables](#environment-variables)
- [Backend API Reference](#backend-api-reference)
- [Database & Security Rules](#database--security-rules)
- [Production Deployment](#production-deployment)
- [Future Improvements](#future-improvements)
- [License](#license)

---

## 🌟 Overview

**AI Resume Studio** is an intelligent career document preparation suite designed to bridge the gap between job seekers and Applicant Tracking Systems (ATS). Unlike standard text generators that fabricate fake metrics or exaggerate candidate experience levels, AI Resume Studio implements strict **factual guardrails**, **candidate experience level detection**, and **STAR-framework enhancement** to produce truthful, high-impact resumes tailored to specific roles.

---

## 🚀 Key Features

### 1. 🤖 Context-Aware AI Writing Assistant
- **Professional Summary Generator**: Tailors executive summaries based on actual candidate skills, education, and career level (Student, Fresher, Junior, Mid-level, Senior).
- **STAR-Method Bullet Enhancer**: Converts unstructured bullet points into action-driven statements (*Situation, Task, Action, Result*) without inventing unverified numbers.
- **Technical Project Optimizer**: Highlights architectural choices, individual contributions, and technical stacks for developer portfolios.

### 2. 🎯 Job Description Matcher & Keyword Gap Analysis
- Analyzes candidate resumes against target job descriptions in real-time.
- Identifies **Present Skills** vs. **Missing Recommended Keywords**.
- Calculates a weighted match score across technical competencies, education, and domain requirements.

### 3. 📊 ATS Readiness Scanner & Breakdown
- Provides an automated ATS readability score (0–100%).
- Inspects keyword alignment, section formatting, and experience fit with detailed progress metrics.
- Surfaces high-priority actionable recommendations.

### 4. 🎨 Multi-Template Live Preview & High-Fidelity PDF Export
- Instant toggle between **Modern**, **Classic**, **Minimal**, and **Executive** typography themes.
- Client-side A4 multi-page document rendering via `html2canvas` and `jspdf` with zero layout distortion.

### 5. ☁️ Real-time Cloud Persistence & Authentication
- Secure authentication via **Google Sign-In** and **Email/Password**.
- Multi-resume management with real-time Firestore synchronization, auto-save status indicators, and atomic updates.

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────┐
│                   React 19 Frontend                    │
│      (Tailwind CSS v4 • Motion • Lucide Icons)        │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
   Relative API Requests            Direct Firebase SDK
  (Same-Origin / Zero CORS)       (Auth & Cloud Firestore)
               │                          │
               ▼                          ▼
┌──────────────────────────────┐ ┌──────────────────────┐
│    Express 4 API Gateway     │ │  Firebase Services   │
│ (Bundled with esbuild to CJS)│ │ - Google Sign-In     │
│ - Request Validation         │ │ - Email/Password     │
│ - Anti-Hallucination Prompts │ │ - Cloud Firestore    │
│ - Level Detection Logic      │ │ - Zero-Trust Rules   │
└──────────────┬───────────────┘ └──────────────────────┘
               │
      Server-to-Server
     Secret: GEMINI_API_KEY
               │
               ▼
┌──────────────────────────────┐
│   Google Gemini 3.7 Flash    │
│   (Structured JSON Schema)   │
└──────────────────────────────┘
```

### Architectural Highlights
- **Unified Container Service**: In production, the Express backend serves the precompiled Vite single-page application from `dist/` and acts as the API gateway. This eliminates cross-origin latency, CORS misconfigurations, and multi-host deployment overhead.
- **Client-Safe Secrets Isolation**: The `GEMINI_API_KEY` is strictly accessed in backend server routines via `process.env.GEMINI_API_KEY` and is never bundled into client JavaScript.

---

## 🛠️ Technology Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 19, TypeScript | Reactive, component-driven user interface |
| **Styling** | Tailwind CSS v4 | Modern, utility-first CSS engine |
| **Animations** | Motion (`motion/react`) | Fluid modal and tab transitions |
| **Icons** | Lucide React | Consistent vector iconography |
| **PDF Generation** | jsPDF, html2canvas | High-DPI canvas to multi-page A4 PDF compiler |
| **Backend** | Express 4, Node.js 20 | REST API gateway and static bundle host |
| **Build Tools** | Vite 6, esbuild, tsx | Ultra-fast TypeScript compilation and bundling |
| **AI Model** | Google Gemini 3.7 Flash | High-speed structured content optimization |
| **Database** | Cloud Firestore | Real-time NoSQL cloud document storage |
| **Authentication**| Firebase Authentication | Google OAuth 2.0 & Email/Password provider |
| **Containerization** | Docker | Multi-stage Alpine container image |

---

## 🛡️ AI Guardrails & Anti-Hallucination Engineering

AI Resume Studio implements defensive prompt engineering to prevent generative AI hallucinations:
1. **Level-Aware Guard**: Evaluates candidate experience duration and graduation dates to prevent inflating a student or fresher into a senior title.
2. **Metric Integrity**: Prohibits the invention of fictitious production numbers (e.g., *"Scaled to 10M users"* or *"Reduced latency by 45%"*) unless explicitly provided by the user.
3. **Structured JSON Output**: All Gemini API calls use strict response schemas (`Type.OBJECT`, `Type.ARRAY`) for deterministic JSON output parsing.

---

## 💻 Getting Started & Local Setup

### Prerequisites
- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher
- **Gemini API Key**: Obtainable from [Google AI Studio](https://aistudio.google.com/)
- **Firebase Project**: Configured with Authentication and Cloud Firestore

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/ai-resume-studio.git
cd ai-resume-studio
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a local `.env` file in the root directory by copying `.env.example`:
```bash
cp .env.example .env
```

Populate the `.env` file with your credentials:
```env
# ==========================================
# SERVER-ONLY (Keep Private)
# ==========================================
GEMINI_API_KEY=your_actual_gemini_api_key_here
PORT=3000
NODE_ENV=development

# ==========================================
# CLIENT-SAFE (Firebase Web Configuration)
# ==========================================
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_FIREBASE_FIRESTORE_DATABASE_ID=(default)
```

> ⚠️ **Security Notice**: Never commit `.env` or any real API keys to version control. The repository's `.gitignore` and `.dockerignore` are pre-configured to exclude environment files.

### 4. Start the Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 Backend API Reference

All backend routes are prefixed with `/api`.

### `GET /api/health`
Health check endpoint for container orchestrators and load balancers.
* **Response**: `200 OK`
```json
{
  "status": "ok"
}
```

### `POST /api/ai/generate-summary`
Generates a 100% factual ATS summary based on candidate profile and target role.
* **Payload**:
```json
{
  "draft": "Current draft summary...",
  "targetRole": "Frontend Engineer",
  "skills": ["React", "TypeScript", "Tailwind CSS"],
  "experience": []
}
```

### `POST /api/ai/improve-content`
Enhances an experience bullet point into a STAR-format achievement statement.
* **Payload**:
```json
{
  "content": "Built the login page for the app",
  "role": "Software Developer",
  "skills": ["React", "Firebase"]
}
```

### `POST /api/ai/improve-project`
Refines a technical project description with architectural tags and implementation details.
* **Payload**:
```json
{
  "projectTitle": "AI Resume Studio",
  "projectDescription": "A tool to build resumes",
  "technologies": ["React", "Express", "Gemini"]
}
```

### `POST /api/ai/analyze-job`
Compares a resume against a job description, returning present vs. missing keywords.
* **Payload**:
```json
{
  "jobDescription": "Looking for a React developer with Docker and CI/CD experience...",
  "resumeData": { ... }
}
```

### `POST /api/ai/ats-analysis`
Performs comprehensive ATS scoring across Keyword Match, Experience Alignment, and Readability.
* **Payload**:
```json
{
  "resumeData": { ... },
  "jobDescription": "Optional target job description"
}
```

### `POST /api/ai/parse-draft`
Extracts structured personal information, experiences, education, and skills from raw text.
* **Payload**:
```json
{
  "rawText": "Candidate raw resume copy...",
  "targetRole": "Software Engineer"
}
```

---

## 🔒 Database & Security Rules

Cloud Firestore enforces zero-trust security rules with default-deny policies. Users can only read, update, or delete their own documents.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Default Deny
    match /{document=**} {
      allow read, write: if false;
    }

    // Authenticated User Resumes Isolation
    match /users/{userId}/resumes/{resumeId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // User Profile Document Isolation
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 🚢 Production Deployment

### Docker Deployment
The project includes a production-ready, multi-stage `Dockerfile` executing under a non-root `node` user:

```bash
# Build the Docker image
docker build -t ai-resume-studio:latest .

# Run the container locally
docker run -p 3000:3000 -e GEMINI_API_KEY="your_api_key" -e NODE_ENV="production" ai-resume-studio:latest
```

### Deploy to Google Cloud Run
```bash
# 1. Submit build to Google Artifact Registry
gcloud builds submit --tag gcr.io/[PROJECT_ID]/ai-resume-studio

# 2. Deploy to Cloud Run with Secret Manager injection
gcloud run deploy ai-resume-studio \
  --image gcr.io/[PROJECT_ID]/ai-resume-studio \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest
```

---

## 🔮 Future Improvements

- [ ] **Cover Letter Generator**: Auto-generate targeted cover letters aligned with the analyzed resume and job description.
- [ ] **LinkedIn Profile Synchronization**: Direct import and two-way sync with LinkedIn profile summaries.
- [ ] **Multi-Language Resumes**: AI-powered localized resume translation preserving industry terminology.
- [ ] **DOCX Export**: Native Microsoft Word document download alongside vector PDF export.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
