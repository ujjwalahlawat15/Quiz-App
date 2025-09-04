import { useEffect } from "react";


export default function useKeyDown(handler) {
useEffect(() => {
const onKey = (e) => handler(e);
window.addEventListener("keydown", onKey);
return () => window.removeEventListener("keydown", onKey);
}, [handler]);
}