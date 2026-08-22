# Use the Web UI

English | [中文](index.zh.md)

Start the Web UI through the [root README](../../../README.md#run); the command prints its URL. This guide begins after that server is running. The `dsh` process uses its invoking directory as the default filesystem location.

## Configure a model

Open **Settings → Models**, enter a [DeepSeek API key](https://platform.deepseek.com/), and save it. The model route becomes usable immediately without restarting the server.

The [model configuration guide](./providers.md) covers other providers and custom OpenAI-compatible endpoints.

## Start projectless or choose a workspace

You can start chatting without adding a project. When no workspace exists, the Web UI opens a reusable **Projectless chat** session automatically. You can also open the workspace menu and choose **Projectless chat** at any time; these sessions appear under **Ungrouped** in the sidebar.

For repository work, click the workspace chip, add the project directory where you started `dsh`, and select it. Projectless sessions are not attached to a workspace, but the agent still uses the `dsh` process's default filesystem location when a tool needs a working directory.

## Run a task

Start a session and send:

> Summarize this repository and identify its main packages.

In a workspace session, the agent can read and edit project files, run commands, delegate work, and maintain a plan. The Web UI asks before operations that require approval under the active permission policy.

## Continue

- [Configure models](./providers.md)
- [Use the Python SDK](./python-sdk.md)
- [Use other CLI modes](../../../apps/cli/README.md)
- [Develop a plugin](../develop/basic/index.md)
