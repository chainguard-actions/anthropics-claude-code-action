<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1.0.221

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1.0.221** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A GitHub Actions expression is interpolated directly inside a `run:` shell command string. Line 56 of action.yml contains: `run: python "${{ github.action_path }}/agent_approval_check.py"`. The `${{ github.action_path }}` expression is expanded by the Actions template engine before the shell ever sees the string, meaning a maliciously crafted value could inject arbitrary shell commands. The safe alternative is to use the pre-set `$GITHUB_ACTION_PATH` environment variable instead: `run: python "$GITHUB_ACTION_PATH/agent_approval_check.py"`.

Locations:

- `action.yml:56`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Replaced `${{ github.action_path }}` with `$GITHUB_ACTION_PATH` in the `run:` command on line 56 of action.yml. The `$GITHUB_ACTION_PATH` environment variable is set by the GitHub Actions runner and is safe to use directly in shell commands, whereas the `${{ github.action_path }}` expression is expanded by the Actions template engine before the shell sees the string, creating a potential injection vector.

