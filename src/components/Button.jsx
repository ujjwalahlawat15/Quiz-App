export default function Button({ children, className = "", disabled, onClick, type = "button", ariaLabel }) {
return (
<button
type={type}
disabled={disabled}
aria-label={ariaLabel}
onClick={onClick}
className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium border border-slate-300 shadow-sm hover:shadow transition active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
>
{children}
</button>
);
}