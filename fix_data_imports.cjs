const fs = require('fs');
const path = require('path');

const replacements = [
  { from: /from\s+['"]\.\.\/data\/([^'"]+)['"]/g, to: "from '../frontend/data/$1'" },
  { from: /from\s+['"]\.\.\/\.\.\/data\/([^'"]+)['"]/g, to: "from '../../frontend/data/$1'" },
  { from: /from\s+['"]\.\.\/\.\.\/\.\.\/data\/([^'"]+)['"]/g, to: "from '../../../frontend/data/$1'" },
  { from: /from\s+['"]\.\.\/config\/([^'"]+)['"]/g, to: "from '../frontend/config/$1'" },
  { from: /from\s+['"]\.\.\/\.\.\/config\/([^'"]+)['"]/g, to: "from '../../frontend/config/$1'" }
];

function processFilesDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processFilesDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;

      for (const rule of replacements) {
        content = content.replace(rule.from, rule.to);
      }

      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Fixed data imports in ${fullPath}`);
      }
    }
  }
}

processFilesDir('src/routes');
