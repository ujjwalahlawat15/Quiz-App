export default function Card({ children, className = "" }) {
return (
<div className={`bg-white shadow-sm rounded-2xl border border-slate-200 ${className}`}>{children}</div>
);
}