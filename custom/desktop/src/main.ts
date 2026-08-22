/**
 * Electron host for DeepSeek Harness. The main process owns the local Web
 * profile, exposes no Node API to the renderer, and restricts navigation to
 * the ephemeral loopback origin selected during startup.
 */

import { app, BrowserWindow, dialog, session, shell } from 'electron'
import { join } from 'node:path'
import {
  desktopNodeExecutable,
  startDesktopHarnessProcess,
  type DesktopHarnessProcess,
} from './harness-process.ts'
import { isExternalWebUrl, isHarnessUrl } from './security.ts'
import { pruneDanglingProfileFallback } from './profile-fallback.ts'

let harness: DesktopHarnessProcess | undefined
let mainWindow: BrowserWindow | undefined
let shutdownStarted = false

function focusMainWindow(): void {
  if (mainWindow === undefined) return
  if (mainWindow.isMinimized()) mainWindow.restore()
  mainWindow.show()
  mainWindow.focus()
}

async function openExternal(candidate: string): Promise<void> {
  if (isExternalWebUrl(candidate)) await shell.openExternal(candidate)
}

function createMainWindow(url: string): BrowserWindow {
  const harnessOrigin = new URL(url).origin
  const window = new BrowserWindow({
    title: 'DeepSeek Harness',
    width: 1440,
    height: 960,
    minWidth: 960,
    minHeight: 640,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#0b0f14',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  })

  window.webContents.setWindowOpenHandler(({ url: candidate }) => {
    if (isHarnessUrl(candidate, harnessOrigin)) void window.loadURL(candidate)
    else void openExternal(candidate)
    return { action: 'deny' }
  })
  window.webContents.on('will-navigate', (event, candidate) => {
    if (isHarnessUrl(candidate, harnessOrigin)) return
    event.preventDefault()
    void openExternal(candidate)
  })
  window.once('ready-to-show', () => { window.show() })
  window.on('closed', () => {
    if (mainWindow === window) mainWindow = undefined
  })
  void window.loadURL(url)
  return window
}

async function boot(): Promise<void> {
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => {
    callback(false)
  })
  process.chdir(app.getPath('home'))
  const dshHome = process.env.DSH_HOME?.trim() || join(app.getPath('home'), '.dsh')
  const removedFallbacks = pruneDanglingProfileFallback(dshHome)
  if (removedFallbacks > 0) console.log(`desktop: removed ${String(removedFallbacks)} stale profile module link(s)`)
  harness = await startDesktopHarnessProcess({
    nodeExecutable: desktopNodeExecutable(app.isPackaged, process.resourcesPath),
    cwd: app.getPath('home'),
  })
  mainWindow = createMainWindow(harness.url)
}

async function shutdown(): Promise<void> {
  if (shutdownStarted) return
  shutdownStarted = true
  try {
    await harness?.stop()
  } finally {
    app.exit(0)
  }
}

if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', () => { focusMainWindow() })
  app.on('activate', () => {
    if (mainWindow === undefined && harness !== undefined) mainWindow = createMainWindow(harness.url)
    else focusMainWindow()
  })
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })
  app.on('before-quit', (event) => {
    if (shutdownStarted || harness === undefined) return
    event.preventDefault()
    void shutdown()
  })
  void app.whenReady().then(boot).catch((error: unknown) => {
    console.error(error)
    const message = error instanceof Error ? error.stack ?? error.message : String(error)
    dialog.showErrorBox('DeepSeek Harness failed to start', message)
    app.exit(1)
  })
}
