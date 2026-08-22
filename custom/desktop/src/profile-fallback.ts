/** Maintenance for the generated profile module fallback on desktop startup. */

import { existsSync, lstatSync, readdirSync, unlinkSync } from 'node:fs'
import type { Dirent, Stats } from 'node:fs'
import { join } from 'node:path'

function pruneEntry(path: string): number {
  let stat: Stats
  try {
    stat = lstatSync(path)
  } catch {
    return 0
  }
  if (!stat.isSymbolicLink() || existsSync(path)) return 0
  unlinkSync(path)
  return 1
}

/**
 * Remove dangling links from the generated `$DSH_HOME/profiles/node_modules`
 * fallback without touching real directories or live package links.
 * @param dshHome - resolved Harness home directory.
 * @returns the number of stale links removed.
 */
export function pruneDanglingProfileFallback(dshHome: string): number {
  const modules = join(dshHome, 'profiles', 'node_modules')
  let entries: Dirent[]
  try {
    entries = readdirSync(modules, { withFileTypes: true })
  } catch {
    return 0
  }

  let removed = 0
  for (const entry of entries) {
    const path = join(modules, entry.name)
    if (entry.name.startsWith('@') && entry.isDirectory() && !entry.isSymbolicLink()) {
      for (const scoped of readdirSync(path, { withFileTypes: true })) {
        removed += pruneEntry(join(path, scoped.name))
      }
      continue
    }
    removed += pruneEntry(path)
  }
  return removed
}
