// src/pages/ResultsPage.jsx
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Container from "../components/Container";
import Card from "../components/Card";
import Button from "../components/Button";

export default function ResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || (typeof window !== "undefined" ? JSON.parse(sessionStorage.getItem("lastResults") || "null") : null);

  // If no results, go back to setup
  useEffect(() => {
    if (!state || !Array.isArray(state.results)) {
      // small delay so user sees fallback UI then redirect if desired
    }
  }, [state]);

  if (!state || !Array.isArray(state.results)) {
    return (
      <Container>
        <Card className="p-8 text-center space-y-4">
          <div className="text-slate-700">No results to show.</div>
          <div className="flex justify-center">
            <Button onClick={() => navigate("/")}>Back to Setup</Button>
          </div>
        </Card>
      </Container>
    );
  }

  const { results, score, total } = state;
  const pct = Math.round((score / total) * 100);

  // clear session keys and restart
  function clearSessionAndRestart() {
    try {
      sessionStorage.removeItem("lastResults");
      Object.keys(sessionStorage).forEach((k) => {
        if (k.startsWith("quiz-session-v1-")) sessionStorage.removeItem(k);
      });
    } catch (e) {}
    navigate("/");
  }

  return (
    <Container>
      <div className="mx-auto max-w-3xl">
        {/* Summary card */}
        <div className="text-center my-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold">Quiz Results</h1>

          <div className="mt-6">
            <div className="text-7xl sm:text-8xl font-extrabold text-indigo-600 leading-none">{score}/{total}</div>
            <div className="mt-3 text-lg text-slate-600">You scored {pct}%</div>
            <div className="mt-4 text-slate-500">Keep practicing! <span aria-hidden>💪</span></div>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-4">Review:</h2>

        <div className="space-y-4 mb-8">
          {results.map((r, idx) => {
            const user = typeof r.selectedIndex === "number" ? r.options[r.selectedIndex] : null;
            const correct = r.options[r.correctIndex];
            const isCorrect = user === correct;

            return (
              <div
                key={r.questionId || idx}
                className="bg-white rounded-xl shadow-sm border border-slate-100 p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm text-slate-500 mb-2"> {idx + 1}. </div>
                    <div className="font-medium text-slate-800 max-w-[70ch]">{r.question}</div>
                  </div>
                </div>

                <div className="mt-3 grid sm:grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="text-slate-500 mb-1">Your answer</div>
                    <div className={isCorrect ? "text-emerald-700 font-medium" : "text-rose-600 font-medium"}>
                      {user ?? "Not answered"}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="text-slate-500 mb-1">Correct</div>
                    <div className="text-emerald-700 font-medium">{correct}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center gap-3 mb-12">
          {/* <Button onClick={() => navigate(-1)}>Back</Button> */}
          <Button className="bg-indigo-600 text-white border-indigo-600" onClick={clearSessionAndRestart}>Restart</Button>
        </div>
      </div>
    </Container>
  );
}
