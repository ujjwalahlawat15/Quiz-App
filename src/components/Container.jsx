import { Link } from "react-router-dom";


export default function Container({ children }) {
return (
<div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
<header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/60 border-b border-slate-200">
<div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between">
<Link to="/" className="font-semibold tracking-tight text-lg">Quiz App</Link>
<nav className="text-sm text-slate-600">
<a href="https://opentdb.com/" target="_blank" rel="noreferrer" className="hover:underline">Open Trivia DB</a>
</nav>
</div>
</header>
<main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
{/* <footer className="mx-auto max-w-3xl px-4 py-8 text-center text-xs text-slate-500">Built with React, Tailwind, and Framer Motion.</footer> */}
</div>
);
}