import { useEffect, useState } from "react";


export default function useCountdown(seconds, deps = []) {
const [timeLeft, setTimeLeft] = useState(seconds);
useEffect(() => setTimeLeft(seconds), deps);


useEffect(() => {
if (timeLeft <= 0) return;
const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
return () => clearInterval(id);
}, [timeLeft]);


return [timeLeft, setTimeLeft];
}