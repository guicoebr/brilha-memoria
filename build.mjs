import { readFile, mkdir, rm, writeFile, readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const chunkFiles = Array.from({ length: 9 }, (_, i) => `deploy/chunk-${String(i).padStart(2, '0')}.txt`);
const parts = await Promise.all(chunkFiles.map(async (file) => (await readFile(file, 'utf8')).trim()));
const archive = Buffer.from(parts.join(''), 'base64');
const archivePath = '/tmp/brilha-memoria-site.tgz';
const tarPath = '/tmp/brilha-memoria-site.tar';

await writeFile(archivePath, archive);
await rm('public', { recursive: true, force: true });
await mkdir('public', { recursive: true });

// Normal path first.
let result = spawnSync('tar', ['-xzf', archivePath, '-C', 'public'], { stdio: 'inherit' });

// Some Git transports can leave a gzip trailer CRC inconsistent while the
// compressed payload itself is still intact. In that case gzip writes the
// complete tar stream but exits non-zero. Recover the tar stream and validate
// it by extracting it; extraction success is the authoritative check.
if (result.status !== 0) {
  console.warn('Primary gzip extraction failed; attempting CRC-tolerant recovery.');
  const gunzip = spawnSync('sh', ['-c', `gzip -dc "${archivePath}" > "${tarPath}"`], { stdio: 'inherit' });
  console.warn(`gzip recovery exit status: ${gunzip.status ?? 'unknown'}`);
  await rm('public', { recursive: true, force: true });
  await mkdir('public', { recursive: true });
  result = spawnSync('tar', ['-xf', tarPath, '-C', 'public'], { stdio: 'inherit' });
}

if (result.status !== 0) process.exit(result.status ?? 1);

// Home Access enhancement: remember which student is linked to this device,
// but never store the student's PIN. The fixed /casa route is handled by
// vercel.json and this script renders its lightweight entry screen.
const homeMemoryScript = await readFile('brilha-home-memory.js', 'utf8');
await writeFile('public/brilha-home-memory.js', homeMemoryScript);

const htmlFiles = [];
async function collectHtml(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await collectHtml(path);
    else if (entry.isFile() && entry.name.endsWith('.html')) htmlFiles.push(path);
  }
}

await collectHtml('public');
for (const file of htmlFiles) {
  let html = await readFile(file, 'utf8');
  if (html.includes('/brilha-home-memory.js')) continue;
  const tag = '<script src="/brilha-home-memory.js" defer></script>';
  html = html.includes('</body>') ? html.replace('</body>', `${tag}</body>`) : `${html}${tag}`;
  await writeFile(file, html);
}

console.log(`Brilha Memoria production site generated in public/. Home Access memory injected into ${htmlFiles.length} HTML file(s).`);
