const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

walk('src/routes').forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Replace SchemaMarkup SEO imports back to backend/lib/seo
  const reSEO = /import\s+\{([^}]*generateSEO[^}]*)\}\s+from\s+['"]([^'"]+)['"]/g;
  content = content.replace(reSEO, (match, p1, p2) => {
    if (p2.includes('backend/lib/seo') || p2.includes('frontend/components/SchemaMarkup')) {
      const depth = file.split('/').length - 2;
      const prefix = depth === 0 ? './' : '../'.repeat(depth);
      changed = true;
      return 'import {' + p1 + '} from \'' + prefix + 'backend/lib/seo\'';
    }
    return match;
  });

  const reHref = /import\s+\{([^}]*generateHreflangLinks[^}]*)\}\s+from\s+['"]([^'"]+)['"]/g;
  content = content.replace(reHref, (match, p1, p2) => {
    if (p2.includes('backend/lib/seo') || p2.includes('frontend/components/SchemaMarkup')) {
      const depth = file.split('/').length - 2;
      const prefix = depth === 0 ? './' : '../'.repeat(depth);
      changed = true;
      return 'import {' + p1 + '} from \'' + prefix + 'backend/lib/seo\'';
    }
    return match;
  });

  // Also fix SchemaMarkup import if it's currently broken (e.g. backend/lib/seo or duplicate)
  // Let's just fix it if it's backend/lib/seo
  const reSchema = /import\s+\{\s*SchemaMarkup\s*\}\s+from\s+['"]([^'"]+backend\/lib\/seo)['"]/g;
  content = content.replace(reSchema, (match, p1) => {
    const depth = file.split('/').length - 2;
    const prefix = depth === 0 ? './' : '../'.repeat(depth);
    changed = true;
    return 'import { SchemaMarkup } from \'' + prefix + 'frontend/components/SchemaMarkup\'';
  });

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
  }
});
