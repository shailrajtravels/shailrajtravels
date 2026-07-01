const fs = require('fs');
const path = require('path');
function processDir(d) {
  fs.readdirSync(d).forEach(f => {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) {
      processDir(p);
    } else if (p.endsWith('.ts') || p.endsWith('.tsx')) {
      let c = fs.readFileSync(p, 'utf8');
      let o = c;
      c = c.replace(/from\s+['"](\.\.\/)+((backend|frontend).*?)['"]/g, "from '@/$2'");
      if (c !== o) {
        fs.writeFileSync(p, c);
        console.log('Fixed', p);
      }
    }
  });
}
processDir('src');
