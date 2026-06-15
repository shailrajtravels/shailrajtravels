const fs = require('fs');

const files = [
  'src/routes/compare/$compareSlug.tsx',
  'src/routes/facts/$factSlug.tsx',
  'src/routes/faq.tsx',
  'src/routes/resources/$resourceSlug.tsx',
  'src/routes/why-choose-shailraj-travels.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Remove SchemaMarkup from seo imports
  content = content.replace(/,\s*SchemaMarkup/g, '');
  content = content.replace(/SchemaMarkup\s*,/g, '');
  
  // Determine relative path to src/frontend/components
  const depth = file.split('/').length - 2;
  const relativePath = '../'.repeat(depth) + 'frontend/components/SchemaMarkup';
  
  // Add SchemaMarkup import
  content = `import { SchemaMarkup } from '${relativePath}';\n` + content;
  
  fs.writeFileSync(file, content);
});
console.log('Fixed SchemaMarkup imports');
