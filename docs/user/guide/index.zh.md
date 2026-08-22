# 使用 Web UI

[English](index.md) | 中文

请先按照[根目录 README](../../../README.zh.md#run) 中的说明启动 Web UI；命令会打印其访问地址。本指南从服务器已经运行的状态开始。`dsh` 进程会把启动时所在的目录作为默认文件系统位置。

## 配置模型

打开**设置 → 模型**，输入 [DeepSeek API 密钥](https://platform.deepseek.com/)并保存。模型路由会立即可用，不需要重启服务器。

[模型配置指南](./providers.zh.md)介绍其他提供方和自定义 OpenAI 兼容端点。

## 开始纯聊天或选择工作区

你无需添加项目即可开始对话。没有任何工作区时，Web UI 会自动打开一个可复用的**纯聊天**会话。你也可以随时打开工作区菜单并选择**纯聊天（不使用工作区）**；这类会话会显示在侧边栏的**未分组**中。

需要处理代码仓库时，点击工作区标签，添加启动 `dsh` 时所在的项目目录，然后选中它。纯聊天会话不归属于任何工作区，但工具需要工作目录时，agent 仍会使用 `dsh` 进程的默认文件系统位置。

## 运行任务

启动一个会话并发送：

> Summarize this repository and identify its main packages.

在工作区会话中，agent 可以读取和编辑项目文件、运行命令、委派工作并维护计划。当操作在当前权限策略下需要审批时，Web UI 会先询问你。

## 继续使用

- [配置模型](./providers.zh.md)
- [使用 Python SDK](./python-sdk.zh.md)
- [使用其他 CLI 模式](../../../apps/cli/README.zh.md)
- [开发插件](../develop/basic/index.zh.md)
