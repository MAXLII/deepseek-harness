# DeepSeek Harness 桌面应用

[English](README.md) | 中文

本包提供 DeepSeek Harness 的 Windows 桌面宿主。Electron 负责原生窗口，随应用打包的标准 Node.js 进程则在操作系统分配的回环端口上运行现有 `web` profile。该应用与 CLI（命令行界面）和浏览器 UI 共用 Harness 主目录、profile、设置、工作区和会话。

## 从源码运行

在仓库根目录安装依赖并构建完整产品，然后启动应用：

```powershell
pnpm install
pnpm desktop
```

桌面应用只允许当前 `127.0.0.1` 源在内嵌窗口中打开。指向其他源的 HTTP 和 HTTPS 链接会交给操作系统默认浏览器。渲染器不集成 Node.js，并拒绝浏览器权限请求。

## Windows 构建

创建解包后的 x64 应用目录：

```powershell
pnpm desktop:pack:win
```

创建带开始菜单和桌面快捷方式的 x64 NSIS 安装程序：

```powershell
pnpm desktop:dist:win
```

产物写入 `apps/desktop/dist/`。打包过程会把执行构建时使用的 Node.js 可执行文件复制进应用，因此安装后的桌面应用不依赖系统另行安装 Node.js，也不要求 `PATH` 中存在 Node.js。

## 开发覆盖项

源码运行默认使用 `PATH` 中的 `node`。需要改用其他兼容运行时时，可将 `DSH_DESKTOP_NODE` 设为 Node.js 可执行文件的绝对路径。
