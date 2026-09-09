<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1.0.218

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1.0.218** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a) violation: A `${{ ... }}` expression is interpolated directly inside a `run:` shell command string. The step runs: `python "${{ github.action_path }}/agent_approval_check.py"` — the `github.action_path` context value is substituted into the shell command before the shell ever sees it. Any `${{ ... }}` expression directly inside a `run:` block is a script-injection risk regardless of which context it reads from. The safe alternative is to use the pre-set environment variable `$GITHUB_ACTION_PATH` instead of `${{ github.action_path }}`.

Locations:

- `action.yml:57`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Fixed script injection in action.yml line 57: replaced `python "${{ github.action_path }}/agent_approval_check.py"` with `python "$GITHUB_ACTION_PATH/agent_approval_check.py"`. The `$GITHUB_ACTION_PATH` environment variable is pre-set by GitHub Actions and is the safe, idiomatic way to reference the action's directory without interpolating a `${{ }}` expression into the shell command string.

