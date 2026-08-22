# Agent Note: Isolate the Windows desktop host from the Harness runtime

Status: implemented

English | [中文](2026-08-16-windows-desktop-host.zh.md)

## Problem

DeepSeek Harness has a browser UI but no installable desktop entry. Reusing the Web profile inside an Electron main process is unsafe as an implementation shortcut: Electron's embedded Node.js loader does not expose the internal ESM loader seam required by the existing Cordis loader, and Electron's native module ABI is not the CLI runtime's ABI.

## Decision

`apps/desktop` is a Windows Electron host. Its main process starts the private `apps/cli/lib/desktop-child.js` entry in a separate standard Node.js process. The child starts the shipped `web` profile on `127.0.0.1` with port `0`, reports the selected origin through a single readiness line, and accepts an IPC shutdown message. Electron loads that origin only after readiness and joins the child's graceful shutdown before exiting.

Windows packages include the same `node.exe` that ran the package build. A packaging preparation step also stages every built `@deepseek-ai` workspace package and merges them into the application because electron-builder's pnpm collector omits transitive peer dependencies, while the Harness plugin graph deliberately uses peers for shared Cordis runtime context. The application is left outside ASAR because the external Node.js process must read the packaged JavaScript and dependency tree through ordinary filesystem paths.

The renderer is sandboxed with context isolation, Node.js integration disabled, and all permission requests denied. Navigation stays on the active loopback origin; external HTTP and HTTPS links are handed to the operating system, and other URL schemes are rejected.

## Alternatives considered

- **Run Harness in the Electron main process** — this avoids a child process, but Cordis package resolution falls back to the wrong module base when the internal ESM loader is unavailable, and native dependencies would have to target Electron's ABI.
- **Require a system Node.js installation** — this keeps the package smaller, but an installed desktop app would fail according to the user's `PATH` and local runtime version rather than carrying its tested runtime.
- **Duplicate the Web UI as a desktop-specific frontend** — this would avoid a local server, but it would fork product behavior and require a second transport for every existing host capability.

## Consequences

- The desktop and browser entries share profiles, persisted data, plugins, and the built frontend without a second product implementation.
- Electron remains a narrow trust boundary and does not load the full Harness dependency graph or its native modules.
- Windows packages are larger because they contain Electron, Node.js, and an unpacked application dependency tree.
- The child readiness parser and navigation policy are covered by focused unit tests. A successful source launch and packaged executable launch remain the smoke tests for runtime dependency closure.
