import { shuffle } from "./helpers";


export async function fetchApiQuestions({ amount = 10, difficulty = "easy" }) {
const url = `https://opentdb.com/api.php?amount=${amount}&type=multiple&encode=url3986&difficulty=${difficulty}`;
const res = await fetch(url, { cache: "no-store" });
if (!res.ok) throw new Error(`Network error: ${res.status}`);
const data = await res.json();
if (!data || data.response_code !== 0 || !Array.isArray(data.results)) {
throw new Error("Invalid API response");
}
const normalized = data.results.map((q, i) => {
const correct = decodeURIComponent(q.correct_answer);
const incorrect = q.incorrect_answers.map((a) => decodeURIComponent(a));
const options = shuffle([correct, ...incorrect]);
const correctIndex = options.indexOf(correct);
return {
id: `api-${i}-${q.category}-${q.difficulty}`,
question: decodeURIComponent(q.question),
options,
correctIndex,
};
});
return normalized;
}