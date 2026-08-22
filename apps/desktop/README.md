# DeepSeek Harness desktop app

English | [中文](README.zh.md)

This package provides the Windows desktop host for DeepSeek Harness. Electron owns the native window while a bundled standard Node.js process runs the existing `web` profile on an operating-system-assigned loopback port. The app uses the same Harness home, profiles, settings, workspaces, and sessions as the CLI and browser UI.

## Run from source

From the repository root, install dependencies and build the complete product before starting the app:

```powershell
pnpm install
pnpm desktop
```

The desktop app permits only its active `127.0.0.1` origin in the embedded window. HTTP and HTTPS links to other origins open in the operating system's default browser. The renderer has no Node.js integration, and browser permission requests are denied.

## Build for Windows

Create an unpacked x64 application directory:

```powershell
pnpm desktop:pack:win
```

Create an x64 NSIS installer with Start menu and desktop shortcuts:

```powershell
pnpm desktop:dist:win
```

Artifacts are written under `apps/desktop/dist/`. Packaging copies the Node.js executable used for the build into the application, so the installed desktop app does not depend on Node.js being installed or available on `PATH`.

## Development override

Source runs use `node` from `PATH` by default. Set `DSH_DESKTOP_NODE` to an absolute Node.js executable path when a different compatible runtime is required.
