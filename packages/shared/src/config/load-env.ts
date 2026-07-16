import { config } from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';

function findMonorepoRoot(startDir = process.cwd()): string | null {
  let dir = startDir;
  for (let i = 0; i < 10; i++) {
    if (existsSync(resolve(dir, 'pnpm-workspace.yaml'))) {
      return dir;
    }
    const parent = resolve(dir, '..');
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

let loaded = false;

/** Load `.env` from the monorepo root (idempotent). */
export function loadEnv(): void {
  if (loaded) return;

  const root = findMonorepoRoot();
  if (!root) return;

  const envPath = resolve(root, '.env');
  if (existsSync(envPath)) {
    config({ path: envPath });
    loaded = true;
  }
}
