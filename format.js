const fs = require('fs');

let c = fs.readFileSync('src/lib/emailTemplates.ts', 'utf8');

c = c.replace(/font-family: Georgia, 'Times New Roman', Times, serif;/g, "font-family: Arial, Helvetica, sans-serif;");

fs.writeFileSync('src/lib/emailTemplates.ts', c);
