export const decodeHTML = (str) => {
const txt = document.createElement("textarea");
txt.innerHTML = str;
return txt.value;
};


export const shuffle = (arr) => arr
.map((v) => ({ key: Math.random(), v }))
.sort((a, b) => a.key - b.key)
.map((o) => o.v);


export const clamp = (n, min, max) => Math.max(min, Math.min(max, n));