import fs from 'node:fs';
import path from 'node:path';

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const rel = path.relative(process.cwd(), full);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walk(full, acc);
    } else {
      acc.push(rel);
    }
  }
  return acc;
}

const appDir = path.join(process.cwd(), 'app');
if (!fs.existsSync(appDir)) {
  console.error('App directory missing at', appDir);
  process.exit(1);
}

const files = walk(appDir).filter(f => /page\.(tsx|js)$/.test(f));
console.log('Discovered page files via raw fs walk:', files);

// Extra stats
for (const f of files) {
  const s = fs.statSync(path.join(process.cwd(), f));
  console.log(f, 'size', s.size, 'mtime', s.mtime.toISOString());
}
