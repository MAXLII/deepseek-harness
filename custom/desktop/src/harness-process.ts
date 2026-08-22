/** Manage the standard-Node child process that owns the local Harness server. */

import { spawn, type ChildProcess } from 'node:child_process'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

const READY_PREFIX = 'dsh desktop ready: '

export interface DesktopHarnessProcess {
  url: string
  stop(): Promise<void>
}

/** Return a validated loopback URL from the child readiness line. */
export function parseDesktopReadyLine(line: string): string | undefined {
  if (!line.startsWith(READY_PREFIX)) return undefined
  try {
    const url = new URL(line.slice(READY_PREFIX.length).trim())
    if (url.protocol !== 'http:' || url.hostname !== '127.0.0.1' || url.port === '') return undefined
    return url.origin
  } catch {
    return undefined
  }
}

/** Select the bundled Node executable in an installed app, or PATH Node in development. */
export function desktopNodeExecutable(isPackaged: boolean, resourcesPath: string): string {
  if (process.env.DSH_DESKTOP_NODE !== undefined) return process.env.DSH_DESKTOP_NODE
  return isPackaged ? join(resourcesPath, 'node', 'node.exe') : 'node'
}

function desktopChildEntry(): string {
  const require = createRequire(import.meta.url)
  const manifest = require.resolve('@deepseek-ai/dsh/package.json')
  return join(dirname(manifest), 'lib', 'desktop-child.js')
}

/** Start Harness and wait until its loopback Web endpoint is ready. */
export function startDesktopHarnessProcess(options: {
  nodeExecutable: string
  cwd: string
  timeoutMs?: number
}): Promise<DesktopHarnessProcess> {
  const child = spawn(options.nodeExecutable, [desktopChildEntry()], {
    cwd: options.cwd,
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
    windowsHide: true,
  })
  const timeoutMs = options.timeoutMs ?? 60_000
  let settled = false
  let stdoutBuffer = ''
  let diagnostics = ''

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      fail(new Error(`Harness did not become ready within ${String(timeoutMs)} ms.\n${diagnostics}`))
    }, timeoutMs)

    function cleanupStartupListeners(): void {
      clearTimeout(timer)
      child.off('error', fail)
      child.off('exit', exitedBeforeReady)
    }

    function fail(error: Error): void {
      if (settled) return
      settled = true
      cleanupStartupListeners()
      child.kill()
      reject(error)
    }

    function exitedBeforeReady(code: number | null, signal: NodeJS.Signals | null): void {
      fail(new Error(
        `Harness exited before it became ready (code ${String(code)}, signal ${String(signal)}).\n${diagnostics}`,
      ))
    }

    child.stderr?.on('data', (chunk: Buffer) => {
      diagnostics = `${diagnostics}${chunk.toString('utf8')}`.slice(-16_384)
    })
    child.stdout?.on('data', (chunk: Buffer) => {
      stdoutBuffer += chunk.toString('utf8')
      const lines = stdoutBuffer.split(/\r?\n/u)
      stdoutBuffer = lines.pop() ?? ''
      for (const line of lines) {
        const url = parseDesktopReadyLine(line)
        if (url === undefined || settled) continue
        settled = true
        cleanupStartupListeners()
        resolve({ url, stop: () => stopChild(child) })
      }
    })
    child.on('error', fail)
    child.on('exit', exitedBeforeReady)
  })
}

async function stopChild(child: ChildProcess): Promise<void> {
  if (child.exitCode !== null || child.signalCode !== null) return
  await new Promise<void>((resolve) => {
    const forceTimer = setTimeout(() => {
      child.kill()
    }, 10_000)
    child.once('exit', () => {
      clearTimeout(forceTimer)
      resolve()
    })
    if (child.connected) child.send('dsh:shutdown', (error) => {
      if (error !== null) child.kill()
    })
    else child.kill()
  })
}
