# Agent Note: Projectless chat sessions

Status: implemented

English | [中文](2026-08-16-projectless-chat-sessions.zh.md)

## Problem

The Host wire already accepted `session.create` without a `workspaceId`, but the Web client treated “no Workspace” only as a locked navigation state. A user therefore had to register and select a directory before sending any message, even for ordinary conversation that did not belong to a project.

## Decision

Projectless chat is a real, ungrouped Session, not a synthetic Workspace and not a second conversation implementation.

- `WorkspaceRuntime.connectProjectless()` reuses a non-archived blank Session that is not accounted by any Workspace, or creates one with `session.create({})`. Concurrent connects share the same create promise.
- Initial selection opens projectless chat when both Session and recent Workspace are absent. The shared New Session action also preserves an ungrouped current Session as an explicit projectless mode; otherwise it falls back to projectless when it has no explicit, current, or recent Workspace target.
- The hero Workspace menu exposes an explicit **Projectless chat** entry. Projectless Sessions display that mode in the chip and remain visible through the existing **Ungrouped** sidebar projection.
- Switching from a blank Workspace Session to projectless chat uses the same draft and image handoff as switching between Workspaces.

The Host still supplies its configured default cwd to an unspecified-cwd Session. “Projectless” describes Workspace accounting and UI grouping; it does not create a separate tool sandbox or disable filesystem tools.

## Consequences

The composer is live for an ungrouped projectless Session and follows the same model/permission block semantics as any other real Session. Only the short state before a Session exists keeps the resident composer inert. Existing Workspace startup precedence and Workspace-specific blank reuse remain unchanged.

## Alternatives considered

- **Create a hidden synthetic Workspace** — rejected because it would pollute durable Workspace accounting and make a non-project look like a directory the user selected.
- **Keep the no-Session composer editable and create on first send** — rejected because the input machine, attachments, model selection, and scoped conversation controller are Session-owned; duplicating their pre-Session state would create a second lifecycle and a risky handoff boundary.
- **Build a separate text-only chat runtime** — rejected because projectless conversation needs the same history, streaming, model, permission, and persistence behavior as every other Session.

## Verification

Runtime tests cover projectless blank reuse, archive exclusion, empty-registry startup, and New Session fallback. UI tests cover the picker entry, ungrouped composer posture, explicit switching, and draft transfer.
