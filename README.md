# Personal GitHub Intelligence & AI Career Assistant

[![Live Application](https://img.shields.io/badge/Live%20App-personal--github--linkedin.onrender.com-10b981?style=for-the-badge&logo=render&logoColor=white)](https://personal-github-linkedin.onrender.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-SQLite-2D3748?style=for-the-badge&logo=prisma)](https://prisma.io)

🌐 **Live Application URL**: [https://personal-github-linkedin.onrender.com](https://personal-github-linkedin.onrender.com)  
🏥 **Production Health Status**: [https://personal-github-linkedin.onrender.com/api/health](https://personal-github-linkedin.onrender.com/api/health)

A professional, AI-powered, production-ready web application that continuously organizes your personal GitHub repositories, analyzes your LinkedIn professional history, and recommends the best projects, resume bullets, and career content based on any target job role.

---

## 🌟 Key Features

### 1. GitHub Knowledge Hub (`/repos`)
- **Public & Authenticated Sync**: Connect any GitHub account without a token (60 req/hr) or attach a Personal Access Token (PAT) for private repositories and 5,000 req/hr rate limits.
- **Deep Inspection Engine**: Automatically parses README files, dependency manifests (`package.json`, `requirements.txt`, `Pipfile`, `go.mod`, etc.), and Git trees.
- **Architecture Health Score**: Evaluates repos on a 0-100 scale based on tests, CI/CD, documentation, and structure best practices.
- **Delta Audit & Reusable Components**: Detects existing vs. missing files (e.g. tests, `.env.example`, Dockerfile) and extracts reusable components.

### 2. LinkedIn Professional Intelligence (`/linkedin`)
- **Official CSV Import**: Drag & drop LinkedIn Data Export files (`Positions.csv`, `Skills.csv`, `Certifications.csv`, `Projects.csv`, `Education.csv`).
- **Verified Fact Repository**: Clearly distinguishes verified milestones (backed by certificates or exports) from self-reported or unverified notes.
- **Cross-Linking**: Directly links work experiences and certifications to specific GitHub repositories.

### 3. Role-Based Project Recommendations (`/recommendations`)
- **Any Job Role Input**: Presets for 11+ roles (*AI Engineer*, *Machine Learning Engineer*, *Data Analyst*, *Python Full Stack Developer*, *Embedded Systems Engineer*, etc.) + custom text search.
- **Grounded Evidence**: Categorizes projects into:
  1. Best Existing Projects to Showcase (with score and match explanation).
  2. Projects That Need Improvement Before Showcasing.
  3. High-Impact Missing Portfolio Projects to Build.
  4. Required Technologies & Skills to Learn.
  5. 3-Phase Prioritized Roadmap (Immediate Polish -> Gap Closure -> Career Presence).

### 4. ATS Resume Content Studio (`/resume`)
- **Strict Length Enforcement**:
  - **One-line version**: exactly one concise sentence.
  - **Two-line version**: exactly two concise lines.
  - **Three-bullet version**: exactly three action-oriented bullets (Action Verb + Task/Scope + Metric/Tech).
  - **Detailed version**: structured markdown breakdown.
- **Zero Hallucination Guardrail**: Preserves real facts; never invents metrics, tools, or responsibilities.
- **1-Click Copy & CSV Export**: Instant clipboard copy with feedback and downloadable CSV archive.

### 5. LinkedIn & Career Content Studio (`/content`)
- **10 Specialized Professional Formats**:
  1. Project Launch Announcement Post
  2. Internship & Training Update
  3. Technical Learning Deep-Dive
  4. GitHub Repository Showcase Post
  5. Achievement & Certificate Post
  6. Professional Headline & Tagline
  7. LinkedIn Projects Section Description
  8. LinkedIn Featured Card Summary
  9. Role-Specific About Section Draft
  10. 7-Day Weekly Content Plan
- **Length Variants**: Concise, Medium, and Detailed versions.
- **1-Click Publishing**: Direct "Open in LinkedIn Composer" link with pre-filled text.

### 6. Persistent Storage & Knowledge Base (`/knowledge-base`)
- Relational SQLite database with Prisma ORM (`prisma/dev.db`).
- Global multi-facet search across repositories, facts, and resume entries.
- Complete JSON database backup and CSV resume downloads.
- Synchronization audit history with detailed log inspection.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 15 (App Router, React 19, Server Actions, Route Handlers)
- **Language**: TypeScript (Strict mode)
- **Styling**: Tailwind CSS v4 with custom dark/light design system
- **Database**: SQLite with Prisma ORM
- **Intelligence**: Multi-tiered (Zero-Cost Local Heuristic Engine + Google Gemini 2.0 Flash)
- **Containerization**: Multi-stage Docker & docker-compose

---

## 🚀 Quickstart (Local Development)

### Prerequisites
- Node.js 18+ (tested on v24)
- npm

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database & Seed
```bash
npx prisma db push
npx tsx prisma/seed.ts
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚢 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions on deploying to Render (Free), Railway, Fly.io, or Docker VPS.
