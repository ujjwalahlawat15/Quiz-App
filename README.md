
# Quiz App (React + Vite)

A small, responsive quiz application built with React (Vite).  
Features: load questions from Open Trivia DB (API) or local JSON, one-question-per-view UI, per-question timer, progress tracking, results review, and session persistence so a page refresh keeps the same quiz state.



## Demo / Quick start

### Prerequisites
- Node.js v16+ and npm
- Optional: Git, VS Code

### Install & Run

1. create project
```
npm create vite@latest Quiz-App
```

2. copy source files into src/

3. install dependencies

```
npm install react-router-dom framer-motion
```

4. insatll Tailwind
```
npm install tailwindcss @tailwindcss/vite
```
5. ensure src/index.css includes:
@import "tailwindcss";

6. run the project
```
npm run dev
```



---

## Project Structure + Features
- Folder structure (`src/components`, `src/pages`, `src/hooks`, etc.)  
- Key features (API fetch, timer, results, session persistence, keyboard shortcuts, responsive design).  
- Edge cases handled (no internet, API error, empty/short data, rapid clicks, refresh persistence).  



## Project Structure
```text
src/
├── components/ # Button, Card, Container, Progress
├── pages/ # SetupPage, QuizPage, ResultsPage, NotFound
├── hooks/ # useCountdown, useKeyDown
├── utils/ # helpers, fetchApiQuestions
├── data/ # fallback questions.json
```

## Features
- Load 5–10 questions (API or local).
- One question per screen, 4 options.
- Per-question timer (configurable).
- Progress bar + keyboard shortcuts.
- Results page with review & high score.
- Session persistence via sessionStorage.

## Architecture & Design Decisions
- **React functional components + hooks**: clean state management (useState, useEffect).
- **sessionStorage**: saves current quiz session so F5 reload continues same questions & answers.
- **localStorage**: stores persistent high scores across sessions.
- **API-first, fallback local**: ensures quiz works offline.
- **UI/UX**: one question per page, disabled Next until answered, configurable timer, keyboard shortcuts.
- **Styling**: TailwindCSS for responsiveness, Framer Motion for animations.
- **Accessibility**: radio group semantics, keyboard navigation, focus states.

