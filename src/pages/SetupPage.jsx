import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "../components/Container";
import Card from "../components/Card";
import Button from "../components/Button";
import { clamp } from "../utils/helpers";

export default function SetupPage() {
  const navigate = useNavigate();
  const [source, setSource] = useState("api"); // 'api' | 'local'
  const [difficulty, setDifficulty] = useState("easy");
  const [amount, setAmount] = useState(10);
  const [timer, setTimer] = useState(30); // seconds per question

  const startQuiz = () => {
    const params = new URLSearchParams({
      source,
      difficulty,
      amount: String(amount),
      timer: String(timer),
    });
    navigate(`/quiz?${params.toString()}`);
  };

  return (
    <Container>
      <Card className="p-6">
        <h1 className="text-2xl font-semibold mb-2">Welcome to the Quiz</h1>
        <p className="text-slate-600 mb-6">
          Choose your preferences and start. You can use the Open Trivia DB API
          or the built-in local set.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Data Source</label>
            <div className="flex gap-2">
              <Button
                className={
                  source === "api"
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : ""
                }
                onClick={() => setSource("api")}
              >
                API
              </Button>
              <Button
                className={
                  source === "local"
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : ""
                }
                onClick={() => setSource("local")}
              >
                Local
              </Button>
            </div>
            {source === "api" ? (
              <p className="text-xs text-slate-500">
                Requires internet. Handles loading & errors. Falls back to Local
                if needed.
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                Uses the built-in 10-question set included in this app.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <p className="text-xs text-slate-500">
              API only; local set is mixed difficulty.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Number of Questions
            </label>
            <input
              type="number"
              min={5}
              max={10}
              value={amount}
              onChange={(e) =>
                setAmount(
                  clamp(parseInt(e.target.value || "10", 10), 5, 10)
                )
              }
              className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-slate-500">Pick between 5 and 10.</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Timer per Question (seconds)
            </label>
            <input
              type="number"
              min={0}
              max={120}
              value={timer}
              onChange={(e) =>
                setTimer(
                  clamp(parseInt(e.target.value || "30", 10), 0, 120)
                )
              }
              className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-slate-500">
              Set 0 to disable the timer.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-slate-500">
            Bonus: High score is saved locally per mode.
          </div>
          <Button
            className="bg-indigo-600 text-white border-indigo-600"
            onClick={startQuiz}
            aria-label="Start Quiz"
          >
            Start Quiz
          </Button>
        </div>
      </Card>
    </Container>
  );
}
