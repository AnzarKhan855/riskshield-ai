const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const docsDir = path.join(rootDir, 'docs');

const docFiles = [
  'README.md',
  ...fs.readdirSync(docsDir).filter(f => f.endsWith('.md')).map(f => path.join('docs', f))
];

console.log(`Auditing ${docFiles.length} documentation files for relative links...\n`);

let totalChecked = 0;
let errors = 0;

for (const relFile of docFiles) {
  const fullPath = path.join(rootDir, relFile);
  const content = fs.readFileSync(fullPath, 'utf8');
  const fileDir = path.dirname(fullPath);

  // Match markdown links [text](path)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    const linkTarget = match[2].trim();
    // Ignore internal anchor links (#something) and external URLs (http://, https://, mailto:)
    if (linkTarget.startsWith('#') || linkTarget.startsWith('http://') || linkTarget.startsWith('https://') || linkTarget.startsWith('mailto:')) {
      continue;
    }

    // Strip out any anchor fragment from the link
    const cleanTarget = linkTarget.split('#')[0];
    if (!cleanTarget) continue;

    totalChecked++;
    const resolvedPath = path.resolve(fileDir, cleanTarget);

    if (!fs.existsSync(resolvedPath)) {
      console.error(`❌ [BROKEN LINK in ${relFile}]: "${linkTarget}" -> Resolved to "${resolvedPath}" (NOT FOUND)`);
      errors++;
    }
  }
}

console.log(`\nChecked ${totalChecked} relative markdown links across all documentation files.`);
if (errors === 0) {
  console.log(`🎉 100% OF RELATIVE LINKS ARE VALID AND RESOLVE ON DISK!`);
} else {
  console.error(`Found ${errors} broken relative links.`);
  process.exit(1);
}
