const fs = require('fs');
const file = 'app/pages/note.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/(boxShadow:\s*['"][^'"]*rgba\([0-9.,\s]+\))\)['"]/g, '$1\'');
content = content.replace(/(boxShadow:\s*['"][^'"]*rgba\([0-9.,\s]+\))\)[,]/g, '$1,');

fs.writeFileSync(file, content);
console.log("Fixed box shadows");
