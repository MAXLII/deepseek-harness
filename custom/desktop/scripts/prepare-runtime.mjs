import { cp, mkdir, readFile, readdir, rm } from 'node:fs/promises'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

if (process.platform !== 'win32') {
  throw new Error('The current desktop packaging target requires a Windows Node runtime.')
}

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const workspaceRoot = resolve(packageRoot, '..', '..')
const buildRoot = resolve(packageRoot, 'build')
if (dirname(buildRoot) !== packageRoot || basename(buildRoot) !== 'build') {
  throw new Error(`Refusing to replace unexpected build directory: ${buildRoot}`)
}

await rm(buildRoot, { recursive: true, force: true })
await mkdir(join(buildRoot, 'node'), { recursive: true })
await cp(process.execPath, join(buildRoot, 'node', 'node.exe'))

async function childDirectories(parent) {
  return (await readdir(parent, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(parent, entry.name))
}

const packageDirectories = [
  ...(await childDirectories(join(workspaceRoot, 'vendor'))),
  ...(await Promise.all(
    (await childDirectories(join(workspaceRoot, 'packages'))).map(childDirectories),
  )).flat(),
  resolve(workspaceRoot, 'native', 'landlock-run'),
  ...(await childDirectories(join(workspaceRoot, 'native', 'landlock-run', 'packages'))),
  resolve(workspaceRoot, 'apps', 'cli'),
]

let copied = 0
for (const source of packageDirectories) {
  let manifest
  try {
    manifest = JSON.parse(await readFile(join(source, 'package.json'), 'utf8'))
  } catch {
    continue
  }
  if (typeof manifest.name !== 'string' || !manifest.name.startsWith('@deepseek-ai/')) continue
  const packageName = manifest.name.slice('@deepseek-ai/'.length)
  const target = join(buildRoot, 'runtime', '@deepseek-ai', packageName)
  await cp(source, target, {
    recursive: true,
    filter(candidate) {
      const name = basename(candidate)
      return !['node_modules', 'src', 'tests', 'test', 'coverage', '.turbo'].includes(name)
        && !name.endsWith('.tsbuildinfo')
        && !name.endsWith('.md')
        && !name.endsWith('.i18n.yaml')
    },
  })
  copied += 1
}

process.stdout.write(`Bundled Node runtime and ${String(copied)} first-party packages.\n`)
