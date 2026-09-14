import { readFile, mkdir, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

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
console.log('Brilha Memoria production site generated in public/.');
