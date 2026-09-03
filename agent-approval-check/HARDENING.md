<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1.0.212

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1.0.212** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a) violation: A `${{ }}` GitHub Actions expression is interpolated directly inside a `run:` shell command string. The step runs `python "${{ github.action_path }}/agent_approval_check.py"`, embedding `${{ github.action_path }}` directly in the shell command. Per the script-injection check, ANY `${{ ... }}` expression directly inside a `run:` block is a finding, regardless of which context it reads from. The safe fix is to use the pre-set environment variable `$GITHUB_ACTION_PATH` instead: `python "$GITHUB_ACTION_PATH/agent_approval_check.py"`

Locations:

- `action.yml:57`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Replaced `${{ github.action_path }}` in the `run:` shell command at action.yml line 57 with the pre-set environment variable `$GITHUB_ACTION_PATH`. GitHub Actions automatically sets this variable to the same value, so behavior is unchanged but the expression is no longer interpolated directly into the shell string.

