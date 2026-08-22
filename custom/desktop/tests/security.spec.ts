import { describe, expect, it } from 'vitest'
import { isExternalWebUrl, isHarnessUrl } from '../src/security.ts'
import { parseDesktopReadyLine } from '../src/harness-process.ts'
import { pruneDanglingProfileFallback } from '../src/profile-fallback.ts'
import { existsSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

describe('desktop URL policy', () => {
  it('keeps only the active Harness origin inside the Electron window', () => {
    const origin = 'http://127.0.0.1:49152'
    expect(isHarnessUrl(`${origin}/sessions/1`, origin)).toBe(true)
    expect(isHarnessUrl('http://127.0.0.1:49153/', origin)).toBe(false)
    expect(isHarnessUrl('https://example.com/', origin)).toBe(false)
    expect(isHarnessUrl('not a url', origin)).toBe(false)
  })

  it('hands only HTTP(S) links to the operating system browser', () => {
    expect(isExternalWebUrl('https://example.com/')).toBe(true)
    expect(isExternalWebUrl('http://example.com/')).toBe(true)
    expect(isExternalWebUrl('file:///C:/secret.txt')).toBe(false)
    expect(isExternalWebUrl('javascript:alert(1)')).toBe(false)
  })
})

describe('desktop child readiness protocol', () => {
  it('accepts only a port-bearing IPv4 loopback endpoint', () => {
    expect(parseDesktopReadyLine('dsh desktop ready: http://127.0.0.1:49152')).toBe(
      'http://127.0.0.1:49152',
    )
    expect(parseDesktopReadyLine('dsh desktop ready: http://localhost:49152')).toBeUndefined()
    expect(parseDesktopReadyLine('dsh desktop ready: https://127.0.0.1:49152')).toBeUndefined()
    expect(parseDesktopReadyLine('unrelated log line')).toBeUndefined()
  })
})

describe('desktop profile fallback maintenance', () => {
  it('removes only dangling generated package links', () => {
    const root = mkdtempSync(join(tmpdir(), 'dsh-desktop-fallback-'))
    try {
      const modules = join(root, 'profiles', 'node_modules')
      const scope = join(modules, '@example')
      const liveTarget = join(root, 'live-package')
      mkdirSync(scope, { recursive: true })
      mkdirSync(liveTarget)
      writeFileSync(join(modules, 'ordinary-file'), 'keep\n')
      symlinkSync(liveTarget, join(modules, 'live-package'), 'junction')
      symlinkSync(join(root, 'missing-package'), join(modules, 'stale-package'), 'junction')
      symlinkSync(join(root, 'missing-scoped-package'), join(scope, 'stale'), 'junction')

      expect(pruneDanglingProfileFallback(root)).toBe(2)
      expect(existsSync(join(modules, 'ordinary-file'))).toBe(true)
      expect(existsSync(join(modules, 'live-package'))).toBe(true)
      expect(existsSync(join(modules, 'stale-package'))).toBe(false)
      expect(existsSync(join(scope, 'stale'))).toBe(false)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})
