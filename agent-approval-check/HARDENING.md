<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1.0.224

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1.0.224** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a) violation: A ${{ ... }} expression is directly interpolated inside a `run:` shell command string. The step runs `python "${{ github.action_path }}/agent_approval_check.py"`, embedding the `github.action_path` context value directly into the shell command before the shell ever sees it. Per the check rules, any `${{ ... }}` expression inside a `run:` block is a script-injection finding regardless of which context it reads from. The safe alternative is to use the pre-set `$GITHUB_ACTION_PATH` environment variable instead: `python "$GITHUB_ACTION_PATH/agent_approval_check.py"`.

Locations:

- `action.yml:57`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Replaced `${{ github.action_path }}` in the `run:` shell command with the pre-set `$GITHUB_ACTION_PATH` environment variable. GitHub Actions automatically sets `GITHUB_ACTION_PATH` to the same value as `github.action_path`, so runtime behavior is identical but the expression is no longer interpolated directly into the shell command string.

