// src/pages/QuizPage.jsx
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Container from "../components/Container";
import Card from "../components/Card";
import Button from "../components/Button";
import Progress from "../components/Progress";
import useCountdown from "../hooks/useCountdown";
import useKeyDown from "../hooks/useKeyDown";
import { clamp } from "../utils/helpers";
import { fetchApiQuestions } from "../utils/fetchApiQuestions";
import localQuestions from "../data/questions.json";

// helper to build an answer entry
function makeEntry(q, selIdx) {
  return {
    questionId: q.id,
    question: q.question,
    options: q.options,
    correctIndex: q.correctIndex,
    selectedIndex: typeof selIdx === "number" ? selIdx : null,
  };
}

function updateHighScore({ score, total }) {
  try {
    const key = `quiz-highscore-v1-${total}`;
    const prev = JSON.parse(localStorage.getItem(key) || "null");
    if (!prev || score > prev.score) {
      localStorage.setItem(key, JSON.stringify({ score, total, at: Date.now() }));
    }
  } catch {}
}

export default function QuizPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const source = params.get("source") || "api"; // 'api' | 'local'
  const difficulty = params.get("difficulty") || "easy";
  const amount = clamp(parseInt(params.get("amount") || "10", 10), 5, 10);
  const timerSec = clamp(parseInt(params.get("timer") || "30", 10), 0, 120);

  // storage key is deterministic for the chosen mode and config
  const storageKey = `quiz-session-v1-${source}-${difficulty}-${amount}-${timerSec}`;

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]); // array of entries
  const [isAdvancing, setIsAdvancing] = useState(false);

  const restoredRef = useRef(false); // true if we restored from sessionStorage on mount

  const [timeLeft, setTimeLeft] = useCountdown(timerSec, [index, timerSec]);

  // Persist to sessionStorage whenever key parts change (only if questions exist)
  useEffect(() => {
    try {
      if (questions && questions.length > 0) {
        const payload = {
          questions,
          index,
          selected,
          answers,
          timeLeft,
          savedAt: Date.now(),
        };
        sessionStorage.setItem(storageKey, JSON.stringify(payload));
      }
    } catch (e) {
      // ignore storage errors
      // console.warn("[quiz] failed to persist session:", e);
    }
  }, [questions, index, selected, answers, timeLeft, storageKey]);

  // Single robust init effect: restore if saved, otherwise fetch & persist immediately
  useEffect(() => {
    let cancelled = false;

    async function init() {
      // 1) Try restore from sessionStorage first
      try {
        const raw = sessionStorage.getItem(storageKey);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
              setQuestions(parsed.questions);
              setIndex(typeof parsed.index === "number" ? parsed.index : 0);
              setSelected(typeof parsed.selected !== "undefined" ? parsed.selected : null);
              setAnswers(Array.isArray(parsed.answers) ? parsed.answers : []);
              setTimeLeft(typeof parsed.timeLeft === "number" ? parsed.timeLeft : timerSec);
              setLoading(false);
              restoredRef.current = true;
              // console.log("[quiz] restored session from storage:", storageKey);
              return; // restored — done
            }
          } catch (e) {
            // parsing failed — continue to fetch
            // console.warn("[quiz] failed to parse sessionStorage payload, will fetch new questions", e);
          }
        }
      } catch (e) {
        // sessionStorage might be unavailable (privacy mode) — continue to fetch
        // console.warn("[quiz] sessionStorage not available:", e);
      }

      // 2) No valid saved session — fetch (or use local) and persist immediately
      try {
        setLoading(true);
        setError("");
        let qs = [];
        if (source === "api") {
          qs = await fetchApiQuestions({ amount, difficulty });
        } else {
          qs = localQuestions.slice(0, amount);
        }

        if (cancelled) return;

        const payloadToSave = {
          questions: qs,
          index: 0,
          selected: null,
          answers: [],
          timeLeft: timerSec,
          savedAt: Date.now(),
        };

        try {
          sessionStorage.setItem(storageKey, JSON.stringify(payloadToSave));
          // console.log("[quiz] saved fetched questions to sessionStorage:", storageKey);
        } catch (err) {
          // ignore storage errors
          // console.warn("[quiz] could not save to sessionStorage:", err);
        }

        setQuestions(qs);
        setIndex(0);
        setSelected(null);
        setAnswers([]);
        setTimeLeft(timerSec);
        setLoading(false);
      } catch (err) {
        // fetch error -> fallback to local and persist fallback
        // console.error("[quiz] fetch error:", err);
        const fallback = localQuestions.slice(0, amount);
        try {
          const payloadToSave = {
            questions: fallback,
            index: 0,
            selected: null,
            answers: [],
            timeLeft: timerSec,
            savedAt: Date.now(),
          };
          sessionStorage.setItem(storageKey, JSON.stringify(payloadToSave));
          // console.log("[quiz] saved fallback questions to sessionStorage:", storageKey);
        } catch (e) {
          // ignore
        }

        if (!cancelled) {
          setQuestions(fallback);
          setIndex(0);
          setSelected(null);
          setAnswers([]);
          setTimeLeft(timerSec);
          setLoading(false);
          setError(err?.message || "Failed to load questions");
        }
      }
    }

    init();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, difficulty, amount, storageKey]);

  // Auto-advance on timer expiry
  useEffect(() => {
    if (timerSec === 0) return;
    if (loading) return;
    if (timeLeft <= 0 && !isAdvancing) {
      handleNext(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, loading]);

  const total = questions.length;
  const current = questions[index];
  const hasSelection = selected !== null && selected !== undefined;
  const isLast = index === total - 1;

  function handleNext(fromTimer = false) {
    if (isAdvancing) return;
    setIsAdvancing(true);

    const hasSelectionLocal = selected !== null && selected !== undefined;
    if (!fromTimer && !hasSelectionLocal) {
      setIsAdvancing(false);
      return;
    }

    // Build the next answers array synchronously with the current question included
    const entry = current ? makeEntry(current, hasSelectionLocal ? selected : null) : null;
    const nextAnswers = [...answers];
    if (entry) nextAnswers[index] = entry;
    setAnswers(nextAnswers);

    setTimeout(() => {
      if (isLast) {
        const results = nextAnswers.map((a) => ({
          ...a,
          isCorrect: typeof a?.selectedIndex === "number" && a.selectedIndex === a.correctIndex,
        }));
        const score = results.reduce((acc, r) => acc + (r.isCorrect ? 1 : 0), 0);
        const payload = { results, score, total: results.length, finishedAt: Date.now() };

        sessionStorage.setItem("lastResults", JSON.stringify(payload));
        try { sessionStorage.removeItem(storageKey); } catch {}
        updateHighScore(payload);
        navigate("/results", { state: payload, replace: true });
      } else {
        setIndex((i) => i + 1);
        const nextSelected = nextAnswers[index + 1]?.selectedIndex ?? null;
        setSelected(nextSelected);
        setIsAdvancing(false);
      }

      if (!nextAnswers[index + 1]) setSelected(null);
      setTimeLeft(timerSec);
    }, 120);
  }

  function handleSkip() {
    if (isAdvancing) return;
    setSelected(null);
    handleNext(true);
  }

  function handleSelect(i) {
    setSelected(i);
  }

  // Keyboard shortcuts
  useKeyDown((e) => {
    if (loading || !current) return;
    const key = e.key;
    if (/^[1-4]$/.test(key)) {
      const idx = parseInt(key, 10) - 1;
      if (idx >= 0 && idx < current.options.length) setSelected(idx);
    } else if (key === "Enter") {
      if (selected !== null && selected !== undefined) handleNext();
    } else if (key.toLowerCase() === "s") {
      handleSkip();
    }
  });

  if (loading) {
    return (
      <Container>
        <Card className="p-8 text-center">
          <div className="animate-pulse text-slate-600">Loading questions…</div>
        </Card>
      </Container>
    );
  }

  if (!current) {
    return (
      <Container>
        <Card className="p-8 text-center space-y-4">
          <div className="text-slate-700">No questions available.</div>
          <div className="text-xs text-slate-500">Try switching to Local source.</div>
          <div className="flex justify-center">
            <Link to="/"><Button>Back to Setup</Button></Link>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      {error && (
        <div className="mb-4 p-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-sm">
          Couldn’t load API questions: {error}. Falling back to local set.
        </div>
      )}

      <div className="flex items-center justify-between mb-3 text-sm">
        <div>Question {index + 1} of {total}</div>
        {timerSec > 0 && (
          <div className={`tabular-nums font-medium ${timeLeft <= 5 ? "text-red-600" : "text-slate-700"}`} aria-live="polite">
            {timeLeft}s
          </div>
        )}
      </div>
      <Progress value={index} max={Math.max(total - 1, 1)} />

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="mt-4 p-6">
            <h2 className="text-lg sm:text-xl font-semibold leading-snug" aria-live="polite">{current.question}</h2>

            <fieldset className="mt-4" role="radiogroup" aria-label="Answer options">
              <legend className="sr-only">Choose one answer</legend>
              <ul className="space-y-2">
                {current.options.map((opt, i) => {
                  const isSelected = selected === i;
                  return (
                    <li key={i}>
                      <label
                        className={`w-full flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition hover:bg-slate-50 ${
                          isSelected ? "ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50" : "border-slate-300"
                        }`}
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleSelect(i); } }}
                      >
                        <input
                          type="radio"
                          name={`q-${current.id}`}
                          className="sr-only"
                          checked={isSelected}
                          onChange={() => handleSelect(i)}
                          aria-checked={isSelected}
                          aria-label={`Option ${i + 1}`}
                        />
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-300">
                          <span className={`h-3 w-3 rounded-full ${isSelected ? "bg-indigo-600" : "bg-transparent"}`} />
                        </span>
                        <span className="select-none text-sm sm:text-base">{opt}</span>
                        <span className="ml-auto text-xs text-slate-400">[{i + 1}]</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </fieldset>

            <div className="mt-6 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
              <div className="text-xs text-slate-500">Shortcuts: 1–4 select • Enter next • S skip</div>
              <div className="flex gap-2">
                <Button onClick={handleSkip} className="bg-white">Skip</Button>
                <Button onClick={() => handleNext(false)} disabled={!(selected !== null && selected !== undefined)} className={(selected !== null && selected !== undefined) ? "bg-indigo-600 text-white border-indigo-600" : ""}>
                  {isLast ? "Finish" : "Next"}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </Container>
  );
}
