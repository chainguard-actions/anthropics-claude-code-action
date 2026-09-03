<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1.0.213

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1.0.213** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A ${{ }} expression is directly interpolated inside a run: shell command string. The step at line 54 of action.yml uses `run: python "${{ github.action_path }}/agent_approval_check.py"`, which injects the `github.action_path` context value directly into the shell command before the shell ever sees it. The safe pattern is to use the `$GITHUB_ACTION_PATH` environment variable instead (e.g., `run: python "$GITHUB_ACTION_PATH/agent_approval_check.py"`), which avoids template substitution in the shell command string entirely.

Locations:

- `action.yml:54`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Fixed script-injection in action.yml line 54: replaced `python "${{ github.action_path }}/agent_approval_check.py"` with `python "$GITHUB_ACTION_PATH/agent_approval_check.py"`. The $GITHUB_ACTION_PATH environment variable is automatically set by GitHub Actions and avoids template substitution in the shell command string, eliminating the injection risk.

