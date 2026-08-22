/** URL policy shared by the Electron navigation handlers and unit tests. */

/** Return whether `candidate` belongs to the active loopback Harness origin. */
export function isHarnessUrl(candidate: string, harnessOrigin: string): boolean {
  try {
    return new URL(candidate).origin === harnessOrigin
  } catch {
    return false
  }
}

/** Return whether a URL may be handed to the operating system browser. */
export function isExternalWebUrl(candidate: string): boolean {
  try {
    const protocol = new URL(candidate).protocol
    return protocol === 'https:' || protocol === 'http:'
  } catch {
    return false
  }
}
