# EduGenie – AI Learning Assistant

EduGenie is a production-ready, mobile-first educational web application powered by **Google Gemini 3.8**. It provides students with step-by-step concept explanations, clear answers to academic questions, interactive 3-question quizzes with instant scoring, concise study summaries, and personalized sequential learning roadmaps.

---

## 🌟 Key Features

### 1. 💬 AI Question & Answer (`/qa`)
- Ask any educational question across STEM, coding, history, biology, or humanities.
- Clean formatting supporting Markdown headings, bullet points, numbered lists, and syntax-highlighted code blocks.
- One-click copy answer button and prompt suggestions.

### 2. 💡 Concept Explanation (`/explain`)
- Breaks difficult concepts into 7 structured learning cards:
  1. **Simple Definition**
  2. **Core Concept**
  3. **Step-by-Step Explanation**
  4. **Practical Example**
  5. **Important Points**
  6. **Common Mistakes to Avoid**
  7. **Quick Recap**
- Tailored for Beginner, Intermediate, or Advanced students with Simple, Detailed, or Example-focused styles.

### 3. 🎯 AI Quiz Generator (`/quiz`)
- Generates **EXACTLY 3 multiple-choice questions** with **EXACTLY 4 options** each.
- Interactive question card interface with touch-friendly option buttons.
- Real-time score calculation (e.g. `2 / 3 - 67%`), score badges, review mode highlighting correct and incorrect choices, and pedagogical explanations for every question.
- "Try Again" and "Generate New Quiz" flows.

### 4. 📝 Text Summarizer (`/summarize`)
- Paste study notes, textbook chapters, or lecture transcripts (up to 12,000 characters).
- Extracts **Main Idea**, **Key Points**, **Important Terms & Definitions**, **Important Facts & Numbers**, and a **Quick Revision Summary**.
- Configurable depth: Short, Medium, or Detailed.

### 5. 🗺️ Personalized Learning Path (`/recommendations`)
- Generates sequential milestone roadmaps from prerequisites to mastery across 8 stages:
  - Prerequisites
  - Fundamentals
  - Core Concepts
  - Practical Examples
  - Intermediate Topics
  - Advanced Topics
  - Practice / Projects
  - Revision
- Displays time estimates, difficulty tags, milestone rationales, and suggested next topics.

### 6. 🕒 Local Persistence & Workspace Switcher
- Stores recent questions, explanations, quizzes, and summaries in browser `localStorage`.
- One-click task selector ("How can EduGenie help you today?") with smooth routing and mobile breadcrumbs.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React icons, Motion
- **Backend / Server**: Express 4.x, TypeScript (`tsx`), Node.js
- **AI SDK**: `@google/genai` (Official Google Gen AI SDK)
- **Model**: `gemini-3.8-flash`
- **Build Tool**: Vite 8.x

---

## 📁 Project Structure

```
EduGenie/
├── server/
│   ├── apiRouter.ts           # Express endpoints (/health, /qa, /explain, /quiz, /summarize, /learn/recommendations)
│   ├── config.ts              # App and Gemini configuration
│   ├── geminiClient.ts        # Shared server-side @google/genai client
│   ├── qnaService.ts          # Q&A prompt handling
│   ├── explanationService.ts  # 7-card concept explanation service
│   ├── quizService.ts         # Strict 3-question quiz generator & validator
│   ├── summaryService.ts      # Multi-section study summarizer
│   ├── recommendationService.ts # 8-stage learning path architect
│   └── schemas.ts             # TypeScript schemas & input sanitizers
├── src/
│   ├── components/
│   │   ├── Header.tsx         # Responsive navbar with mobile drawer
│   │   ├── TaskSelector.tsx   # Workspace tool switcher
│   │   ├── MarkdownRenderer.tsx # Custom code & markdown formatter
│   │   └── views/
│   │       ├── HomeDashboard.tsx    # Hero & feature cards
│   │       ├── QaView.tsx           # Question & Answer interface
│   │       ├── ExplainView.tsx      # Concept explanation 7-card view
│   │       ├── QuizView.tsx         # Interactive quiz view & scoring
│   │       ├── SummarizeView.tsx    # Study material summarizer
│   │       ├── RecommendationsView.tsx # Personalized roadmap view
│   │       └── AboutView.tsx        # System specs & future roadmap
│   ├── services/
│   │   ├── api.ts             # Client API service
│   │   └── storage.ts         # LocalStorage persistence
│   ├── types/
│   │   └── index.ts           # Shared data interfaces
│   ├── App.tsx                # Main application & routing
│   └── main.tsx               # React DOM entry point
├── tests/
│   └── test_api.ts            # Integration & unit test suite
├── server.ts                  # Production fullstack server
├── vite.config.ts             # Vite dev server with integrated API middleware
├── Dockerfile                 # Container image definition
├── docker-compose.yml         # Container orchestration
├── metadata.json              # AI Studio capability configuration
├── .env.example               # Environment variables template
└── README.md                  # Documentation
```

---

## ⚙️ Environment Variables

Create a `.env` file based on `.env.example`:

| Variable | Description | Default |
|---|---|---|
| `GEMINI_API_KEY` | Google Gemini API Key | *(Injected automatically in AI Studio)* |
| `GEMINI_MODEL` | Gemini model alias | `gemini-3.8-flash` |
| `APP_NAME` | Name of the application | `EduGenie` |
| `APP_VERSION` | Application version | `1.0.0` |
| `MAX_INPUT_LENGTH` | Maximum characters per request | `12000` |
| `VITE_API_BASE_URL` | Optional external API URL | *(Empty = same origin)* |

> 🔒 **Security Notice:** The `GEMINI_API_KEY` is strictly accessed server-side and is never bundled or sent to the browser.

---

## 🚀 Running the Project

### 1. Install dependencies:
```bash
npm install
```

### 2. Start development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run the test suite:
```bash
npm test
```

### 4. Build and run in production:
```bash
npm run build
npm start
```

---

## 📡 API Endpoints

All endpoints support both `/api/<route>` and `/<route>`:

| Method | Endpoint | Description | Sample Request |
|---|---|---|---|
| `GET` | `/health` | Server health & model info | - |
| `POST` | `/qa` | Ask educational questions | `{"text": "What is entropy?"}` |
| `POST` | `/explain` | 7-part concept explanation | `{"text": "Photosynthesis", "level": "beginner", "preference": "simple"}` |
| `POST` | `/quiz` | 3-question interactive quiz | `{"text": "Python Functions", "difficulty": "medium"}` |
| `POST` | `/summarize` | Summarize study material | `{"text": "...", "length": "medium"}` |
| `POST` | `/learn/recommendations` | Personalized roadmap | `{"topic": "Machine Learning", "level": "beginner", "goal": "exam preparation"}` |

---

## 📱 Mobile Responsiveness

EduGenie is designed mobile-first:
- Tested on screen widths from `320px` to `1920px`.
- Hamburger navigation menu on small screens.
- Touch-friendly quiz options with 44px+ minimum hit targets.
- Flexible responsive grids with zero horizontal scrolling.
