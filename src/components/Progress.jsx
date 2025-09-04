import { clamp } from "../utils/helpers";


export default function Progress({ value, max = 100 }) {
const pct = clamp((value / max) * 100, 0, 100);
return (
<div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
<div className="h-full bg-indigo-500" style={{ width: `${pct}%` }} />
</div>
);
}