import { BrowserRouter, Routes, Route } from "react-router-dom";
import SetupPage from "./pages/SetupPage";
import QuizPage from "./pages/QuizPage";
import ResultsPage from "./pages/ResultsPage";
import NotFound from "./pages/NotFound";


export default function App() {
return (
<BrowserRouter>
<Routes>
<Route path="/" element={<SetupPage />} />
<Route path="/quiz" element={<QuizPage />} />
<Route path="/results" element={<ResultsPage />} />
<Route path="*" element={<NotFound />} />
</Routes>
</BrowserRouter>
);
}