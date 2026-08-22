#!/usr/bin/env node
/**
 * Private child-process entry used by the desktop host. Running the Web
 * profile in a standard Node process preserves the loader and native-module
 * behavior of the CLI while Electron remains a small, isolated UI shell.
 * @module @deepseek-ai/dsh/desktop-child
 */

import { loadLayeredEnv } from '@deepseek-ai/dsh-app-boot'
import type {} from '@deepseek-ai/dsh-host-webserver'
import { runProfile } from './profile-boot.ts'

const { ctx, shutdown } = await runProfile({
  environment: loadLayeredEnv('dsh'),
  profile: 'web',
  patchFiles: [],
  args: ['--host', '127.0.0.1', '--port', '0'],
})

process.stdout.write(`dsh desktop ready: http://127.0.0.1:${String(ctx.webServer.port)}\n`)

let stopping: Promise<void> | undefined

function stop(): Promise<void> {
  stopping ??= shutdown.shutdown(0).finally(() => {
    if (process.connected) process.disconnect()
  })
  return stopping
}

process.on('message', (message: unknown) => {
  if (message !== 'dsh:shutdown') return
  void stop()
})
