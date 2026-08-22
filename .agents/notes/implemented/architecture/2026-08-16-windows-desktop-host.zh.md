# Agent Note: Windows 桌面宿主与 Harness 运行时隔离

Status: implemented

[English](2026-08-16-windows-desktop-host.md) | 中文

## Problem

DeepSeek Harness 已提供浏览器 UI，但没有可安装的桌面入口。直接在 Electron 主进程中复用 Web profile 并不安全：Electron 内嵌的 Node.js loader 不暴露现有 Cordis loader 所需的内部 ESM loader seam，Electron 的原生模块 ABI 也不同于 CLI 运行时的 ABI。

## Decision

`custom/desktop` 是 Windows Electron 宿主。它的主进程在独立标准 Node.js 进程中启动私有入口 `apps/cli/lib/desktop-child.js`。子进程在 `127.0.0.1` 上以端口 `0` 启动随附的 `web` profile，通过单行就绪消息报告实际源，并接受 IPC 关闭消息。Electron 只在收到就绪消息后加载该源，并在退出前等待子进程完成资源释放。

Windows 包内包含执行打包构建时所用的同一个 `node.exe`。打包准备步骤还会暂存所有构建后的 `@deepseek-ai` 工作区包并将其合并进应用；这是因为 electron-builder 的 pnpm 收集器会忽略传递对等依赖，而 Harness 插件图有意使用对等依赖来共享 Cordis 运行时上下文。应用不放入 ASAR，因为外部 Node.js 进程必须通过普通文件系统路径读取打包后的 JavaScript 和依赖树。

渲染器启用沙箱和上下文隔离，禁用 Node.js 集成，并拒绝所有权限请求。导航仅限当前回环源；外部 HTTP 和 HTTPS 链接交给操作系统处理，其他 URL scheme 则被拒绝。

## Alternatives considered

- **在 Electron 主进程中运行 Harness** — 这种方案不需要子进程，但无法使用内部 ESM loader 时，Cordis 包解析会退回错误的模块基准路径，而且原生依赖必须改为 Electron ABI。
- **要求系统安装 Node.js** — 这种方案可减小包体积，但安装后的桌面应用是否能启动将取决于用户的 `PATH` 和本地运行时版本，而不是自带经过测试的运行时。
- **复制 Web UI，制作桌面专用前端** — 这种方案不需要本地服务，但会分叉产品行为，并要求为每项现有宿主功能实现第二套传输层。

## Consequences

- 桌面入口和浏览器入口共用 profile、持久化数据、插件和构建后的前端，无需实现第二套产品。
- Electron 保持为狭窄的信任边界，不加载完整 Harness 依赖图及其原生模块。
- Windows 包会更大，因为其中包含 Electron、Node.js 和未压入归档的应用依赖树。
- 子进程就绪解析器与导航策略由聚焦单元测试覆盖。源码启动成功和打包后可执行文件启动成功仍是验证运行时依赖闭包的冒烟测试。
