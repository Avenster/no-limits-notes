const fs = require('fs');
const file = 'app/pages/note.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix `rgb(var(--accent, 201 162 75)` that is missing a closing `)`
content = content.replace(/rgb\(var\(--accent,\s*201\s*162\s*75\)(?!\))/g, 'rgb(var(--accent, 201 162 75))');

// Fix `color-mix` with broken `rgba(...)` that was missed
// e.g. `rgba(255,255,255,0.08), color-mix` -> `rgba(255,255,255,0.08)), color-mix`
content = content.replace(/rgba\(([0-9.,\s]+)\)(?=[,\s]*color-mix)/g, 'rgba($1))');

// Fix `rgba` at the end of a line or string that lacks a `)`
content = content.replace(/rgba\(([0-9.,\s]+)\)(?=['"])/g, 'rgba($1))');

fs.writeFileSync(file, content);
console.log("Fixed more missing parens");
