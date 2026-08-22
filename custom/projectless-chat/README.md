# Projectless chat customization

English | [中文](README.zh.md)

This directory records the MAXLII-owned projectless-chat integration. The behavior uses existing Harness session and workspace services, so its small integration points remain in the upstream package tree while the independently deployable desktop application lives under [`custom/desktop`](../desktop/README.md).

## Upstream integration points

- `packages/client/runtime` creates and reuses an ungrouped blank session without requiring a workspace.
- `packages/client/ui-workspace` exposes the projectless target in the workspace picker.
- `packages/client/ui-conversation` keeps the projectless session active in the conversation shell.
- `packages/extensions/cordis-client-runner` publishes the corresponding UI owner fields.
- `apps/web/tests` verifies startup without a selected workspace.

After merging upstream into the `custom` branch, run the focused tests named in the root change and resolve conflicts only at these integration points. The desktop implementation and packaging remain isolated from the upstream `apps/` tree.
