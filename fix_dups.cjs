const fs = require('fs');
const files = [
  'src/routes/compare/$compareSlug.tsx', 
  'src/routes/facts/$factSlug.tsx', 
  'src/routes/faq.tsx', 
  'src/routes/resources/$resourceSlug.tsx', 
  'src/routes/why-choose-shailraj-travels.tsx'
];
files.forEach(file => {
  let f = fs.readFileSync(file, 'utf8');
  let lines = f.split('\n');
  let newLines = [];
  let found = false;
  for (let line of lines) {
    if (line.includes('import { SchemaMarkup }')) {
      if (!found) {
        newLines.push(line);
        found = true;
      }
    } else {
      newLines.push(line);
    }
  }
  fs.writeFileSync(file, newLines.join('\n'));
});
