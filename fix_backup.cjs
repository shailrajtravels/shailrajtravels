const fs = require('fs');

function fixBackup(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/from '\.\.\/lib\/schema-generators'/g, "from '../../src/backend/lib/schema-generators'");
  content = content.replace(/from '\.\.\/types\/tour'/g, "from '../../src/frontend/types/tour'");
  fs.writeFileSync(file, content, 'utf8');
}

fixBackup('backup_seo/data/tours.en.ts');
fixBackup('backup_seo/data/tours.mr.ts');
