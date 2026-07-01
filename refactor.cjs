const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const moves = [
  // FRONTEND CORE
  { from: 'src/frontend/components/Navbar.tsx', to: 'src/frontend/core/Navbar.tsx' },
  { from: 'src/frontend/components/Footer.tsx', to: 'src/frontend/core/Footer.tsx' },
  { from: 'src/frontend/features/core', to: 'src/frontend/core' }, // Merge existing core
  
  // FRONTEND SHARED
  { from: 'src/frontend/ui', to: 'src/frontend/shared/ui' },
  { from: 'src/frontend/components/ui', to: 'src/frontend/shared/ui' },
  { from: 'src/frontend/hooks', to: 'src/frontend/shared/hooks' },
  { from: 'src/frontend/types', to: 'src/frontend/shared/types' },
  { from: 'src/frontend/assets', to: 'src/frontend/shared/assets' },
  { from: 'src/frontend/data', to: 'src/frontend/shared/data' },
  { from: 'src/data', to: 'src/frontend/shared/data' },
  { from: 'src/frontend/config', to: 'src/frontend/shared/config' },
  { from: 'src/frontend/templates', to: 'src/frontend/shared/templates' },
  
  // FRONTEND COMPONENTS -> FEATURES (leftovers)
  // We will just rename components to shared/components for any stragglers
  { from: 'src/frontend/components', to: 'src/frontend/shared/components' },

  // BACKEND INFRASTRUCTURE
  { from: 'src/backend/database', to: 'src/backend/infrastructure/database' },
  { from: 'src/backend/repositories', to: 'src/backend/infrastructure/repositories' },
  { from: 'src/backend/lib/whatsapp.ts', to: 'src/backend/infrastructure/whatsapp.ts' },
  { from: 'src/backend/lib/whatsapp-api.ts', to: 'src/backend/infrastructure/whatsapp-api.ts' },
  { from: 'src/backend/lib/redis.ts', to: 'src/backend/infrastructure/redis.ts' },
  { from: 'src/backend/lib/auth.ts', to: 'src/backend/infrastructure/auth.ts' },
  { from: 'src/backend/lib/token.ts', to: 'src/backend/infrastructure/token.ts' },
  
  // BACKEND FEATURES
  { from: 'src/backend/lib/tours.ts', to: 'src/backend/features/tours.ts' },
  { from: 'src/backend/lib/custom-blogs.ts', to: 'src/backend/features/custom-blogs.ts' },
  { from: 'src/backend/lib/packages.ts', to: 'src/backend/features/packages.ts' },
  { from: 'src/backend/lib/reviews.ts', to: 'src/backend/features/reviews.ts' },
  { from: 'src/backend/lib/seo.ts', to: 'src/backend/features/seo.ts' },
  
  // BACKEND SHARED
  { from: 'src/backend/lib/utils.ts', to: 'src/backend/shared/utils.ts' },
  { from: 'src/backend/lib/memory-cache.ts', to: 'src/backend/shared/memory-cache.ts' },
  { from: 'src/backend/lib/lovable-error-reporting.ts', to: 'src/backend/shared/lovable-error-reporting.ts' },
  { from: 'src/backend/lib/schema-generators.ts', to: 'src/backend/shared/schema-generators.ts' },
  
  // Remaining lib folder if any
  { from: 'src/backend/scripts', to: 'src/backend/shared/scripts' },
];

function moveFileOrDir(fromPath, toPath) {
  const absFrom = path.join(__dirname, fromPath);
  const absTo = path.join(__dirname, toPath);
  
  if (!fs.existsSync(absFrom)) return;
  
  if (fs.existsSync(absTo)) {
    if (fs.statSync(absTo).isDirectory() && fs.statSync(absFrom).isDirectory()) {
      // Merge dirs
      const items = fs.readdirSync(absFrom);
      for (const item of items) {
        moveFileOrDir(path.join(fromPath, item), path.join(toPath, item));
      }
      fs.rmdirSync(absFrom);
      return;
    }
  } else {
    fs.mkdirSync(path.dirname(absTo), { recursive: true });
  }
  
  fs.renameSync(absFrom, absTo);
  console.log(`Moved ${fromPath} to ${toPath}`);
}

moves.forEach(m => moveFileOrDir(m.from, m.to));

const importMappings = [
  // FRONTEND CORE
  { match: /\/frontend\/features\/core/g, replace: '/frontend/core' },
  { match: /\/frontend\/components\/Navbar/g, replace: '/frontend/core/Navbar' },
  { match: /\/frontend\/components\/Footer/g, replace: '/frontend/core/Footer' },

  // FRONTEND SHARED
  { match: /\/frontend\/ui/g, replace: '/frontend/shared/ui' },
  { match: /\/frontend\/components\/ui/g, replace: '/frontend/shared/ui' },
  { match: /\/frontend\/hooks/g, replace: '/frontend/shared/hooks' },
  { match: /\/frontend\/types/g, replace: '/frontend/shared/types' },
  { match: /\/frontend\/assets/g, replace: '/frontend/shared/assets' },
  { match: /\/frontend\/data/g, replace: '/frontend/shared/data' },
  { match: /\/data\//g, replace: '/frontend/shared/data/' },
  { match: /\/frontend\/config/g, replace: '/frontend/shared/config' },
  { match: /\/frontend\/templates/g, replace: '/frontend/shared/templates' },
  { match: /\/frontend\/components/g, replace: '/frontend/shared/components' },

  // BACKEND INFRASTRUCTURE
  { match: /\/backend\/database/g, replace: '/backend/infrastructure/database' },
  { match: /\/backend\/repositories/g, replace: '/backend/infrastructure/repositories' },
  { match: /\/backend\/lib\/(whatsapp|whatsapp-api|redis|auth|token)/g, replace: '/backend/infrastructure/$1' },
  
  // BACKEND FEATURES
  { match: /\/backend\/lib\/(tours|custom-blogs|packages|reviews|seo)/g, replace: '/backend/features/$1' },
  
  // BACKEND SHARED
  { match: /\/backend\/lib\/(utils|memory-cache|lovable-error-reporting|schema-generators)/g, replace: '/backend/shared/$1' },
  { match: /\/backend\/scripts/g, replace: '/backend/shared/scripts' },
  { match: /\/backend\/lib/g, replace: '/backend/shared' },
];

function convertToAbsoluteAlias(filePath, importPath) {
  if (importPath.startsWith('@/')) return importPath;
  if (!importPath.startsWith('.')) return importPath;
  
  const fileDir = path.dirname(filePath);
  const absoluteImportPath = path.resolve(fileDir, importPath);
  const rootSrcDir = path.join(__dirname, 'src');
  
  if (absoluteImportPath.startsWith(rootSrcDir)) {
    const relativeToSrc = path.relative(rootSrcDir, absoluteImportPath);
    // ALWAYS use forward slashes for imports
    return '@/' + relativeToSrc.replace(/\\/g, '/');
  }
  
  return importPath;
}

function processFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processFiles(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;

      // 1. Convert relative to absolute alias (@/)
      content = content.replace(/from\s+['"]([^'"]+)['"]/g, (match, p1) => {
        const absolute = convertToAbsoluteAlias(fullPath, p1);
        return `from '${absolute}'`;
      });
      // also match dynamic imports: import('...')
      content = content.replace(/import\(['"]([^'"]+)['"]\)/g, (match, p1) => {
        const absolute = convertToAbsoluteAlias(fullPath, p1);
        return `import('${absolute}')`;
      });

      // 2. Apply directory renames
      for (const mapping of importMappings) {
        content = content.replace(mapping.match, mapping.replace);
      }

      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated imports in ${fullPath}`);
      }
    }
  }
}

processFiles(srcDir);
console.log('Refactoring complete!');
