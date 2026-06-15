const fs = require('fs');
const path = require('path');

const replacements = [
  // from lib to backend/lib
  { from: /from\s+['"]\.\.\/\.\.\/lib\/([^'"]+)['"]/g, to: "from '../../backend/lib/$1'" },
  { from: /from\s+['"]\.\.\/\.\.\/\.\.\/lib\/([^'"]+)['"]/g, to: "from '../../../backend/lib/$1'" },
  { from: /from\s+['"]\.\.\/lib\/([^'"]+)['"]/g, to: "from '../backend/lib/$1'" },
  // Also components to frontend/components
  { from: /from\s+['"]\.\.\/\.\.\/components\/([^'"]+)['"]/g, to: "from '../../frontend/components/$1'" },
  { from: /from\s+['"]\.\.\/\.\.\/\.\.\/components\/([^'"]+)['"]/g, to: "from '../../../frontend/components/$1'" },
  { from: /from\s+['"]\.\.\/components\/([^'"]+)['"]/g, to: "from '../frontend/components/$1'" },
  // Features
  { from: /from\s+['"]\.\.\/\.\.\/features\/([^'"]+)['"]/g, to: "from '../../frontend/features/$1'" },
  { from: /from\s+['"]\.\.\/\.\.\/\.\.\/features\/([^'"]+)['"]/g, to: "from '../../../frontend/features/$1'" },
  { from: /from\s+['"]\.\.\/features\/([^'"]+)['"]/g, to: "from '../frontend/features/$1'" },
  // Types
  { from: /from\s+['"]\.\.\/types\/([^'"]+)['"]/g, to: "from '../frontend/types/$1'" },
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
        console.log(`Fixed lib/features/components imports in ${fullPath}`);
      }
    }
  }
}

processFilesDir('src/routes');
