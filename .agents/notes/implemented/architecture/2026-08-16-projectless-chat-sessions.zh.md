# Agent Note：无项目纯聊天会话

状态：已实现

[English](2026-08-16-projectless-chat-sessions.md) | 中文

## 问题

Host 协议原本就允许 `session.create` 不携带 `workspaceId`，但 Web 客户端只把“没有工作区”当作锁定的导航状态。因此，即使只是进行不属于任何项目的普通对话，用户也必须先注册并选择目录才能发送消息。

## 决策

纯聊天是一个真实的、未分组的 Session；它既不是伪造的 Workspace，也不是第二套对话实现。

- `WorkspaceRuntime.connectProjectless()` 会复用未归属于任何 Workspace 且未归档的空白 Session；找不到时通过 `session.create({})` 创建。并发连接共用同一个创建 Promise。
- 初始选择在既没有 Session、也没有最近 Workspace 时打开纯聊天。共享的“新会话”动作也会把未分组的当前 Session 保留为明确的纯聊天模式；在没有显式、当前或最近 Workspace 目标时同样回退到纯聊天。
- 首屏的工作区菜单提供明确的**纯聊天**入口。纯聊天 Session 会在标签中显示该模式，并通过现有侧边栏投影出现在**未分组**中。
- 从空白的 Workspace Session 切换到纯聊天时，使用与 Workspace 之间切换相同的草稿和图片交接逻辑。

Host 仍会为未指定 cwd 的 Session 提供其配置的默认 cwd。“无项目”描述的是 Workspace 归属与界面分组，不会建立独立的工具沙箱，也不会禁用文件系统工具。

## 结果

未分组的纯聊天 Session 使用可输入的 composer，并遵循与其他真实 Session 相同的模型和权限阻塞语义。只有 Session 尚未建立的短暂阶段会锁定常驻 composer。原有 Workspace 启动优先级和 Workspace 空白会话复用规则保持不变。

## 考虑过的替代方案

- **创建隐藏的伪 Workspace**——否决，因为它会污染持久 Workspace 归属，并把非项目对话伪装成用户选择过的目录。
- **让无 Session 的 composer 可编辑，并在首次发送时创建**——否决，因为输入状态机、附件、模型选择和按 scope 寻址的 conversation controller 都由 Session 拥有；复制一套建立 Session 前的状态会引入第二套生命周期和高风险交接边界。
- **建立独立的纯文本聊天运行时**——否决，因为纯聊天仍需要与其他 Session 相同的历史、流式输出、模型、权限与持久化行为。

## 验证

运行时测试覆盖纯聊天空白会话复用、归档排除、空注册表启动和“新会话”兜底；UI 测试覆盖菜单入口、未分组 composer 状态、显式切换和草稿转移。
