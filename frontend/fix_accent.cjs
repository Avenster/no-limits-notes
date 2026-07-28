const fs = require('fs');
const file = 'app/pages/note.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/var\(--accent, #c9a24b\)/g, 'rgb(var(--accent, 201 162 75))');

// The string `var(--accent)` without a fallback occurs in a few places, replace those too:
content = content.replace(/var\(--accent\)/g, 'rgb(var(--accent))');

// Fix any double rgb() wrapping if it happened:
content = content.replace(/rgb\(rgb\(/g, 'rgb(').replace(/\)\)/g, ')');
// Special case for color-mix where we might have `rgb(rgb(var(...)))`
content = content.replace(/rgb\(rgb\(var\(--accent, 201 162 75\)\)\)/g, 'rgb(var(--accent, 201 162 75))');

fs.writeFileSync(file, content);
console.log("Fixed var(--accent) in note.tsx");
