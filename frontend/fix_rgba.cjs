const fs = require('fs');
const file = 'app/pages/note.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix `var(--border, rgba(255,255,255,0.08)` to `var(--border, rgba(255,255,255,0.08))`
// Look for var(--name, rgba(numbers)) that is missing a trailing `)`
content = content.replace(/var\((--[a-zA-Z0-9-]+),\s*rgba\(([0-9.,\s]+)\)(?!\))/g, 'var($1, rgba($2))');

fs.writeFileSync(file, content);
console.log("Fixed missing parens for var(..., rgba(...))");
