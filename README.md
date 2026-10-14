# 📝 PaperGen Pro

> **Automated Question Paper & Blueprint Generator for JEE Main, JEE Advanced, NEET-UG & MHT-CET**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-sql.js-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://sql.js.org/)
[![KaTeX](https://img.shields.io/badge/Math-KaTeX-057A55?style=flat-square)](https://katex.org/)

**PaperGen Pro** is a modern, high-performance web application designed for educators, schools, and coaching institutes to generate authentic, balanced, and beautifully formatted question papers in minutes. It supports major Indian competitive examinations with intelligent blueprint structuring, mathematical LaTeX formula rendering, instant PDF generation, and complete institute branding.

---

## ✨ Features

- **🎯 Exam Blueprint Engine**:
  - Pre-configured templates for standard patterns:
    - **JEE Main** (300 Marks, Section A MCQs + Section B Numerical)
    - **JEE Advanced** (Multi-correct, Numerical, Comprehension/Paragraph)
    - **NEET-UG** (720 Marks, Section A + Section B with optional questions across Physics, Chemistry, Botany, Zoology)
    - **MHT-CET** (200 Marks, PCM & PCB patterns)
    - **Custom Tests** (Topic-wise chapter tests, weekly assessments, unit mocks)
- **⚡ Smart Question Selection**:
  - **Auto-Select Mode**: Automatically populates papers matching exact subject, chapter, topic, difficulty (Easy / Medium / Hard), and PYQ distribution targets.
  - **Manual Bank Browser**: Search, filter, inspect, and cherry-pick questions with live LaTeX math previews.
- **📐 Mathematical & Scientific Formula Rendering**:
  - Powered by [KaTeX](https://katex.org/) for rendering inline `$...$` and block `$$...$$` equations, chemical formulas, and scientific notations.
- **🖨️ PDF Export & Print Ready**:
  - Generates print-ready PDFs with clean typography, page breaks, and section dividers using `jsPDF` and `html2canvas`.
  - Supports exporting **Question Paper**, **Answer Key**, and detailed **Step-by-Step Solutions**.
- **🏫 Institute Branding & Customization**:
  - Upload institute logo.
  - Set custom header metadata: Institute name, exam title, batch, date, duration, max marks, and general student instructions.
  - Optional custom diagonal watermark across question paper pages.
- **✍️ Custom Question Authoring**:
  - Teachers can create and store custom questions (MCQs, Integer/Numerical, Multi-select) directly into persistent institute storage.
- **🗃️ In-Memory SQLite Architecture**:
  - Built on `sql.js` (WebAssembly SQLite) for sub-millisecond querying, multi-facet filtering, and caching without external database infrastructure.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **Styling**: [TailwindCSS v4](https://tailwindcss.com/)
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Math Formatting**: [KaTeX](https://katex.org/)
- **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF) & [html2canvas](https://html2canvas.hertzen.com/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Server Framework**: [Express 5](https://expressjs.com/)
- **Database Engine**: [sql.js](https://sql.js.org/) (SQLite compiled to WebAssembly)
- **Data Persistence**: File-backed JSON store (`server_storage/`) for institute profiles, created papers, and custom user questions.

---

## 📁 Project Structure

```text
question_paper_generator/
├── public/                 # Static web assets and icons
├── server_storage/         # Persistent server data (profile, papers, custom questions)
│   ├── papers.json
│   ├── profile.json
│   └── user_questions.json
├── src/
│   ├── assets/             # Brand logos and client media
│   ├── components/         # Reusable React UI components
│   │   ├── Layout.tsx             # Main dashboard navigation and frame
│   │   ├── MathText.tsx           # KaTeX LaTeX formula renderer
│   │   ├── PaperPreview.tsx       # Live printable paper preview & PDF generator
│   │   ├── QuestionBankBrowser.tsx# Searchable question repository modal
│   │   ├── QuestionForm.tsx       # Custom question creation modal
│   │   └── StepIndicator.tsx      # Multi-step paper creation progress tracker
│   ├── pages/              # Application views & workflows
│   │   ├── CreatePaper.tsx        # 4-Step wizard to build new examination papers
│   │   ├── Dashboard.tsx          # System statistics, recent papers & quick actions
│   │   ├── MyPapers.tsx           # Saved question papers catalog & actions
│   │   ├── QuestionBank.tsx       # Dedicated question explorer with filters
│   │   ├── Settings.tsx           # Institute branding, logo & print layout preferences
│   │   └── Templates.tsx          # Exam-specific blueprint templates
│   ├── api.ts              # Frontend API client and endpoints
│   ├── App.tsx             # Client application routing setup
│   ├── config.ts           # Environment & base URL configurations
│   ├── index.css           # Global CSS variables & typography
│   ├── main.tsx            # React application entry point
│   ├── store.ts            # Zustand global application state
│   └── types.ts            # Core TypeScript interfaces & schemas
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
├── .oxlintrc.json          # Oxlint configuration
├── check_topics.cjs        # Database query verification script
├── index.html              # HTML shell
├── package.json            # Project dependencies and npm scripts
├── probe_db.cjs            # SQLite schema inspector
├── server.cjs              # Express backend API & SQLite database builder
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version **18.x** or higher recommended)
- `npm` (comes bundled with Node.js)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sadmsd707/question_paper_generator.git
   cd question_paper_generator
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
   *(On Windows PowerShell: `Copy-Item .env.example .env`)*

   Default configuration:
   ```env
   # Server Settings
   PORT=3001
   NODE_ENV=development
   CORS_ORIGIN=*

   # Storage & Database Cache Settings
   STORAGE_DIR=server_storage
   DB_CACHE_FILE=.questions_db_cache.bin

   # Frontend Client Settings
   VITE_API_BASE_URL=http://localhost:3001/api
   VITE_APP_NAME="PaperGen Pro"
   VITE_APP_VERSION="1.0.0"
   ```

---

## 💻 Running the Application

### 1. Start the Backend API Server
```bash
npm run server
```
The server will start on `http://localhost:3001` (or your configured `PORT`), initializing the SQLite database and exposing the REST API.

### 2. Start the Frontend Development Server
In a separate terminal:
```bash
npm run dev
```
Open your browser and navigate to the local Vite URL (default `http://localhost:5173`).

### 3. Production Build
To create an optimized production build:
```bash
npm run build
```
Preview the production build locally:
```bash
npm run preview
```

---

## 📡 API Reference Overview

The backend server exposes the following REST API endpoints under `/api`:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Healthcheck and server status |
| `GET` | `/api/questions/stats` | Total counts grouped by exam, subject, and type |
| `GET` | `/api/questions/chapters` | Distinct chapters for an exam & subject |
| `GET` | `/api/questions/topics` | Distinct topics for an exam, subject & chapter |
| `GET` | `/api/questions` | Query questions with pagination and multi-filters |
| `POST` | `/api/questions/auto-select` | Algorithmically select questions matching blueprint criteria |
| `GET` | `/api/profile` | Retrieve institute branding & profile settings |
| `POST` | `/api/profile` | Update institute branding & profile settings |
| `GET` | `/api/papers` | Retrieve list of saved question papers |
| `POST` | `/api/papers` | Save a newly generated question paper |
| `DELETE` | `/api/papers/:id` | Delete a saved question paper |
| `GET` | `/api/user-questions` | List custom user-created questions |
| `POST` | `/api/user-questions` | Create a new custom question |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
