import { readFile, mkdir, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const chunkFiles = Array.from({ length: 9 }, (_, i) => `deploy/chunk-${String(i).padStart(2, '0')}.txt`);
const parts = await Promise.all(chunkFiles.map(async (file) => (await readFile(file, 'utf8')).trim()));
const archive = Buffer.from(parts.join(''), 'base64');
const archivePath = '/tmp/brilha-memoria-site.tgz';
await writeFile(archivePath, archive);
await rm('public', { recursive: true, force: true });
await mkdir('public', { recursive: true });
const result = spawnSync('tar', ['-xzf', archivePath, '-C', 'public'], { stdio: 'inherit' });
if (result.status !== 0) process.exit(result.status ?? 1);
console.log('Brilha Memoria production site generated in public/.');
