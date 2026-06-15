const fs = require('fs');
const path = require('path');

const replacements = [
  // from src/routes/* to src/frontend/types/
  { from: /from\s+['"]\.\.\/\.\.\/types\/([^'"]+)['"]/g, to: "from '../../frontend/types/$1'" },
  { from: /from\s+['"]\.\.\/types\/([^'"]+)['"]/g, to: "from '../frontend/types/$1'" },
  
  // from src/routes/* to src/frontend/data/
  { from: /from\s+['"]\.\.\/\.\.\/data\/([^'"]+)['"]/g, to: "from '../../frontend/data/$1'" },
  { from: /from\s+['"]\.\.\/data\/([^'"]+)['"]/g, to: "from '../frontend/data/$1'" },

  // from src/frontend/components/* to src/frontend/types/
  { from: /from\s+['"]\.\.\/\.\.\/types\/([^'"]+)['"]/g, to: "from '../../types/$1'" },
  { from: /from\s+['"]\.\.\/types\/([^'"]+)['"]/g, to: "from '../types/$1'" },
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
      
      // Quick fix for require inside blog $slug.tsx
      content = content.replace(/require\(['"]\.\.\/\.\.\/data\/tours\.en['"]\)/g, "require('../../frontend/features/tours/data')");
      // Fix imports inside components ported from old src/components
      content = content.replace(/from\s+['"]\.\.\/data\/([^'"]+)['"]/g, "from '../data/$1'");

      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Fixed imports in ${fullPath}`);
      }
    }
  }
}

processFilesDir('src/routes');
processFilesDir('src/frontend/components');
processFilesDir('src/frontend/data');
