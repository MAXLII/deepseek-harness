# 无项目纯聊天定制

[English](README.md) | 中文

本目录记录由 MAXLII 维护的无项目纯聊天集成。该功能使用 Harness 现有的会话与工作区服务，因此少量接入点仍位于上游包目录中；可以独立部署的桌面应用则位于 [`custom/desktop`](../desktop/README.zh.md)。

## 上游接入点

- `packages/client/runtime` 在不要求工作区的情况下创建并复用未分组的空白会话。
- `packages/client/ui-workspace` 在工作区选择器中提供纯聊天目标。
- `packages/client/ui-conversation` 在对话外壳中保持纯聊天会话处于活动状态。
- `packages/extensions/cordis-client-runner` 发布对应的 UI owner 字段。
- `apps/web/tests` 验证未选择工作区时的启动行为。

将上游合并到 `custom` 分支后，请运行根变更中对应的聚焦测试，并且仅在这些接入点处理冲突。桌面实现与打包仍和上游的 `apps/` 目录隔离。
