const fs = require('fs');
let f = fs.readFileSync('src/routes/resources/$resourceSlug.tsx', 'utf8');

f = f.replace(/import \{ tours \} from '\.\.\/\.\.\/data\/tours\.en';/g, "import { getToursFn } from '../../backend/lib/tours';");
f = f.replace(/from '\.\.\/\.\.\/data\/resources'/g, "from '../../frontend/data/resources'");
f = f.replace(/from '\.\.\/\.\.\/lib\/seo'/g, "from '../../backend/lib/seo'");
f = f.replace(/import \{ SchemaMarkup \}.*?;\n/g, "");
f = f.replace(/(import .*?['"].*?['"];)/, "$1\nimport { SchemaMarkup } from '../../frontend/components/SchemaMarkup';\n");

f = f.replace(/loader: \(\{ params \}\) => \{[\s\S]*?return resource;\n  \},/g, `loader: async ({ params }) => {
    const resource = resources.find(r => r.slug === params.resourceSlug);
    if (!resource) throw notFound();
    const allTours = await getToursFn();
    const linkedTours = allTours.filter((t: any) => resource.relatedTours.includes(t.slug));
    return { resource, linkedTours };
  },`);

f = f.replace(/const resource = Route\.useLoaderData\(\);\n\s*const linkedTours = tours\.filter\(t => resource\.relatedTours\.includes\(t\.slug\)\);/g, "const { resource, linkedTours } = Route.useLoaderData() as any;");

fs.writeFileSync('src/routes/resources/$resourceSlug.tsx', f);
console.log('Fixed resources route');
